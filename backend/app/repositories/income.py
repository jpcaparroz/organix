from datetime import date
from typing import List, Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.models.incomes import Income, IncomeStatus
from app.repositories.base import BaseRepository


class IncomeRepository(BaseRepository[Income]):
    def __init__(self, session: AsyncSession):
        super().__init__(Income, session)

    async def get_by_date_range(
        self,
        user_id: uuid.UUID,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        income_category_id: Optional[uuid.UUID] = None,
        status: Optional[IncomeStatus] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Income]:
        """Fetch incomes by date range and optional category or status filters."""
        query = select(Income).where(Income.user_id == user_id).where(Income.deleted_at == None)

        if start_date:
            query = query.where(Income.date >= start_date)
        if end_date:
            query = query.where(Income.date <= end_date)
        if income_category_id:
            query = query.where(Income.income_category_id == income_category_id)
        if status:
            query = query.where(Income.status == status)

        query = query.order_by(Income.date.desc()).offset(skip).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def count_by_date_range(
        self,
        user_id: uuid.UUID,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        income_category_id: Optional[uuid.UUID] = None,
        status: Optional[IncomeStatus] = None,
    ) -> int:
        """Count incomes matching filters."""
        from sqlmodel import func
        query = select(func.count()).select_from(Income).where(Income.user_id == user_id).where(Income.deleted_at == None)

        if start_date:
            query = query.where(Income.date >= start_date)
        if end_date:
            query = query.where(Income.date <= end_date)
        if income_category_id:
            query = query.where(Income.income_category_id == income_category_id)
        if status:
            query = query.where(Income.status == status)

        result = await self.session.execute(query)
        return result.scalar() or 0

    async def get_by_transaction_group(
        self, user_id: uuid.UUID, transaction_group_id: uuid.UUID
    ) -> List[Income]:
        """Fetch all incomes belonging to a specific transaction group."""
        query = (
            select(Income)
            .where(Income.user_id == user_id)
            .where(Income.transaction_group_id == transaction_group_id)
            .where(Income.deleted_at == None)
            .order_by(Income.date.asc())
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
