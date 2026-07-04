from datetime import datetime, timezone
from typing import Optional
import uuid
from sqlalchemy import Index, text
from sqlmodel import SQLModel, Field


class IncomeCategory(SQLModel, table=True):
    __tablename__ = "income_categories"

    income_category_id: uuid.UUID = Field(
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
    icon: Optional[str] = Field(default=None, nullable=True)
    color_hex: Optional[str] = Field(default=None, nullable=True)
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
            "uq_income_category_user_name_active",
            "user_id",
            "name",
            unique=True,
            postgresql_where=text("deleted_at IS NULL"),
        ),
    )
