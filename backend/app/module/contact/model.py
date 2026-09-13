from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class ContactMessageBase(SQLModel):
    full_name: str = Field(index=True, description="Name of the person contacting us")
    email: str = Field(index=True, description="Email address of the contact")
    subject: str = Field(default="general", index=True, description="Message subject")
    message: str = Field(description="Actual message from the user")


class ContactMessage(ContactMessageBase, table=True):
    __tablename__ = "contact_messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        index=True,
    )


class ContactMessageCreate(SQLModel):
    full_name: str
    email: str
    subject: str = "general"
    message: str


class ContactMessageRead(ContactMessageBase):
    id: int
    created_at: datetime
