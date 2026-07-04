import decimal
from typing import List, Optional
from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_income: decimal.Decimal
    total_expense: decimal.Decimal
    net_balance: decimal.Decimal
    pending_expenses: decimal.Decimal
    expected_incomes: decimal.Decimal


class CategoryShare(BaseModel):
    category_id: str
    category_name: str
    color_hex: Optional[str] = None
    amount: decimal.Decimal
    percentage: float


class ExpensesByCategoryResponse(BaseModel):
    items: List[CategoryShare]
