from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.users import User
from app.schemas.users import UserCreate, UserRead, Token
from app.services.user import UserService
from app.core.security import create_access_token

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, session: AsyncSession = Depends(get_db)):
    """Registers a new user."""
    user_service = UserService(session)
    return await user_service.create_user(user_in)


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: AsyncSession = Depends(get_db),
):
    """Logs in an existing user and returns an access JWT."""
    user_service = UserService(session)
    user = await user_service.authenticate(form_data.username, form_data.password)
    access_token = create_access_token(subject=user.user_id)
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)):
    """Fetches credentials and data for the currently authenticated user."""
    return current_user
