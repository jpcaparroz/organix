from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies.database import get_db
from app.api.dependencies.auth import get_current_user
from app.models.users import User
from app.schemas.dashboard import DashboardSummary, ExpensesByCategoryResponse
from app.services.dashboard import DashboardService

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
async def get_summary(
    year: int = Query(..., ge=1900, le=2100),
    month: int = Query(..., ge=1, le=12),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Retrieves aggregated monthly summary (total income, expense, balance, pending/expected)."""
    service = DashboardService(session)
    return await service.get_summary(
        user_id=current_user.user_id,
        year=year,
        month=month,
    )


@router.get("/expenses-by-category", response_model=ExpensesByCategoryResponse)
async def get_expenses_by_category(
    year: int = Query(..., ge=1900, le=2100),
    month: int = Query(..., ge=1, le=12),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Retrieves category distribution of expenses for a specific month."""
    service = DashboardService(session)
    return await service.get_expenses_by_category(
        user_id=current_user.user_id,
        year=year,
        month=month,
    )
