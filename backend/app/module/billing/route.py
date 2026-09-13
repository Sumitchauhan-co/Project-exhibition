from fastapi import APIRouter, Depends, Header, Request, status
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

    return CreditBalanceRead(
        balance=user_credit.balance,
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
    x_razorpay_signature: str = Header(None, alias="X-Razorpay-Signature"),
    session: Session = Depends(get_session),
):
    """Asynchronous webhook listener for Razorpay payment events."""
    body_bytes = await request.body()
    return BillingService.verify_and_process_webhook(
        session=session,
        body_bytes=body_bytes,
        signature=x_razorpay_signature,
    )
