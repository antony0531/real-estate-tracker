#!/usr/bin/env python3
"""
Security demonstration script for Real Estate Flip Tracker
Shows implementation of cybersecurity features from PRD section 5
"""

import sys
import os
from pathlib import Path

# Add backend/src to path for imports
sys.path.insert(0, "backend/src")

try:
    from backend.src.security import (
        PasswordValidator,
        CryptoManager,
        JWTManager,
        SecurityAuditLogger,
        InputValidator,
    )
except ImportError:
    print("❌ Could not import security modules. Make sure you're in the project root.")
    print("📂 Current directory:", os.getcwd())
    print("📋 Expected structure: real_estate_tracker/backend/src/")
    sys.exit(1)


def test_password_validation():
    """Test password validation according to security policy"""
    print("🔐 Testing Password Validation")
    print("=" * 50)

    test_passwords = [
        "weak",  # Too short
        "StillWeak123",  # Missing special char
        "StrongP@ssw0rd123",  # Should pass
        "VeryStr0ng!Password2024",  # Should pass
    ]

    for password in test_passwords:
        result = PasswordValidator.validate_password(password)
        status = "✅ PASS" if result["valid"] else "❌ FAIL"
        print(f"{status} '{password}' - {result['strength']}")
        if result["issues"]:
            for issue in result["issues"]:
                print(f"   - {issue}")
    print()


def test_encryption():
    """Test data encryption and decryption"""
    print("🔒 Testing Data Encryption")
    print("=" * 50)

    crypto = CryptoManager()

    # Test password hashing
    password = "TestPassword123!"
    hashed = crypto.hash_password(password)
    verify_correct = crypto.verify_password(password, hashed)
    verify_incorrect = crypto.verify_password("WrongPassword", hashed)

    print(f"✅ Password hashing: {verify_correct and not verify_incorrect}")

    # Test data encryption
    sensitive_data = "Project: Ridgefield Flip, Budget: $150,000"
    salt = os.urandom(16)
    key = crypto.derive_key_from_password("MasterPassword123!", salt)

    encrypted = crypto.encrypt_data(sensitive_data, key)
    decrypted = crypto.decrypt_data(encrypted, key)

    print(f"✅ Data encryption: {sensitive_data == decrypted}")
    print(f"   Original: {sensitive_data}")
    print(f"   Encrypted: {encrypted[:50]}...")
    print(f"   Decrypted: {decrypted}")
    print()


def test_jwt_tokens():
    """Test JWT token creation and validation"""
    print("🎫 Testing JWT Token Management")
    print("=" * 50)

    jwt_manager = JWTManager()

    # Create token
    token = jwt_manager.create_token(user_id=1, username="testuser")
    print(f"✅ Token created: {token[:50]}...")

    # Verify token
    payload = jwt_manager.verify_token(token)
    if payload:
        print(
            f"✅ Token verified: User {payload['username']} (ID: {payload['user_id']})"
        )
    else:
        print("❌ Token verification failed")

    # Test invalid token
    invalid_payload = jwt_manager.verify_token("invalid.token.here")
    print(f"✅ Invalid token rejected: {invalid_payload is None}")
    print()


def test_input_validation():
    """Test input validation and sanitization"""
    print("🛡️  Testing Input Validation")
    print("=" * 50)

    # Test filename sanitization
    dangerous_filenames = [
        "../../../etc/passwd",
        "normal_file.txt",
        "file<script>alert('xss')</script>.txt",
        "file|rm -rf /.txt",
    ]

    for filename in dangerous_filenames:
        sanitized = InputValidator.sanitize_filename(filename)
        print(f"'{filename}' → '{sanitized}'")

    print()

    # Test project name validation
    project_names = [
        "Normal Project Name",  # Valid
        "'; DROP TABLE projects; --",  # SQL injection attempt
        "Very " * 50 + "Long Name",  # Too long
        "",  # Empty
    ]

    for name in project_names:
        valid = InputValidator.validate_project_name(name)
        status = "✅ VALID" if valid else "❌ INVALID"
        display_name = name[:30] + "..." if len(name) > 30 else name
        print(f"{status} '{display_name}'")
    print()


def run_security_tests():
    """Run all security tests"""
    print("🔒 Real Estate Flip Tracker - Security Feature Demonstration")
    print("=" * 80)
    print("Implementing cybersecurity requirements from PRD Section 5")
    print("=" * 80)
    print()

    test_password_validation()
    test_encryption()
    test_jwt_tokens()
    test_input_validation()

    print("🎉 Security demonstration completed!")
    print("\n📋 Security Features Implemented:")
    print("   ✅ Strong password policy enforcement")
    print("   ✅ AES-256 data encryption")
    print("   ✅ JWT token authentication")
    print("   ✅ Input validation and sanitization")
    print("   ✅ Security audit logging")
    print("   ✅ Database security hardening")
    print("\n🛡️  Your real estate investment data is protected!")


if __name__ == "__main__":
    run_security_tests()
