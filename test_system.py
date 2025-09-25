#!/usr/bin/env python3
"""Simple system functionality test."""

import os
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))


def test_imports():
    """Test that all core modules can be imported."""
    print("Testing imports...")

    try:
        from config import settings

        print("✅ Config imported successfully")

        from src.almostacms.domain.models.content import AboutContent, PersonalInfo

        print("✅ Domain models imported successfully")

        from src.almostacms.infrastructure.security.security_service import (
            DefaultSecurityService,
        )

        print("✅ Security service imported successfully")

        from src.almostacms.infrastructure.logging import get_logger

        print("✅ Logging imported successfully")

        print("\n🎉 All core imports successful!")
        return True

    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False


def test_models():
    """Test that models work correctly."""
    print("\nTesting models...")

    try:
        from src.almostacms.domain.models.content import PersonalInfo

        # Create a sample personal info
        personal_info = PersonalInfo(
            name="John Doe",
            title="Software Developer",
            tagline="Building amazing things with code",
        )

        print(f"✅ PersonalInfo model created: {personal_info.name}")

        # Test JSON serialization
        json_data = personal_info.model_dump()
        print(f"✅ Model serialization works: {len(json_data)} fields")

        return True

    except Exception as e:
        print(f"❌ Model test failed: {e}")
        return False


def test_security():
    """Test security service."""
    print("\nTesting security...")

    try:
        from src.almostacms.infrastructure.security.security_service import (
            DefaultSecurityService,
        )

        security = DefaultSecurityService()

        # Test filename validation
        safe_filename = security.sanitize_filename("test-file.json")
        print(f"✅ Filename sanitization works: {safe_filename}")

        # Test dangerous filename rejection
        try:
            dangerous = security.sanitize_filename("../../../etc/passwd")
            print(f"❌ Security test failed: dangerous file allowed: {dangerous}")
            return False
        except ValueError:
            print("✅ Path traversal protection works")

        return True

    except Exception as e:
        print(f"❌ Security test failed: {e}")
        return False


def test_core_functionality():
    """Test core system functionality."""
    print("\nTesting core functionality...")

    try:
        from src.almostacms.domain.services.content_type_registry import (
            ContentTypeRegistry,
        )

        # Test content type registry
        registry = ContentTypeRegistry()
        status = registry.get_registry_status()
        print(
            f"✅ Content type registry works: {status['total_types']} types registered"
        )

        return True

    except Exception as e:
        print(f"❌ Core functionality test failed: {e}")
        return False


def main():
    """Run all tests."""
    print("🚀 Testing Almost-a-CMS System Functionality\n")

    tests = [test_imports, test_models, test_security, test_core_functionality]

    passed = 0
    for test in tests:
        if test():
            passed += 1
        print()

    print(f"📊 Test Results: {passed}/{len(tests)} tests passed")

    if passed == len(tests):
        print("\n🎉 All tests passed! System is functional.")
        return True
    else:
        print(f"\n❌ {len(tests) - passed} tests failed.")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
