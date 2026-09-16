import hashlib
import hmac
import json
import math
import os
from typing import Any, Dict, List, Optional

import razorpay
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.common.utils.config import (
    RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET,
)
from app.module.billing.model import (
    CreditTransaction,
    PaymentOrder,
    PaymentStatus,
    TransactionType,
    UserCredit,
)
from app.module.billing.pricing import (
    BASE_EVALUATION_COST,
    BASE_FILE_SIZE_BYTES,
    EMBEDDING_COST_MULTIPLIERS,
    INITIAL_ONBOARDING_CREDITS,
    LLM_COST_MULTIPLIERS,
    PROFIT_MARGIN_MULTIPLIER,
    STRATEGY_COST_MULTIPLIERS,
)


def get_razorpay_client() -> razorpay.Client:
    """Build the Razorpay client from current environment or fallback config."""
    key_id = (os.getenv("RAZORPAY_KEY_ID") or RAZORPAY_KEY_ID or "").strip()
    key_secret = (os.getenv("RAZORPAY_KEY_SECRET") or RAZORPAY_KEY_SECRET or "").strip()

    if not key_id or not key_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Razorpay credentials are not configured.",
        )

    return razorpay.Client(auth=(key_id, key_secret))


# Preset credit packages (INR to Credits mapping)
CREDIT_PACKAGES: Dict[str, Dict[str, Any]] = {
    "starter_pack": {"amount_inr": 100, "credits": 1000},
    "pro_pack": {"amount_inr": 500, "credits": 6000},
    "enterprise_pack": {"amount_inr": 2000, "credits": 30000},
}

CUSTOM_CREDIT_RATE_PAISE_PER_CREDIT = 10  # 0.10 INR = 10 Paise
MINIMUM_CUSTOM_CREDITS = 100

# Keep the service-level reference in sync with the isolated pricing module.
INITIAL_ONBOARDING_CREDITS = INITIAL_ONBOARDING_CREDITS


