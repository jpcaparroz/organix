from datetime import datetime, timezone
import enum
from typing import Optional
import uuid
from sqlalchemy import Index, text
from sqlmodel import SQLModel, Field


class PaymentMethodType(str, enum.Enum):
    CASH = "CASH"
    CREDIT_CARD = "CREDIT_CARD"
    DEBIT_CARD = "DEBIT_CARD"
    PIX = "PIX"
    BANK_TRANSFER = "BANK_TRANSFER"


class PaymentMethod(SQLModel, table=True):
    __tablename__ = "payment_methods"

    payment_method_id: uuid.UUID = Field(
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
    name: str = Field(nullable=False)
    type: PaymentMethodType = Field(
        default=PaymentMethodType.CASH,
        nullable=False,
    )
    icon: Optional[str] = Field(default=None, nullable=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        nullable=False,
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        nullable=False,
    )
    deleted_at: Optional[datetime] = Field(default=None, nullable=True)

    __table_args__ = (
        Index(
            "uq_payment_method_user_name_active",
            "user_id",
            "name",
            unique=True,
            postgresql_where=text("deleted_at IS NULL"),
        ),
    )
