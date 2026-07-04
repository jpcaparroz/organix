from datetime import datetime, timezone
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import SQLModel, select, func

ModelType = TypeVar("ModelType", bound=SQLModel)


class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], session: AsyncSession):
        self.model = model
        self.session = session

    async def get(
        self, id: uuid.UUID, user_id: Optional[uuid.UUID] = None
    ) -> Optional[ModelType]:
        """Fetch a single record by ID, checking user_id and soft-delete."""
        pk_field = None
        for name, field_info in self.model.model_fields.items():
            if getattr(field_info, "primary_key", False):
                pk_field = name
                break
        if not pk_field:
            if self.model.__tablename__.endswith("categories"):
                pk_field = f"{self.model.__tablename__[:-10]}category_id"
            else:
                pk_field = f"{self.model.__tablename__.rstrip('s')}_id"

        query = select(self.model).where(getattr(self.model, pk_field) == id)
        if user_id and hasattr(self.model, "user_id"):
            query = query.where(self.model.user_id == user_id)
        if hasattr(self.model, "deleted_at"):
            query = query.where(self.model.deleted_at == None)

        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_multi(
        self,
        user_id: Optional[uuid.UUID] = None,
        *,
        skip: int = 0,
        limit: int = 100,
        include_deleted: bool = False,
        **filters,
    ) -> List[ModelType]:
        """Fetch multiple records, applying pagination, user isolation, and soft-delete filters."""
        query = select(self.model)
        if user_id and hasattr(self.model, "user_id"):
            query = query.where(self.model.user_id == user_id)
        if hasattr(self.model, "deleted_at") and not include_deleted:
            query = query.where(self.model.deleted_at == None)

        # Apply arbitrary keyword filters (e.g. status=ExpenseStatus.PENDING)
        for key, value in filters.items():
            if value is not None and hasattr(self.model, key):
                query = query.where(getattr(self.model, key) == value)

        query = query.offset(skip).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def count(
        self,
        user_id: Optional[uuid.UUID] = None,
        include_deleted: bool = False,
        **filters,
    ) -> int:
        """Count total matching records."""
        query = select(func.count()).select_from(self.model)
        if user_id and hasattr(self.model, "user_id"):
            query = query.where(self.model.user_id == user_id)
        if hasattr(self.model, "deleted_at") and not include_deleted:
            query = query.where(self.model.deleted_at == None)

        for key, value in filters.items():
            if value is not None and hasattr(self.model, key):
                query = query.where(getattr(self.model, key) == value)

        result = await self.session.execute(query)
        return result.scalar() or 0

    async def create(self, db_obj: ModelType) -> ModelType:
        """Persist a new entity instance."""
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def update(
        self, db_obj: ModelType, obj_in: Union[Dict[str, Any], SQLModel]
    ) -> ModelType:
        """Update fields of an existing entity instance."""
        obj_data = db_obj.model_dump()
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])

        if hasattr(db_obj, "updated_at"):
            setattr(db_obj, "updated_at", datetime.now(timezone.utc).replace(tzinfo=None))

        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def soft_delete(self, db_obj: ModelType) -> ModelType:
        """Perform a soft delete by setting deleted_at to the current time."""
        if hasattr(db_obj, "deleted_at"):
            setattr(db_obj, "deleted_at", datetime.now(timezone.utc).replace(tzinfo=None))
            if hasattr(db_obj, "updated_at"):
                setattr(db_obj, "updated_at", datetime.now(timezone.utc).replace(tzinfo=None))
            self.session.add(db_obj)
            await self.session.commit()
            await self.session.refresh(db_obj)
        return db_obj

    async def remove(self, id: uuid.UUID) -> Optional[ModelType]:
        """Perform a physical deletion from the database (use with care)."""
        db_obj = await self.get(id)
        if db_obj:
            await self.session.delete(db_obj)
            await self.session.commit()
        return db_obj
