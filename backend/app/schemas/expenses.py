import datetime
import decimal
from typing import List, Optional
import uuid
from pydantic import BaseModel, Field, ConfigDict
from app.models.expenses import ExpenseStatus


class ExpenseBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None
    amount: decimal.Decimal = Field(gt=0)
    date: datetime.date
    status: ExpenseStatus = ExpenseStatus.PENDING
    tags: List[str] = Field(default_factory=list)
    expense_category_id: uuid.UUID
    payment_method_id: uuid.UUID


class ExpenseCreate(ExpenseBase):
    installment_quantity: int = Field(default=1, ge=1)


class ExpenseUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = None
    amount: Optional[decimal.Decimal] = Field(default=None, gt=0)
    date: Optional[datetime.date] = None
    status: Optional[ExpenseStatus] = None
    tags: Optional[List[str]] = None
    expense_category_id: Optional[uuid.UUID] = None
    payment_method_id: Optional[uuid.UUID] = None


class ExpenseRead(ExpenseBase):
    expense_id: uuid.UUID
    user_id: uuid.UUID
    transaction_group_id: Optional[uuid.UUID] = None
    installment_current: int
    installment_total: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class ExpenseList(BaseModel):
    items: List[ExpenseRead]
    total_count: int
