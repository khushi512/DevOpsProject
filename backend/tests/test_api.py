import os
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

from fastapi.testclient import TestClient
from app.main import app

def test_health():
    with TestClient(app) as client:
        assert client.get("/health").json() == {"status": "UP"}

def test_root():
    with TestClient(app) as client:
        response = client.get("/")
        assert response.status_code == 200
        assert response.json()["service"] == "TaskBoard API"

def test_create_task_validation():
    with TestClient(app) as client:
        response = client.post("/api/tasks", json={"title": "Deploy application", "priority": "HIGH", "assignee": "Student"})
        assert response.status_code == 201
        assert response.json()["title"] == "Deploy application"


def test_list_tasks():
    with TestClient(app) as client:
        created = client.post(
            "/api/tasks",
            json={
                "title": "List test task",
                "priority": "MEDIUM",
                "assignee": "Student",
            },
        )
        assert created.status_code == 201
        task_id = created.json()["id"]

        response = client.get("/api/tasks")
        assert response.status_code == 200
        assert any(task["id"] == task_id for task in response.json())


def test_get_task_by_id():
    with TestClient(app) as client:
        created = client.post(
            "/api/tasks",
            json={
                "title": "Individual task test",
                "priority": "HIGH",
                "assignee": "Student",
            },
        )
        task_id = created.json()["id"]

        response = client.get(f"/api/tasks/{task_id}")
        assert response.status_code == 200
        assert response.json()["title"] == "Individual task test"


def test_update_task():
    with TestClient(app) as client:
        created = client.post(
            "/api/tasks",
            json={
                "title": "Update test task",
                "priority": "MEDIUM",
                "assignee": "Student",
            },
        )
        task_id = created.json()["id"]

        response = client.put(
            f"/api/tasks/{task_id}",
            json={"status": "DONE"},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "DONE"


def test_delete_task():
    with TestClient(app) as client:
        created = client.post(
            "/api/tasks",
            json={
                "title": "Delete test task",
                "priority": "LOW",
                "assignee": "Student",
            },
        )
        task_id = created.json()["id"]

        response = client.delete(f"/api/tasks/{task_id}")
        assert response.status_code == 204

        follow_up = client.get(f"/api/tasks/{task_id}")
        assert follow_up.status_code == 404
