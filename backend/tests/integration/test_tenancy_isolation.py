import pytest
from httpx import AsyncClient


async def get_token_for_user(client: AsyncClient, email: str, name: str) -> str:
    # Helper to register and login a user, returning JWT
    reg = {
        "email": email,
        "password": "password123",
        "name": name,
    }
    await client.post("/api/v1/auth/register", json=reg)
    
    login = {"username": email, "password": "password123"}
    resp = await client.post("/api/v1/auth/login", data=login)
    return resp.json()["access_token"]


@pytest.mark.asyncio
async def test_multi_tenant_isolation(client: AsyncClient):
    # 1. Register and login User A and User B
    token_a = await get_token_for_user(client, "usera@example.com", "User A")
    token_b = await get_token_for_user(client, "userb@example.com", "User B")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 2. User A creates a category
    category_data = {"name": "Rent", "icon": "home", "color_hex": "#123456"}
    response = await client.post(
        "/api/v1/categories/expenses", json=category_data, headers=headers_a
    )
    assert response.status_code == 201
    cat_a = response.json()
    cat_a_id = cat_a["expense_category_id"]

    # 3. User B lists categories - should NOT see User A's category
    response = await client.get("/api/v1/categories/expenses", headers=headers_b)
    assert response.status_code == 200
    list_b = response.json()
    assert len(list_b) == 5  # B only has their own 5 default seeded categories
    assert cat_a_id not in [c["expense_category_id"] for c in list_b]

    # 4. User B requests User A's category by ID - should receive 404 NotFound
    response = await client.get(
        f"/api/v1/categories/expenses/{cat_a_id}", headers=headers_b
    )
    assert response.status_code == 404
