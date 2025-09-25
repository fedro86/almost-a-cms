"""Test content API endpoints."""

import json
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from src.almostacms.presentation.web.app import create_app


@pytest.fixture
def temp_directories():
    """Create temporary directories for testing."""
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        yield {
            "content": temp_path / "content",
            "backup": temp_path / "backup",
            "media": temp_path / "media",
            "templates": temp_path / "templates",
        }


@pytest.fixture
def test_client():
    """Create test client."""
    app = create_app()
    return TestClient(app)


def test_health_check(test_client):
    """Test health check endpoint."""
    response = test_client.get("/api/system/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data
    assert "version" in data


def test_list_content_types(test_client):
    """Test listing content types."""
    response = test_client.get("/api/content/types")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "content_types" in data
    assert "total_count" in data


def test_list_registered_types(test_client):
    """Test listing registered content types."""
    response = test_client.get("/api/content/types/registry")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "content_types" in data
    assert len(data["content_types"]) > 0


def test_validate_content_valid(test_client):
    """Test content validation with valid data."""
    valid_personal_info = {
        "name": "John Doe",
        "title": "Software Developer",
        "contact_info": {"email": "john@example.com"},
    }

    response = test_client.post(
        "/api/content/validate",
        json={"content_type": "personal_info", "data": valid_personal_info},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["valid"] is True
    assert len(data["errors"]) == 0


def test_validate_content_invalid(test_client):
    """Test content validation with invalid data."""
    invalid_personal_info = {
        "name": "",  # Empty name should fail validation
        "title": "x" * 300,  # Too long title
        "contact_info": {"email": "invalid-email"},  # Invalid email format
    }

    response = test_client.post(
        "/api/content/validate",
        json={"content_type": "personal_info", "data": invalid_personal_info},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["valid"] is False
    assert len(data["errors"]) > 0


def test_get_content_schema(test_client):
    """Test getting content schema."""
    response = test_client.get("/api/content/personal_info/schema")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "schema" in data
    assert data["content_type"] == "personal_info"


def test_get_content_type_info(test_client):
    """Test getting content type information."""
    response = test_client.get("/api/content/personal_info/info")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "info" in data
    assert data["info"]["content_type"] == "personal_info"


def test_invalid_content_type(test_client):
    """Test with invalid content type."""
    response = test_client.get("/api/content/invalid_type")
    assert response.status_code == 400


def test_system_status(test_client):
    """Test system status endpoint."""
    response = test_client.get("/api/system/status")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "status" in data
    assert "version" in data


def test_system_config(test_client):
    """Test system configuration endpoint."""
    response = test_client.get("/api/system/config")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "config" in data
    assert "app_name" in data["config"]
