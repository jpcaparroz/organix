from datetime import datetime
from typing import Optional
import uuid
from pydantic import BaseModel, Field, ConfigDict


class ExpenseCategoryBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    icon: Optional[str] = None
    color_hex: Optional[str] = Field(default=None, max_length=7)  # e.g., "#FFFFFF"


class ExpenseCategoryCreate(ExpenseCategoryBase):
    pass


class ExpenseCategoryUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    icon: Optional[str] = None
    color_hex: Optional[str] = Field(default=None, max_length=7)


class ExpenseCategoryRead(ExpenseCategoryBase):
    expense_category_id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
