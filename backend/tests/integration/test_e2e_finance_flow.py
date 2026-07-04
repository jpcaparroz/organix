import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_e2e_finance_flow(client: AsyncClient):
    # 1. Register User
    register_data = {
        "email": "e2e_john@example.com",
        "password": "password123",
        "name": "John Doe",
        "icon": "user_avatar",
    }
    resp = await client.post("/api/v1/auth/register", json=register_data)
    assert resp.status_code == 201

    # 2. Login
    login_data = {
        "username": register_data["email"],
        "password": register_data["password"],
    }
    resp = await client.post("/api/v1/auth/login", data=login_data)
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Retrieve pre-seeded Expense Categories
    exp_cats_resp = await client.get("/api/v1/categories/expenses", headers=headers)
    assert exp_cats_resp.status_code == 200
    expense_categories = exp_cats_resp.json()
    assert len(expense_categories) == 5
    food_cat = next(c for c in expense_categories if c["name"] == "Food")
    food_category_id = food_cat["expense_category_id"]

    # 4. Retrieve pre-seeded Income Categories
    inc_cats_resp = await client.get("/api/v1/categories/incomes", headers=headers)
    assert inc_cats_resp.status_code == 200
    income_categories = inc_cats_resp.json()
    assert len(income_categories) == 2
    salary_cat = next(c for c in income_categories if c["name"] == "Salary")
    salary_category_id = salary_cat["income_category_id"]

    # 5. Retrieve pre-seeded Payment Methods
    pm_resp = await client.get("/api/v1/payment-methods", headers=headers)
    assert pm_resp.status_code == 200
    payment_methods = pm_resp.json()
    assert len(payment_methods) == 4
    bank_account_pm = next(p for p in payment_methods if p["name"] == "Bank Account")
    payment_method_id = bank_account_pm["payment_method_id"]

    # 6. Log Expense "Grocery Shopping" of 75.00
    exp_resp = await client.post(
        "/api/v1/expenses",
        json={
            "name": "Grocery Shopping",
            "amount": 75.00,
            "date": "2026-06-27",
            "status": "PAID",
            "expense_category_id": food_category_id,
            "payment_method_id": payment_method_id,
        },
        headers=headers,
    )
    assert exp_resp.status_code == 201

    # 7. Log Income "Salary Pay" of 2500.00
    inc_resp = await client.post(
        "/api/v1/incomes",
        json={
            "name": "Salary Pay",
            "amount": 2500.00,
            "date": "2026-06-27",
            "status": "RECEIVED",
            "income_category_id": salary_category_id,
            "payment_method_id": payment_method_id,
        },
        headers=headers,
    )
    assert inc_resp.status_code == 201

    # 8. Check Dashboard Summary (for June 2026)
    dash_summary_resp = await client.get(
        "/api/v1/dashboard/summary",
        params={"year": 2026, "month": 6},
        headers=headers,
    )
    assert dash_summary_resp.status_code == 200
    summary = dash_summary_resp.json()
    assert float(summary["total_income"]) == 2500.00
    assert float(summary["total_expense"]) == 75.00
    assert float(summary["net_balance"]) == 2425.00
    assert float(summary["pending_expenses"]) == 0.00
    assert float(summary["expected_incomes"]) == 0.00

    # 9. Check Dashboard Expenses by Category
    dash_cat_resp = await client.get(
        "/api/v1/dashboard/expenses-by-category",
        params={"year": 2026, "month": 6},
        headers=headers,
    )
    assert dash_cat_resp.status_code == 200
    cat_shares = dash_cat_resp.json()["items"]
    assert len(cat_shares) == 1
    assert cat_shares[0]["category_name"] == "Food"
    assert float(cat_shares[0]["amount"]) == 75.00
    assert float(cat_shares[0]["percentage"]) == 100.0
