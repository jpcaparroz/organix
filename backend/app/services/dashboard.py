import datetime
import decimal
from typing import List, Dict
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.expenses import ExpenseStatus
from app.models.incomes import IncomeStatus
from app.repositories.expense import ExpenseRepository
from app.repositories.income import IncomeRepository
from app.repositories.expense_category import ExpenseCategoryRepository
from app.schemas.dashboard import DashboardSummary, CategoryShare, ExpensesByCategoryResponse


def get_month_range(year: int, month: int):
    """Returns the start and end dates of a given month."""
    start_date = datetime.date(year, month, 1)
    if month == 12:
        end_date = datetime.date(year, 12, 31)
    else:
        end_date = datetime.date(year, month + 1, 1) - datetime.timedelta(days=1)
    return start_date, end_date


class DashboardService:
    def __init__(self, session: AsyncSession):
        self.expense_repo = ExpenseRepository(session)
        self.income_repo = IncomeRepository(session)
        self.category_repo = ExpenseCategoryRepository(session)

    async def get_summary(self, user_id: uuid.UUID, year: int, month: int) -> DashboardSummary:
        start_date, end_date = get_month_range(year, month)

        # Get all expenses for this month (limit=100000 to ensure we get all)
        expenses = await self.expense_repo.get_by_date_range(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            limit=100000,
        )

        # Get all incomes for this month
        incomes = await self.income_repo.get_by_date_range(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            limit=100000,
        )

        total_income = sum(item.amount for item in incomes) or decimal.Decimal("0.00")
        total_expense = sum(item.amount for item in expenses) or decimal.Decimal("0.00")
        net_balance = total_income - total_expense

        pending_expenses = (
            sum(item.amount for item in expenses if item.status == ExpenseStatus.PENDING)
            or decimal.Decimal("0.00")
        )
        expected_incomes = (
            sum(item.amount for item in incomes if item.status == IncomeStatus.EXPECTED)
            or decimal.Decimal("0.00")
        )

        return DashboardSummary(
            total_income=total_income,
            total_expense=total_expense,
            net_balance=net_balance,
            pending_expenses=pending_expenses,
            expected_incomes=expected_incomes,
        )

    async def get_expenses_by_category(
        self, user_id: uuid.UUID, year: int, month: int
    ) -> ExpensesByCategoryResponse:
        start_date, end_date = get_month_range(year, month)

        expenses = await self.expense_repo.get_by_date_range(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            limit=100000,
        )

        if not expenses:
            return ExpensesByCategoryResponse(items=[])

        # Group by category_id
        grouped: Dict[uuid.UUID, decimal.Decimal] = {}
        for exp in expenses:
            grouped[exp.expense_category_id] = grouped.get(
                exp.expense_category_id, decimal.Decimal("0.00")
            ) + exp.amount

        total_sum = sum(grouped.values()) or decimal.Decimal("1.00")  # Avoid division by zero

        items: List[CategoryShare] = []
        for cat_id, amount in grouped.items():
            category = await self.category_repo.get(cat_id, user_id=user_id)
            cat_name = category.name if category else "Unknown Category"
            color_hex = category.color_hex if category else None

            percentage = float((amount / total_sum * 100).quantize(decimal.Decimal("0.01")))

            items.append(
                CategoryShare(
                    category_id=str(cat_id),
                    category_name=cat_name,
                    color_hex=color_hex,
                    amount=amount,
                    percentage=percentage,
                )
            )

        # Sort by amount descending
        items.sort(key=lambda x: x.amount, reverse=True)

        return ExpensesByCategoryResponse(items=items)
