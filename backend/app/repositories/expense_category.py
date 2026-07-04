from typing import Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.models.expense_categories import ExpenseCategory
from app.repositories.base import BaseRepository


class ExpenseCategoryRepository(BaseRepository[ExpenseCategory]):
    def __init__(self, session: AsyncSession):
        super().__init__(ExpenseCategory, session)

    async def get_by_name(self, user_id: uuid.UUID, name: str) -> Optional[ExpenseCategory]:
        query = (
            select(ExpenseCategory)
            .where(ExpenseCategory.user_id == user_id)
            .where(ExpenseCategory.name == name)
            .where(ExpenseCategory.deleted_at == None)
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
