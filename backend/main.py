from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.exceptions import DomainException
from app.api.v1 import (
    auth,
    expense_categories,
    income_categories,
    payment_methods,
    expenses,
    incomes,
    dashboard,
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(DomainException)
async def domain_exception_handler(request: Request, exc: DomainException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Auth"])
app.include_router(
    expense_categories.router,
    prefix=f"{settings.API_V1_STR}/categories/expenses",
    tags=["Expense Categories"],
)
app.include_router(
    income_categories.router,
    prefix=f"{settings.API_V1_STR}/categories/incomes",
    tags=["Income Categories"],
)
app.include_router(
    payment_methods.router,
    prefix=f"{settings.API_V1_STR}/payment-methods",
    tags=["Payment Methods"],
)
app.include_router(
    expenses.router,
    prefix=f"{settings.API_V1_STR}/expenses",
    tags=["Expenses"],
)
app.include_router(
    incomes.router,
    prefix=f"{settings.API_V1_STR}/incomes",
    tags=["Incomes"],
)
app.include_router(
    dashboard.router,
    prefix=f"{settings.API_V1_STR}/dashboard",
    tags=["Dashboard"],
)


@app.get("/")
async def root():
    return {"message": "Organix Finance API is running.", "docs": "/docs"}
