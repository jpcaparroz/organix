import datetime
from datetime import timezone
import enum
from typing import Optional
import uuid
import decimal
from sqlalchemy import Column, Numeric
from sqlmodel import SQLModel, Field


class IncomeStatus(str, enum.Enum):
    EXPECTED = "EXPECTED"
    RECEIVED = "RECEIVED"


class Income(SQLModel, table=True):
    __tablename__ = "incomes"

    income_id: uuid.UUID = Field(
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
    income_category_id: uuid.UUID = Field(
        foreign_key="income_categories.income_category_id",
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
    status: IncomeStatus = Field(
        default=IncomeStatus.EXPECTED,
        nullable=False,
    )
    installment_current: int = Field(default=1, nullable=False)
    installment_total: int = Field(default=1, nullable=False)
    created_at: datetime.datetime = Field(
        default_factory=lambda: datetime.datetime.now(timezone.utc).replace(tzinfo=None),
        nullable=False,
    )
    updated_at: datetime.datetime = Field(
        default_factory=lambda: datetime.datetime.now(timezone.utc).replace(tzinfo=None),
        nullable=False,
    )
    deleted_at: Optional[datetime.datetime] = Field(default=None, nullable=True)
