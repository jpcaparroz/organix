import uuid
from datetime import datetime

from sqlmodel import Field, SQLModel
from typing import Optional


class PaymentTypeBase(SQLModel):
    name: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=1024)


class PaymentTypeCreate(PaymentTypeBase):
    pass


class PaymentTypeUpdate(PaymentTypeBase):
    name: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1024)


class PaymentType(PaymentTypeBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.now(datetime.timezone.utc), nullable=False)


# Properties to return via API, id is always required
class PaymentTypePublic(PaymentTypeBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    created_at: datetime


class PaymentTypesPublic(SQLModel):
    data: list[PaymentTypePublic]
    count: int
