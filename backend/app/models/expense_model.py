import uuid
from datetime import datetime, date

from sqlmodel import Field, SQLModel
from typing import Optional
from decimal import Decimal


class ExpenseBase(SQLModel):
    description: str = Field(max_length=1024)
    amount: Decimal = Field(sa_column_kwargs={"precision": 10, "scale": 2})
    date: date
    category: str = Field(max_length=255)
    supplier_id: Optional[uuid.UUID] = Field(default=None, foreign_key="supplier.id")


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(ExpenseBase):
    description: Optional[str] = Field(default=None, max_length=1024)
    amount: Optional[Decimal] = None
    date: Optional[datetime] = None
    category: Optional[str] = Field(default=None, max_length=255)
    supplier_id: Optional[uuid.UUID] = Field(default=None)


class Expense(ExpenseBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.now(datetime.timezone.utc), nullable=False)


class ExpensePublic(ExpenseBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    created_at: datetime


class ExpensesPublic(SQLModel):
    data: list[ExpensePublic]
    count: int
