from typing import Optional
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.models.payment_methods import PaymentMethod
from app.repositories.base import BaseRepository


class PaymentMethodRepository(BaseRepository[PaymentMethod]):
    def __init__(self, session: AsyncSession):
        super().__init__(PaymentMethod, session)

    async def get_by_name(self, user_id: uuid.UUID, name: str) -> Optional[PaymentMethod]:
        query = (
            select(PaymentMethod)
            .where(PaymentMethod.user_id == user_id)
            .where(PaymentMethod.name == name)
            .where(PaymentMethod.deleted_at == None)
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
