import uuid
from datetime import datetime

from sqlmodel import Field, Relationship, SQLModel


class TenantBase(SQLModel):
    name: str = Field(max_length=255)
    plan: str = Field(
        sa_column_kwargs={"nullable": False},
        max_length=20,
        description="Plans: free, pro, enterprise"
    )


class TenantCreate(TenantBase):
    pass


class TenantUpdate(TenantBase):
    name: str | None = Field(default=None, max_length=255)
    plan: str | None = Field(default=None, max_length=20)


class Tenant(TenantBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now(datetime.timezone.utc), nullable=False)
    users: list["User"] = Relationship(back_populates="tenant")


# Properties to return via API, id is always required
class TenantPublic(TenantBase):
    id: uuid.UUID
    plan: str
    created_at: datetime


class TenantsPublic(SQLModel):
    data: list[TenantPublic]
    count: int
