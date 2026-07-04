import pytest
import decimal
import datetime
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.users import User
from app.models.expense_categories import ExpenseCategory
from app.models.payment_methods import PaymentMethod, PaymentMethodType
from app.models.expenses import ExpenseStatus
from app.schemas.expenses import ExpenseCreate
from app.services.expense import ExpenseService


@pytest.mark.asyncio
async def test_create_installments_rounding_and_math(db_session: AsyncSession):
    # 1. Setup User, Category, and Payment Method
    user = User(
        email="test@example.com",
        password_hash="hash",
        name="Test User",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)

    category = ExpenseCategory(
        user_id=user.user_id,
        name="Food",
    )
    db_session.add(category)
    await db_session.commit()
    await db_session.refresh(category)

    payment = PaymentMethod(
        user_id=user.user_id,
        name="Credit Card",
        type=PaymentMethodType.CREDIT_CARD,
    )
    db_session.add(payment)
    await db_session.commit()
    await db_session.refresh(payment)

    # 2. Initialize Service and inputs
    service = ExpenseService(db_session)
    expense_in = ExpenseCreate(
        name="Groceries",
        description="Weekly shop",
        amount=decimal.Decimal("100.00"),
        date=datetime.date(2026, 6, 1),
        status=ExpenseStatus.PENDING,
        tags=["food"],
        expense_category_id=category.expense_category_id,
        payment_method_id=payment.payment_method_id,
        installment_quantity=3,
    )

    # 3. Execute
    results = await service.create_expense(user.user_id, expense_in)

    # 4. Verify
    assert len(results) == 3
    
    # Check shared group ID
    group_id = results[0].transaction_group_id
    assert group_id is not None
    
    # Check installment sequence
    for i, exp in enumerate(results, start=1):
        assert exp.transaction_group_id == group_id
        assert exp.installment_current == i
        assert exp.installment_total == 3
        assert exp.user_id == user.user_id
        
    # Check precise split math (100 / 3 -> 33.34, 33.33, 33.33)
    assert results[0].amount == decimal.Decimal("33.34")
    assert results[1].amount == decimal.Decimal("33.33")
    assert results[2].amount == decimal.Decimal("33.33")
    assert sum(r.amount for r in results) == decimal.Decimal("100.00")

    # Check dates (June 1st, July 1st, August 1st)
    assert results[0].date == datetime.date(2026, 6, 1)
    assert results[1].date == datetime.date(2026, 7, 1)
    assert results[2].date == datetime.date(2026, 8, 1)
