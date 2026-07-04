from datetime import date
from typing import List, Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.models.expenses import Expense, ExpenseStatus
from app.repositories.base import BaseRepository


class ExpenseRepository(BaseRepository[Expense]):
    def __init__(self, session: AsyncSession):
        super().__init__(Expense, session)

    async def get_by_date_range(
        self,
        user_id: uuid.UUID,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        expense_category_id: Optional[uuid.UUID] = None,
        status: Optional[ExpenseStatus] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Expense]:
        """Fetch expenses by date range and optional category or status filters."""
        query = select(Expense).where(Expense.user_id == user_id).where(Expense.deleted_at == None)

        if start_date:
            query = query.where(Expense.date >= start_date)
        if end_date:
            query = query.where(Expense.date <= end_date)
        if expense_category_id:
            query = query.where(Expense.expense_category_id == expense_category_id)
        if status:
            query = query.where(Expense.status == status)

        query = query.order_by(Expense.date.desc()).offset(skip).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def count_by_date_range(
        self,
        user_id: uuid.UUID,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        expense_category_id: Optional[uuid.UUID] = None,
        status: Optional[ExpenseStatus] = None,
    ) -> int:
        """Count expenses matching filters."""
        from sqlmodel import func
        query = select(func.count()).select_from(Expense).where(Expense.user_id == user_id).where(Expense.deleted_at == None)

        if start_date:
            query = query.where(Expense.date >= start_date)
        if end_date:
            query = query.where(Expense.date <= end_date)
        if expense_category_id:
            query = query.where(Expense.expense_category_id == expense_category_id)
        if status:
            query = query.where(Expense.status == status)

        result = await self.session.execute(query)
        return result.scalar() or 0

    async def get_by_transaction_group(
        self, user_id: uuid.UUID, transaction_group_id: uuid.UUID
    ) -> List[Expense]:
        """Fetch all expenses belonging to a specific transaction group."""
        query = (
            select(Expense)
            .where(Expense.user_id == user_id)
            .where(Expense.transaction_group_id == transaction_group_id)
            .where(Expense.deleted_at == None)
            .order_by(Expense.installment_current.asc())
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
