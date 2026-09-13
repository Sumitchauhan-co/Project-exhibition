from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.module.billing.model import UserCredit


class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    full_name: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    credit: Optional["UserCredit"] = Relationship(
        back_populates="user", sa_relationship_kwargs={"uselist": False}
    )


class UserSignup(UserBase):
    password: str


class UserSignin(SQLModel):
    email: str
    password: str


class GoogleSignin(SQLModel):
    id_token: str


class RefreshTokenRequest(SQLModel):
    refresh_token: str


class UserRead(UserBase):
    id: int
    created_at: datetime


class Token(SQLModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
