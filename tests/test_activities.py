import urllib.parse


def quote(name: str) -> str:
    return urllib.parse.quote(name, safe='')


async def test_get_activities(async_client):
    resp = await async_client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data


async def test_signup_and_double_signup(async_client):
    email = "tester@example.com"
    activity = "Chess Club"
    # sign up
    resp = await async_client.post(f"/activities/{quote(activity)}/signup", params={"email": email})
    assert resp.status_code == 200
    assert f"Signed up {email} for {activity}" in resp.json().get("message", "")

    # double signup should return 400
    resp2 = await async_client.post(f"/activities/{quote(activity)}/signup", params={"email": email})
    assert resp2.status_code == 400


async def test_signup_nonexistent_activity(async_client):
    resp = await async_client.post(f"/activities/{quote('NoSuchActivity')}/signup", params={"email": "a@b.com"})
    assert resp.status_code == 404


async def test_unregister_nonexistent_participant(async_client):
    activity = "Chess Club"
    resp = await async_client.delete(f"/activities/{quote(activity)}/participants", params={"email": "noone@example.com"})
    assert resp.status_code == 404
