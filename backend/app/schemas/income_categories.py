from datetime import datetime
from typing import Optional
import uuid
from pydantic import BaseModel, Field, ConfigDict


class IncomeCategoryBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    icon: Optional[str] = None
    color_hex: Optional[str] = Field(default=None, max_length=7)


class IncomeCategoryCreate(IncomeCategoryBase):
    pass


class IncomeCategoryUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    icon: Optional[str] = None
    color_hex: Optional[str] = Field(default=None, max_length=7)


class IncomeCategoryRead(IncomeCategoryBase):
    income_category_id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
