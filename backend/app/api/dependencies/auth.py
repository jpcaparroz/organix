import uuid
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import CredentialsException
from app.core.security import decode_access_token
from app.models.users import User
from app.api.dependencies.database import get_db
from app.services.user import UserService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_db),
) -> User:
    """Dependency that decodes token and fetches the current active user."""
    sub = decode_access_token(token)
    if not sub:
        raise CredentialsException("Could not validate credentials")

    try:
        user_uuid = uuid.UUID(sub)
    except ValueError:
        raise CredentialsException("Invalid token payload structure")

    user_service = UserService(session)
    try:
        user = await user_service.get_user(user_uuid)
    except Exception:
        raise CredentialsException("User associated with token not found")

    if not user.is_active:
        raise CredentialsException("User account is inactive")

    return user
