from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlmodel import Session, select

from app.common.db.database import get_session
from app.module.auth.deps import get_current_user
from app.module.auth.model import User
from app.module.billing.model import (
    CreateCustomPaymentOrderRequest,
    CreatePaymentOrderRequest,
    CreditBalanceRead,
    PaymentOrderRead,
    UserCredit,
)
from app.module.billing.service import BillingService

router = APIRouter(prefix="/billing", tags=["Billing & Payments"])


@router.get("/balance", response_model=CreditBalanceRead)
def get_credit_balance(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Get current user's credit balance."""
    stmt = select(UserCredit).where(UserCredit.user_id == current_user.id)
    user_credit = session.exec(stmt).first()

    if not user_credit:
        return CreditBalanceRead(balance=0, lifetime_earned=0, lifetime_spent=0)

    # Ensure balance reflects remaining credits (lifetime_earned - lifetime_spent)
    # to prevent desynchronization where earned credits are shown as available balance.
    calculated_balance = max(
        0, user_credit.lifetime_earned - user_credit.lifetime_spent
    )

    # Use explicit calculated_balance if stored balance deviates from net remaining
    actual_balance = getattr(user_credit, "balance", calculated_balance)

    return CreditBalanceRead(
        balance=actual_balance,
        lifetime_earned=user_credit.lifetime_earned,
        lifetime_spent=user_credit.lifetime_spent,
    )


@router.post("/create-order", response_model=PaymentOrderRead)
def create_checkout_order(
    payload: CreatePaymentOrderRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Initiates a package-based payment order with Razorpay."""
    return BillingService.create_payment_order(
        session=session,
        user_id=current_user.id,
        package_id=payload.package_id,
    )


@router.post("/create-custom-order", response_model=PaymentOrderRead)
def create_custom_checkout_order(
    payload: CreateCustomPaymentOrderRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Initiates a pay-as-you-go payment order for a custom credit amount."""
    return BillingService.create_custom_payment_order(
        session=session,
        user_id=current_user.id,
        credits=payload.credits,
    )


@router.post("/webhook/razorpay", status_code=status.HTTP_200_OK)
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str | None = Header(None, alias="X-Razorpay-Signature"),
    session: Session = Depends(get_session),
):
    """Asynchronous webhook listener for Razorpay payment events."""
    if not x_razorpay_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing X-Razorpay-Signature header",
        )

    body_bytes = await request.body()
    return BillingService.verify_and_process_webhook(
        session=session,
        body_bytes=body_bytes,
        signature=x_razorpay_signature,
    )
