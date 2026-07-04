from datetime import datetime
from typing import Optional
import uuid
from pydantic import BaseModel, Field, ConfigDict
from app.models.payment_methods import PaymentMethodType


class PaymentMethodBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    type: PaymentMethodType
    icon: Optional[str] = None


class PaymentMethodCreate(PaymentMethodBase):
    pass


class PaymentMethodUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    type: Optional[PaymentMethodType] = None
    icon: Optional[str] = None


class PaymentMethodRead(PaymentMethodBase):
    payment_method_id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
