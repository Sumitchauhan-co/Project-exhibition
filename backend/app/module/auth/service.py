from typing import Optional
from sqlmodel import Session, select
from app.module.auth.model import User, UserSignup
from app.module.auth.utils.token import hash_password, verify_password
from app.module.billing.service import BillingService


class AuthService:
    @staticmethod
    def get_user_by_email(session: Session, email: str) -> Optional[User]:
        return session.exec(select(User).where(User.email == email)).first()

    @staticmethod
    def get_user_by_id(session: Session, user_id: int) -> Optional[User]:
        return session.get(User, user_id)

    @staticmethod
    def create_user(session: Session, user_create: UserSignup) -> User:
        db_user = User(
            email=user_create.email,
            full_name=user_create.full_name,
            hashed_password=hash_password(user_create.password),
            is_active=user_create.is_active,
            is_superuser=user_create.is_superuser,
        )
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        BillingService.grant_onboarding_credits(session, db_user.id)
        session.commit()
        return db_user

    @staticmethod
    def authenticate_user(
        session: Session, email: str, password: str
    ) -> Optional[User]:
        user = AuthService.get_user_by_email(session, email)
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user
