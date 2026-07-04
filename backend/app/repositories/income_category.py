from typing import Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.models.income_categories import IncomeCategory
from app.repositories.base import BaseRepository


class IncomeCategoryRepository(BaseRepository[IncomeCategory]):
    def __init__(self, session: AsyncSession):
        super().__init__(IncomeCategory, session)

    async def get_by_name(self, user_id: uuid.UUID, name: str) -> Optional[IncomeCategory]:
        query = (
            select(IncomeCategory)
            .where(IncomeCategory.user_id == user_id)
            .where(IncomeCategory.name == name)
            .where(IncomeCategory.deleted_at == None)
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
