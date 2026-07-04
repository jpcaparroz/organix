import pytest
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token


def test_password_hashing():
    password = "secretpassword"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False


def test_jwt_tokens():
    subject = "user123"
    token = create_access_token(subject)
    assert isinstance(token, str)

    decoded = decode_access_token(token)
    assert decoded == subject


def test_invalid_jwt_token():
    assert decode_access_token("invalid.token.here") is None
