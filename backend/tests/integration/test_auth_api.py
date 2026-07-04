import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_auth_flow_api(client: AsyncClient):
    # 1. Register a new user
    register_data = {
        "email": "api_user@example.com",
        "password": "strongpassword123",
        "name": "API User",
        "icon": "icon_url",
    }
    response = await client.post("/api/v1/auth/register", json=register_data)
    assert response.status_code == 201
    user_json = response.json()
    assert user_json["email"] == register_data["email"]
    assert user_json["name"] == register_data["name"]
    assert "user_id" in user_json

    # 2. Login to retrieve token
    login_data = {
        "username": register_data["email"],
        "password": register_data["password"],
    }
    # Form data request
    response = await client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200
    token_json = response.json()
    assert "access_token" in token_json
    assert token_json["token_type"] == "bearer"
    token = token_json["access_token"]

    # 3. Access current user profile (/me) using token
    headers = {"Authorization": f"Bearer {token}"}
    response = await client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    me_json = response.json()
    assert me_json["email"] == register_data["email"]
    assert me_json["name"] == register_data["name"]


@pytest.mark.asyncio
async def test_auth_case_insensitivity(client: AsyncClient):
    # 1. Register with uppercase letters
    register_data = {
        "email": "CaseUser@Example.Com",
        "password": "strongpassword123",
        "name": "Case User",
    }
    response = await client.post("/api/v1/auth/register", json=register_data)
    assert response.status_code == 201
    user_json = response.json()
    assert user_json["email"] == "caseuser@example.com" # Should be lowercased

    # 2. Re-registering with lowercased email should trigger UserAlreadyExists (400)
    response2 = await client.post("/api/v1/auth/register", json={
        "email": "caseuser@example.com",
        "password": "differentpassword",
        "name": "Another Name"
    })
    assert response2.status_code == 400

    # 3. Login with lowercased email should succeed
    login_data = {
        "username": "caseuser@example.com",
        "password": register_data["password"],
    }
    response3 = await client.post("/api/v1/auth/login", data=login_data)
    assert response3.status_code == 200
    assert "access_token" in response3.json()

