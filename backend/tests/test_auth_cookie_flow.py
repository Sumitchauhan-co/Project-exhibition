from fastapi import Response

from app.module.auth.model import User, UserSignin
from app.module.auth.route import signin
from app.module.auth.service import AuthService


class DummySession:
    pass


def test_signin_sets_access_cookie(monkeypatch):
    user = User(
        id=42,
        email="user@example.com",
        full_name="Test User",
        is_active=True,
        is_superuser=False,
        hashed_password="hashed",
    )

    monkeypatch.setattr(
        AuthService,
        "authenticate_user",
        lambda session, email, password: user,
    )

    response = Response()
    result = signin(
        UserSignin(email="user@example.com", password="secret"),
        response,
        DummySession(),
    )

    set_cookie_header = response.headers.get("set-cookie", "")
    assert "access_token=" in set_cookie_header
    assert result.access_token
    assert result.refresh_token
