from datetime import date
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.users import User
from app.models.expenses import ExpenseStatus
from app.schemas.expenses import (
    ExpenseCreate,
    ExpenseList,
    ExpenseRead,
    ExpenseUpdate,
)
from app.services.expense import ExpenseService

router = APIRouter()


@router.get("", response_model=ExpenseList)
async def list_expenses(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    category_id: Optional[uuid.UUID] = None,
    status: Optional[ExpenseStatus] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Lists expenses matching date ranges or category/status filters with count."""
    service = ExpenseService(session)
    items = await service.list_expenses(
        user_id=current_user.user_id,
        start_date=start_date,
        end_date=end_date,
        expense_category_id=category_id,
        status=status,
        skip=skip,
        limit=limit,
    )
    total = await service.count_expenses(
        user_id=current_user.user_id,
        start_date=start_date,
        end_date=end_date,
        expense_category_id=category_id,
        status=status,
    )
    return ExpenseList(items=items, total_count=total)


@router.post("", response_model=List[ExpenseRead], status_code=status.HTTP_201_CREATED)
async def create_expense(
    expense_in: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Creates one or multiple expenses (for installments)."""
    service = ExpenseService(session)
    return await service.create_expense(user_id=current_user.user_id, expense_in=expense_in)


@router.get("/{expense_id}", response_model=ExpenseRead)
async def get_expense(
    expense_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Retrieves a single expense."""
    service = ExpenseService(session)
    return await service.get_expense(user_id=current_user.user_id, expense_id=expense_id)


@router.patch("/{expense_id}", response_model=ExpenseRead)
async def update_expense(
    expense_id: uuid.UUID,
    expense_up: ExpenseUpdate,
    update_type: str = Query(default="single", pattern="^(single|subsequent|all)$"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Updates an expense installment chain (single, subsequent, or all)."""
    service = ExpenseService(session)
    return await service.update_expense(
        user_id=current_user.user_id,
        expense_id=expense_id,
        expense_up=expense_up,
        update_type=update_type,
    )


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense_id: uuid.UUID,
    delete_type: str = Query(default="single", pattern="^(single|subsequent|all)$"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Soft deletes one or multiple installments of an expense."""
    service = ExpenseService(session)
    await service.delete_expense(
        user_id=current_user.user_id, expense_id=expense_id, delete_type=delete_type
    )
