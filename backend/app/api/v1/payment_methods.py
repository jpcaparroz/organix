from typing import List
import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies.database import get_db
from app.api.dependencies.auth import get_current_user
from app.core.exceptions import ResourceNotFoundException, ValidationError
from app.models.users import User
from app.models.payment_methods import PaymentMethod
from app.repositories.payment_method import PaymentMethodRepository
from app.schemas.payment_methods import (
    PaymentMethodCreate,
    PaymentMethodRead,
    PaymentMethodUpdate,
)

router = APIRouter()


@router.get("", response_model=List[PaymentMethodRead])
async def list_payment_methods(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Lists active payment methods for the user."""
    repo = PaymentMethodRepository(session)
    return await repo.get_multi(user_id=current_user.user_id)


@router.post("", response_model=PaymentMethodRead, status_code=status.HTTP_201_CREATED)
async def create_payment_method(
    payment_in: PaymentMethodCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Creates a new payment method."""
    repo = PaymentMethodRepository(session)
    existing = await repo.get_by_name(current_user.user_id, payment_in.name)
    if existing:
        raise ValidationError(f"Payment method '{payment_in.name}' already exists")

    db_payment = PaymentMethod(
        user_id=current_user.user_id,
        name=payment_in.name,
        type=payment_in.type,
        icon=payment_in.icon,
    )
    return await repo.create(db_payment)


@router.get("/{payment_method_id}", response_model=PaymentMethodRead)
async def get_payment_method(
    payment_method_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Retrieves a single payment method."""
    repo = PaymentMethodRepository(session)
    payment = await repo.get(payment_method_id, user_id=current_user.user_id)
    if not payment:
        raise ResourceNotFoundException("Payment Method")
    return payment


@router.patch("/{payment_method_id}", response_model=PaymentMethodRead)
async def update_payment_method(
    payment_method_id: uuid.UUID,
    payment_up: PaymentMethodUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Updates a payment method."""
    repo = PaymentMethodRepository(session)
    payment = await repo.get(payment_method_id, user_id=current_user.user_id)
    if not payment:
        raise ResourceNotFoundException("Payment Method")

    if payment_up.name and payment_up.name != payment.name:
        existing = await repo.get_by_name(current_user.user_id, payment_up.name)
        if existing:
            raise ValidationError(f"Payment method '{payment_up.name}' already exists")

    return await repo.update(payment, payment_up)


@router.delete("/{payment_method_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_payment_method(
    payment_method_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Soft deletes a payment method."""
    repo = PaymentMethodRepository(session)
    payment = await repo.get(payment_method_id, user_id=current_user.user_id)
    if not payment:
        raise ResourceNotFoundException("Payment Method")
    await repo.soft_delete(payment)
