import datetime
from datetime import timezone
import enum
from typing import List, Optional
import uuid
import decimal
from sqlalchemy import Column, Numeric, JSON
from sqlmodel import SQLModel, Field


class ExpenseStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"


class Expense(SQLModel, table=True):
    __tablename__ = "expenses"

    expense_id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    user_id: uuid.UUID = Field(
        foreign_key="users.user_id",
        index=True,
        nullable=False,
    )
    expense_category_id: uuid.UUID = Field(
        foreign_key="expense_categories.expense_category_id",
        nullable=False,
    )
    payment_method_id: uuid.UUID = Field(
        foreign_key="payment_methods.payment_method_id",
        nullable=False,
    )
    transaction_group_id: Optional[uuid.UUID] = Field(
        default=None,
        index=True,
        nullable=True,
    )
    amount: decimal.Decimal = Field(
        sa_column=Column(Numeric(12, 2), nullable=False)
    )
    date: datetime.date = Field(index=True, nullable=False)
    name: str = Field(nullable=False)
    description: Optional[str] = Field(default=None, nullable=True)
    status: ExpenseStatus = Field(
        default=ExpenseStatus.PENDING,
        nullable=False,
    )
    installment_current: int = Field(default=1, nullable=False)
    installment_total: int = Field(default=1, nullable=False)
    tags: List[str] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False),
    )
    created_at: datetime.datetime = Field(
        default_factory=lambda: datetime.datetime.now(timezone.utc).replace(tzinfo=None),
        nullable=False,
    )
    updated_at: datetime.datetime = Field(
        default_factory=lambda: datetime.datetime.now(timezone.utc).replace(tzinfo=None),
        nullable=False,
    )
    deleted_at: Optional[datetime.datetime] = Field(default=None, nullable=True)
