import uuid
from datetime import datetime
from decimal import Decimal

from sqlmodel import Field, SQLModel
from typing import Optional


class SaleItemBase(SQLModel):
    total_amount: Decimal = Field(sa_column_kwargs={"precision": 10, "scale": 2})
    SaleItem_date: datetime


class SaleItemCreate(SaleItemBase):
    customer_id: uuid.UUID
    payment_type_id: uuid.UUID


class SaleItemUpdate(SaleItemBase):
    customer_id: Optional[uuid.UUID] = None
    payment_type_id: Optional[uuid.UUID] = None
    total_amount: Optional[Decimal] = None
    SaleItem_date: Optional[datetime] = None


class SaleItem(SaleItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", nullable=False)
    customer_id: uuid.UUID = Field(foreign_key="client.id", nullable=False)
    payment_type_id: uuid.UUID = Field(foreign_key="paymenttype.id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.now(datetime.timezone.utc), nullable=False)


class SaleItemPublic(SaleItemBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    customer_id: uuid.UUID
    payment_type_id: uuid.UUID
    created_at: datetime


class SaleItemsPublic(SQLModel):
    data: list[SaleItemPublic]
    count: int