class BillingService:
    INITIAL_ONBOARDING_CREDITS = INITIAL_ONBOARDING_CREDITS

    @staticmethod
    def get_or_create_user_credit(session: Session, user_id: int) -> UserCredit:
        """Fetch or safely initialize user credit balance with atomic lock."""
        stmt = select(UserCredit).where(UserCredit.user_id == user_id).with_for_update()
        user_credit = session.exec(stmt).first()
        if user_credit is not None:
            return user_credit

        user_credit = UserCredit(
            user_id=user_id,
            balance=BillingService.INITIAL_ONBOARDING_CREDITS,
            lifetime_earned=BillingService.INITIAL_ONBOARDING_CREDITS,
            lifetime_spent=0,
        )
        try:
            session.add(user_credit)
            session.flush()
        except IntegrityError:
            session.rollback()
            user_credit = session.exec(stmt).first()

        return user_credit

    @staticmethod
    def estimate_evaluation_cost(
        file_size_bytes: int,
        selected_strategies: Optional[List[str]] = None,
        selected_llms: Optional[List[str]] = None,
        selected_embeddings: Optional[List[str]] = None,
    ) -> int:
        """Estimate evaluation cost in credits using compounding factors for profitability."""
        if file_size_bytes <= 0:
            return 0

        strategies = selected_strategies or ["token"]
        llms = selected_llms or ["gemma4:31b-cloud"]
        embeddings = selected_embeddings or ["qwen3-embedding:latest"]

        size_factor = max(1.0, file_size_bytes / BASE_FILE_SIZE_BYTES)

        strategy_multiplier = math.prod(
            STRATEGY_COST_MULTIPLIERS.get(s, 1.0) for s in strategies
        )
        llm_multiplier = math.prod(
            LLM_COST_MULTIPLIERS.get(model, 1.2) for model in llms
        )
        embedding_multiplier = math.prod(
            EMBEDDING_COST_MULTIPLIERS.get(model, 1.2) for model in embeddings
        )

        estimated = (
            size_factor
            * max(1.0, strategy_multiplier)
            * max(1.0, llm_multiplier)
            * max(1.0, embedding_multiplier)
            * BASE_EVALUATION_COST
            * PROFIT_MARGIN_MULTIPLIER
        )
        return max(1, math.ceil(estimated))

    @staticmethod
    def ensure_sufficient_balance(
        session: Session,
        user_id: int,
        required_credits: int,
        context: str,
    ) -> UserCredit:
        user_credit = BillingService.get_or_create_user_credit(session, user_id)
        if required_credits <= 0:
            return user_credit

        if user_credit.balance < required_credits:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail={
                    "message": "Insufficient credits available. Please add credits to continue.",
                    "required_credits": required_credits,
                    "available_credits": user_credit.balance,
                    "redirect_to": "/payment",
                    "context": context,
                },
            )

        return user_credit

    @staticmethod
    def reserve_credits_for_evaluation(
        session: Session,
        user_id: int,
        required_credits: int,
        context: str,
    ) -> UserCredit:
        user_credit = BillingService.ensure_sufficient_balance(
            session,
            user_id,
            required_credits,
            context,
        )

        user_credit.balance -= required_credits
        user_credit.lifetime_spent += required_credits
        session.add(user_credit)
        session.add(
            CreditTransaction(
                user_id=user_id,
                payment_order_id=None,
                amount=-required_credits,
                type=TransactionType.USAGE,
                description=f"Evaluation cost reserved: {context} ({required_credits} credits)",
            )
        )
        session.commit()
        session.refresh(user_credit)
        return user_credit

    @staticmethod
    def refund_credits_for_evaluation(
        session: Session,
        user_id: int,
        required_credits: int,
        context: str,
    ) -> UserCredit:
        user_credit = BillingService.get_or_create_user_credit(session, user_id)

        # Preventing balance from exceeding (lifetime_earned - lifetime_spent)
        refundable_amount = min(required_credits, user_credit.lifetime_spent)

        if refundable_amount <= 0:
            # Nothing was previously deducted, abort refund to prevent free credit generation
            return user_credit

        user_credit.balance += refundable_amount
        user_credit.lifetime_spent -= refundable_amount

        session.add(user_credit)
        session.add(
            CreditTransaction(
                user_id=user_id,
                payment_order_id=None,
                amount=refundable_amount,
                type=TransactionType.REFUND,
                description=f"Refunded reserved credits: {context} ({refundable_amount} credits)",
            )
        )
        session.commit()
        session.refresh(user_credit)
        return user_credit

    @staticmethod
    def grant_onboarding_credits(session: Session, user_id: int) -> UserCredit:
        """Grant onboarding credits safely only if user has never earned any credits before."""
        user_credit = BillingService.get_or_create_user_credit(session, user_id)
        if user_credit.lifetime_earned > 0:
            return user_credit

        user_credit.balance += BillingService.INITIAL_ONBOARDING_CREDITS
        user_credit.lifetime_earned += BillingService.INITIAL_ONBOARDING_CREDITS
        session.add(
            CreditTransaction(
                user_id=user_id,
                payment_order_id=None,
                amount=BillingService.INITIAL_ONBOARDING_CREDITS,
                type=TransactionType.BONUS,
                description="Onboarding credit grant",
            )
        )
        session.commit()
        session.refresh(user_credit)
        return user_credit

    @staticmethod
    def _create_razorpay_order(
        session: Session,
        user_id: int,
        amount_inr: float,
        credits_purchased: int,
        notes: Dict[str, Any],
    ) -> PaymentOrder:
        """Internal helper to create order via Razorpay API using precise integer paise."""
        if user_id <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user_id for payment order creation.",
            )
        if amount_inr <= 0 or credits_purchased <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment amount and credits must be positive values.",
            )

        amount_in_paise = int(round(amount_inr * 100))
        if amount_in_paise <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Razorpay amount must be at least 1 paise.",
            )

        order_notes = {"user_id": str(user_id)}
        order_notes.update(notes)

        try:
            client = get_razorpay_client()
            razorpay_order = client.order.create(
                {
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "payment_capture": 1,
                    "notes": order_notes,
                }
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Razorpay order creation failed: {str(e)}",
            )

        gateway_order_id = razorpay_order.get("id")
        if not gateway_order_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Razorpay returned an empty order id.",
            )

        order = PaymentOrder(
            user_id=user_id,
            gateway="razorpay",
            gateway_order_id=gateway_order_id,
            amount_inr=amount_inr,
            credits_purchased=credits_purchased,
            status=PaymentStatus.PENDING,
        )
        session.add(order)
        session.commit()
        session.refresh(order)
        return order

    @staticmethod
    def create_payment_order(
        session: Session, user_id: int, package_id: str
    ) -> PaymentOrder:
        if package_id not in CREDIT_PACKAGES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid package_id. Choose from: {list(CREDIT_PACKAGES.keys())}",
            )

        pkg = CREDIT_PACKAGES[package_id]
        if pkg["amount_inr"] <= 0 or pkg["credits"] <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid package configuration. Contact support.",
            )

        return BillingService._create_razorpay_order(
            session=session,
            user_id=user_id,
            amount_inr=pkg["amount_inr"],
            credits_purchased=pkg["credits"],
            notes={"package_id": package_id},
        )

    @staticmethod
    def create_custom_payment_order(
        session: Session, user_id: int, credits: int
    ) -> PaymentOrder:
        if credits < MINIMUM_CUSTOM_CREDITS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Minimum custom credit purchase is {MINIMUM_CUSTOM_CREDITS} credits.",
            )
        if credits > 100_000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Custom credit purchase exceeds the allowed limit.",
            )

        amount_in_paise = credits * CUSTOM_CREDIT_RATE_PAISE_PER_CREDIT
        amount_inr = amount_in_paise / 100.0

        return BillingService._create_razorpay_order(
            session=session,
            user_id=user_id,
            amount_inr=amount_inr,
            credits_purchased=credits,
            notes={"type": "custom_credits", "requested_credits": str(credits)},
        )

    @staticmethod
    def verify_and_process_webhook(
        session: Session, body_bytes: bytes, signature: Optional[str]
    ) -> dict:
        webhook_secret = (
            os.getenv("RAZORPAY_WEBHOOK_SECRET") or RAZORPAY_WEBHOOK_SECRET or ""
        ).strip()

        if not webhook_secret:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Razorpay webhook secret is not configured.",
            )

        if not signature:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing X-Razorpay-Signature header",
            )

        expected_signature = hmac.new(
            key=webhook_secret.encode("utf-8"),
            msg=body_bytes,
            digestmod=hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(expected_signature, signature):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid webhook signature",
            )

        try:
            payload = json.loads(body_bytes.decode("utf-8"))
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON payload",
            )

        event = payload.get("event")

        if event == "order.paid":
            payment_entity = (
                payload.get("payload", {}).get("payment", {}).get("entity", {})
            )
            order_entity = payload.get("payload", {}).get("order", {}).get("entity", {})

            if order_entity.get("id") and payment_entity.get("id"):
                BillingService._fulfill_order(
                    session,
                    order_entity["id"],
                    payment_entity["id"],
                )

        return {"status": "success"}

    @staticmethod
    def _fulfill_order(
        session: Session, gateway_order_id: str, gateway_payment_id: str
    ) -> None:
        # 1. Lock payment order
        stmt = (
            select(PaymentOrder)
            .where(PaymentOrder.gateway_order_id == gateway_order_id)
            .with_for_update()
        )
        order = session.exec(stmt).first()

        # Idempotency check: if order does not exist or was already processed
        if not order or order.status == PaymentStatus.SUCCESS:
            return

        # 2. Update order status
        order.status = PaymentStatus.SUCCESS
        order.gateway_payment_id = gateway_payment_id
        session.add(order)

        # 3. Lock user credit record
        credit_stmt = (
            select(UserCredit)
            .where(UserCredit.user_id == order.user_id)
            .with_for_update()
        )
        user_credit = session.exec(credit_stmt).first()

        if not user_credit:
            user_credit = UserCredit(
                user_id=order.user_id,
                balance=0,
                lifetime_earned=0,
                lifetime_spent=0,
            )

        # 4. Increment balance & lifetime stats
        user_credit.balance += order.credits_purchased
        user_credit.lifetime_earned += order.credits_purchased
        session.add(user_credit)

        # 5. Record transaction log
        session.add(
            CreditTransaction(
                user_id=order.user_id,
                payment_order_id=order.id,
                amount=order.credits_purchased,
                type=TransactionType.PURCHASE,
                description=(
                    f"Purchased {order.credits_purchased} credits via Razorpay "
                    f"({order.gateway_order_id})"
                ),
            )
        )
        session.commit()
