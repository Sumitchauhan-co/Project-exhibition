from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from sqlalchemy import CheckConstraint
from sqlmodel import Field, Relationship, SQLModel
from app.module.auth.model import User

# --- Enums ---


class TransactionType(str, Enum):
    PURCHASE = "purchase"  # Credits bought via payment
    USAGE = "usage"  # Credits spent on AI model evaluations
    REFUND = "refund"  # Credits returned to user
    BONUS = "bonus"  # Free promotional credits


class PaymentStatus(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"


# --- 1. User & Credit Models ---


class UserCreditBase(SQLModel):
    balance: int = Field(default=0, description="Current usable credit balance")
    lifetime_earned: int = Field(default=0, description="Total credits ever acquired")
    lifetime_spent: int = Field(default=0, description="Total credits ever spent")


class UserCredit(UserCreditBase, table=True):
    __tablename__ = "user_credits"
    __table_args__ = (
        CheckConstraint(
            "balance <= (lifetime_earned - lifetime_spent)",
            name="check_balance_integrity",
        ),
        CheckConstraint("balance >= 0", name="check_positive_balance"),
        CheckConstraint("lifetime_spent >= 0", name="check_positive_spent"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True, index=True)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: Optional["User"] = Relationship(back_populates="credit")


# --- 2. Credit Audit Ledger ---


class CreditTransactionBase(SQLModel):
    amount: int = Field(description="Positive for additions, negative for deductions")
    type: TransactionType = Field(index=True)
    description: Optional[str] = Field(
        default=None, description="e.g. 'RAG Eval Execution #1024'"
    )


class CreditTransaction(CreditTransactionBase, table=True):
    __tablename__ = "credit_transactions"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    payment_order_id: Optional[int] = Field(
        default=None, foreign_key="payment_orders.id"
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), index=True
    )

    user: Optional["User"] = Relationship()
    payment_order: Optional["PaymentOrder"] = Relationship()


# --- 3. Payment Gateway Orders ---


class PaymentOrderBase(SQLModel):
    amount_inr: float = Field(description="Actual money paid in INR")
    credits_purchased: int = Field(description="Number of credits bought in this order")
    gateway: str = Field(default="razorpay", description="razorpay, stripe, etc.")
    status: PaymentStatus = Field(default=PaymentStatus.PENDING, index=True)


class PaymentOrder(PaymentOrderBase, table=True):
    __tablename__ = "payment_orders"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    gateway_order_id: str = Field(
        unique=True,
        index=True,
        description="Razorpay order_id / Stripe session_id",
    )
    gateway_payment_id: Optional[str] = Field(
        default=None, description="Razorpay payment_id"
    )
    gateway_signature: Optional[str] = Field(
        default=None, description="Webhook signature verification"
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: Optional["User"] = Relationship()


# --- Request / Response DTOs ---


class CreditBalanceRead(SQLModel):
    balance: int
    lifetime_earned: int
    lifetime_spent: int


class CreatePaymentOrderRequest(SQLModel):
    package_id: str = Field(description="e.g., 'starter_pack', 'pro_pack'")


class CreateCustomPaymentOrderRequest(SQLModel):
    credits: int = Field(
        gt=0, description="Exact number of credits the user wants to purchase"
    )


class PaymentOrderRead(SQLModel):
    id: int
    gateway_order_id: str
    amount_inr: float
    credits_purchased: int
    status: PaymentStatus
    created_at: datetime


class PaymentWebhookPayload(SQLModel):
    gateway_order_id: str
    gateway_payment_id: str
    gateway_signature: str
