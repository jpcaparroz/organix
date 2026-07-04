from typing import List
import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies.database import get_db
from app.api.dependencies.auth import get_current_user
from app.core.exceptions import ResourceNotFoundException, ValidationError
from app.models.users import User
from app.models.income_categories import IncomeCategory
from app.repositories.income_category import IncomeCategoryRepository
from app.schemas.income_categories import (
    IncomeCategoryCreate,
    IncomeCategoryRead,
    IncomeCategoryUpdate,
)

router = APIRouter()


@router.get("", response_model=List[IncomeCategoryRead])
async def list_categories(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Lists all active income categories for the authenticated user."""
    repo = IncomeCategoryRepository(session)
    return await repo.get_multi(user_id=current_user.user_id)


@router.post("", response_model=IncomeCategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_in: IncomeCategoryCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Creates a new income category if the name is unique for the user."""
    repo = IncomeCategoryRepository(session)
    existing = await repo.get_by_name(current_user.user_id, category_in.name)
    if existing:
        raise ValidationError(f"Income category '{category_in.name}' already exists")

    db_category = IncomeCategory(
        user_id=current_user.user_id,
        name=category_in.name,
        icon=category_in.icon,
        color_hex=category_in.color_hex,
    )
    return await repo.create(db_category)


@router.get("/{category_id}", response_model=IncomeCategoryRead)
async def get_category(
    category_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Fetches a specific income category."""
    repo = IncomeCategoryRepository(session)
    category = await repo.get(category_id, user_id=current_user.user_id)
    if not category:
        raise ResourceNotFoundException("Income Category")
    return category


@router.patch("/{category_id}", response_model=IncomeCategoryRead)
async def update_category(
    category_id: uuid.UUID,
    category_up: IncomeCategoryUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Updates an income category."""
    repo = IncomeCategoryRepository(session)
    category = await repo.get(category_id, user_id=current_user.user_id)
    if not category:
        raise ResourceNotFoundException("Income Category")

    if category_up.name and category_up.name != category.name:
        existing = await repo.get_by_name(current_user.user_id, category_up.name)
        if existing:
            raise ValidationError(f"Income category '{category_up.name}' already exists")

    return await repo.update(category, category_up)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Soft deletes an income category."""
    repo = IncomeCategoryRepository(session)
    category = await repo.get(category_id, user_id=current_user.user_id)
    if not category:
        raise ResourceNotFoundException("Income Category")
    await repo.soft_delete(category)
