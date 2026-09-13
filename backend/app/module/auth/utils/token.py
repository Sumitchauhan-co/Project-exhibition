import re
from datetime import datetime, timedelta, timezone
from typing import Any, Optional
import jwt
from passlib.context import CryptContext

from app.common.utils.config import (
    JWT_ACCESS_SECRET_TOKEN,
    JWT_REFRESH_SECRET_TOKEN,
    JWT_ACCESS_TOKEN_EXPIRY,
    JWT_REFRESH_TOKEN_EXPIRY,
    JWT_ALGORITHM,
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def parse_expiry_time(expiry_str: str) -> timedelta:
    """Parses environment expiry strings like '15m', '1h', or '7d' into timedelta."""
    match = re.match(r"^(\d+)\s*([mhdD])$", expiry_str.strip())
    if not match:
        raise ValueError(
            f"Invalid expiry format: '{expiry_str}'. Use format like '15m', '1h', or '7d'."
        )

    amount, unit = int(match.group(1)), match.group(2).lower()
    if unit == "m":
        return timedelta(minutes=amount)
    elif unit == "h":
        return timedelta(hours=amount)
    elif unit == "d":
        return timedelta(days=amount)

    return timedelta(minutes=15)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_token(data: dict, expires_delta: timedelta, secret_key: str) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, secret_key, algorithm=JWT_ALGORITHM)


def create_access_token(subject: str | Any) -> str:
    expires_delta = parse_expiry_time(JWT_ACCESS_TOKEN_EXPIRY)
    return create_token(
        data={"sub": str(subject), "type": "access"},
        expires_delta=expires_delta,
        secret_key=JWT_ACCESS_SECRET_TOKEN,
    )


def create_refresh_token(subject: str | Any) -> str:
    expires_delta = parse_expiry_time(JWT_REFRESH_TOKEN_EXPIRY)
    return create_token(
        data={"sub": str(subject), "type": "refresh"},
        expires_delta=expires_delta,
        secret_key=JWT_REFRESH_SECRET_TOKEN,
    )


def decode_token(token: str, token_type: str = "access") -> Optional[dict]:
    """
    Decodes and validates a token. Pass token_type='access' or 'refresh'
    to use the correct verification secret key.
    """
    secret_key = (
        JWT_REFRESH_SECRET_TOKEN
        if token_type.lower() == "refresh"
        else JWT_ACCESS_SECRET_TOKEN
    )
    try:
        payload = jwt.decode(token, secret_key, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
