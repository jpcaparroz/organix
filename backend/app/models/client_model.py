import uuid
from datetime import datetime

from sqlmodel import Field, SQLModel
from typing import Optional


class ClientBase(SQLModel):
    name: str = Field(max_length=255)
    email: str = Field(max_length=255)
    phone: str = Field(max_length=50)
    address: str = Field(max_length=1024)


class ClientCreate(ClientBase):
    pass


class ClientUpdate(ClientBase):
    name: Optional[str] = Field(default=None, max_length=255)
    email: Optional[str] = Field(default=None, max_length=255)
    phone: Optional[str] = Field(default=None, max_length=50)
    address: Optional[str] = Field(default=None, max_length=1024)


class Client(ClientBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    tenant_id: uuid.UUID = Field(foreign_key="tenant.id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.now(datetime.timezone.utc), nullable=False)


class ClientPublic(ClientBase):
    id: uuid.UUID
    tenant_id: uuid.UUID
    created_at: datetime


class ClientsPublic(SQLModel):
    data: list[ClientPublic]
    count: int