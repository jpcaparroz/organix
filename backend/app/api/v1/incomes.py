from datetime import date
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.users import User
from app.models.incomes import IncomeStatus
from app.schemas.incomes import (
    IncomeCreate,
    IncomeList,
    IncomeRead,
    IncomeUpdate,
)
from app.services.income import IncomeService

router = APIRouter()


@router.get("", response_model=IncomeList)
async def list_incomes(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_id: Optional[uuid.UUID] = None,
    status: Optional[IncomeStatus] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Lists incomes matching date ranges or category/status filters with count."""
    service = IncomeService(session)
    items = await service.list_incomes(
        user_id=current_user.user_id,
        start_date=start_date,
        end_date=end_date,
        income_category_id=category_id,
        status=status,
        skip=skip,
        limit=limit,
    )
    total = await service.count_incomes(
        user_id=current_user.user_id,
        start_date=start_date,
        end_date=end_date,
        income_category_id=category_id,
        status=status,
    )
    return IncomeList(items=items, total_count=total)


@router.post("", response_model=List[IncomeRead], status_code=status.HTTP_201_CREATED)
async def create_income(
    income_in: IncomeCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Creates one or multiple incomes (for installments)."""
    service = IncomeService(session)
    return await service.create_income(user_id=current_user.user_id, income_in=income_in)


@router.get("/{income_id}", response_model=IncomeRead)
async def get_income(
    income_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Retrieves a single income."""
    service = IncomeService(session)
    return await service.get_income(user_id=current_user.user_id, income_id=income_id)


@router.patch("/{income_id}", response_model=IncomeRead)
async def update_income(
    income_id: uuid.UUID,
    income_up: IncomeUpdate,
    update_type: str = Query(default="single", pattern="^(single|subsequent|all)$"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Updates an income installment chain."""
    service = IncomeService(session)
    return await service.update_income(
        user_id=current_user.user_id,
        income_id=income_id,
        income_up=income_up,
        update_type=update_type,
    )


@router.delete("/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_income(
    income_id: uuid.UUID,
    delete_type: str = Query(default="single", pattern="^(single|subsequent|all)$"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Soft deletes one or multiple installments of an income."""
    service = IncomeService(session)
    await service.delete_income(
        user_id=current_user.user_id, income_id=income_id, delete_type=delete_type
    )
