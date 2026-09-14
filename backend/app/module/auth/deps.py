from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from sqlmodel import Session

from app.common.db.database import get_session
from app.module.auth.model import User
from app.module.auth.service import AuthService
from app.module.auth.utils.token import decode_token


def get_current_user(request: Request, session: Session = Depends(get_session)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Read token from HttpOnly Cookie first, fallback to Authorization header
    token: Optional[str] = request.cookies.get("access_token")

    if token and token.startswith("Bearer "):
        token = token.split(" ", 1)[1]
    elif not token:
        # Fallback to Authorization Header if cookie isn't present
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]

    if not token:
        # Some browsers will preserve the token as a raw cookie value without the Bearer prefix.
        token = request.cookies.get("access_token")

    if not token:
        raise credentials_exception

    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise credentials_exception

    user_id = payload.get("sub")
    if not user_id:
        raise credentials_exception

    user = AuthService.get_user_by_id(session, int(user_id))
    if not user or not user.is_active:
        raise credentials_exception

    return user
