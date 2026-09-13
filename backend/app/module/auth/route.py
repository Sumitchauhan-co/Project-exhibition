from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlmodel import Session

from app.common.db.database import get_session
from app.module.auth.deps import get_current_user
from app.module.auth.model import (
    GoogleSignin,
    Token,
    User,
    UserRead,
    UserSignin,
    UserSignup,
)
from app.module.auth.service import AuthService
from app.module.auth.utils.token import (
    create_access_token,
    create_refresh_token,
    decode_token,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

COOKIE_PATH = "/"
COOKIE_SAMESITE = "none"
COOKIE_SECURE = True


def set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="refresh_token",
        value=token,
        httponly=True,
        max_age=7 * 24 * 60 * 60,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path=COOKIE_PATH,
    )


@router.post("/signup", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def signup(
    user_in: UserSignup,
    session: Session = Depends(get_session),
):
    existing = AuthService.get_user_by_email(session, user_in.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists.",
        )
    return AuthService.create_user(session, user_in)


@router.post("/signin", response_model=Token)
def signin(
    credentials: UserSignin,
    response: Response,
    session: Session = Depends(get_session),
):
    user = AuthService.authenticate_user(
        session, credentials.email, credentials.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    set_refresh_cookie(response, refresh_token)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/google", response_model=Token)
def google_auth(
    payload: GoogleSignin,
    response: Response,
    session: Session = Depends(get_session),
):
    """Verifies Google ID token, logs in or registers user, and sets cookies."""
    try:
        google_payload = AuthService.verify_google_token(payload.id_token)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token.",
        )

    user = AuthService.authenticate_or_create_google_user(session, google_payload)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account.",
        )

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)

    set_refresh_cookie(response, refresh_token)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/refresh", response_model=Token)
def refresh_token(
    response: Response,
    refresh_token: str | None = Cookie(default=None),
    session: Session = Depends(get_session),
):
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing from cookies.",
        )

    payload = decode_token(refresh_token, token_type="refresh")
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token.",
        )

    user_id = payload.get("sub")
    user = AuthService.get_user_by_id(session, int(user_id))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User inactive or missing.",
        )

    new_access_token = create_access_token(user.id)
    new_refresh_token = create_refresh_token(user.id)

    set_refresh_cookie(response, new_refresh_token)

    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
    )


@router.post("/signout")
def signout(response: Response):
    """Clears the refresh token cookie on signout."""
    response.delete_cookie(
        key="refresh_token",
        path=COOKIE_PATH,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        httponly=True,
    )
    return {"message": "Successfully signed out"}


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    """Protected route returning active authenticated user data."""
    return current_user
