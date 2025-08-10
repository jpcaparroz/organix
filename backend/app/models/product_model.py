import uuid
from datetime import datetime
from decimal import Decimal

from sqlmodel import Field, SQLModel
from typing import Optional


class ProductBase(SQLModel):
    name: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=1024)
    price: Decimal = Field(sa_column_kwargs={"precision": 10, "scale": 2})
    stock_quantity: int


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    name: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1024)
    price: Optional[Decimal] = None
    stock_quantity: Optional[int] = None


class Product(ProductBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.now(datetime.timezone.utc), nullable=False)


class ProductPublic(ProductBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    created_at: datetime


class ProductsPublic(SQLModel):
    data: list[ProductPublic]
    count: int
