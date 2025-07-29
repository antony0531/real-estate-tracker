"""
Security configuration and utilities for Real Estate Flip Tracker
Implements cybersecurity requirements from PRD section 5
"""

import os
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from pathlib import Path
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from passlib.context import CryptContext
import jwt
from sqlalchemy import event
from sqlalchemy.engine import Engine
import base64


class SecurityConfig:
    """Central security configuration"""

    # Password policy
    MIN_PASSWORD_LENGTH = 12
    PASSWORD_COMPLEXITY_REQUIRED = True
    BCRYPT_ROUNDS = 12

    # JWT settings
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRY_MINUTES = 15

    # Database encryption
    DATABASE_ENCRYPTION_ENABLED = True

    # Session settings
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_DURATION_MINUTES = 30

    # API security
    API_RATE_LIMIT_PER_MINUTE = 60
    CORS_ALLOWED_ORIGINS = ["http://localhost:3000", "tauri://localhost"]

    # File security
    SECURE_FILE_PERMISSIONS = 0o600  # Owner read/write only


class PasswordValidator:
    """Validate passwords against security policy"""

    @staticmethod
    def validate_password(password: str) -> Dict[str, Any]:
        """Validate password strength"""
        issues = []

        if len(password) < SecurityConfig.MIN_PASSWORD_LENGTH:
            issues.append(
                f"Password must be at least {SecurityConfig.MIN_PASSWORD_LENGTH} characters"
            )

        if SecurityConfig.PASSWORD_COMPLEXITY_REQUIRED:
            if not any(c.isupper() for c in password):
                issues.append("Password must contain at least one uppercase letter")
            if not any(c.islower() for c in password):
                issues.append("Password must contain at least one lowercase letter")
            if not any(c.isdigit() for c in password):
                issues.append("Password must contain at least one number")
            if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
                issues.append("Password must contain at least one special character")

        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "strength": "strong" if len(issues) == 0 else "weak",
        }


class CryptoManager:
    """Handle encryption and decryption operations"""

    def __init__(self):
        self.pwd_context = CryptContext(
            schemes=["bcrypt"],
            deprecated="auto",
            bcrypt__rounds=SecurityConfig.BCRYPT_ROUNDS,
        )

    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        return self.pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return self.pwd_context.verify(plain_password, hashed_password)

    def derive_key_from_password(self, password: str, salt: bytes) -> bytes:
        """Derive encryption key from password using PBKDF2"""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,  # OWASP recommended minimum
        )
        return base64.urlsafe_b64encode(kdf.derive(password.encode()))

    def encrypt_data(self, data: str, key: bytes) -> str:
        """Encrypt data using Fernet (AES 128 in CBC mode)"""
        f = Fernet(key)
        encrypted_data = f.encrypt(data.encode())
        return base64.urlsafe_b64encode(encrypted_data).decode()

    def decrypt_data(self, encrypted_data: str, key: bytes) -> str:
        """Decrypt data using Fernet"""
        f = Fernet(key)
        decoded_data = base64.urlsafe_b64decode(encrypted_data.encode())
        decrypted_data = f.decrypt(decoded_data)
        return decrypted_data.decode()


class JWTManager:
    """Handle JWT token creation and validation"""

    def __init__(self, secret_key: Optional[str] = None):
        self.secret_key = secret_key or self._generate_secret_key()

    def _generate_secret_key(self) -> str:
        """Generate a secure random secret key"""
        return secrets.token_urlsafe(32)

    def create_token(self, user_id: int, username: str) -> str:
        """Create JWT token for user"""
        payload = {
            "user_id": user_id,
            "username": username,
            "exp": datetime.utcnow()
            + timedelta(minutes=SecurityConfig.JWT_EXPIRY_MINUTES),
            "iat": datetime.utcnow(),
            "jti": secrets.token_urlsafe(16),  # JWT ID for tracking
        }
        return jwt.encode(
            payload, self.secret_key, algorithm=SecurityConfig.JWT_ALGORITHM
        )

    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(
                token, self.secret_key, algorithms=[SecurityConfig.JWT_ALGORITHM]
            )
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None


class SecurityAuditLogger:
    """Log security events for monitoring"""

    def __init__(self, log_dir: Optional[Path] = None):
        if log_dir is None:
            log_dir = Path.home() / ".real_estate_tracker" / "logs"

        log_dir.mkdir(parents=True, exist_ok=True)
        self.log_file = log_dir / "security.log"

        # Set secure file permissions
        if self.log_file.exists():
            os.chmod(self.log_file, SecurityConfig.SECURE_FILE_PERMISSIONS)

    def log_event(
        self,
        event_type: str,
        user_id: Optional[int] = None,
        details: Optional[Dict] = None,
    ):
        """Log security event"""
        timestamp = datetime.utcnow().isoformat()
        log_entry = {
            "timestamp": timestamp,
            "event_type": event_type,
            "user_id": user_id,
            "details": details or {},
        }

        with open(self.log_file, "a") as f:
            f.write(f"{log_entry}\n")

    def log_login_attempt(
        self, username: str, success: bool, ip_address: str = "local"
    ):
        """Log login attempt"""
        self.log_event(
            "login_attempt",
            details={
                "username": username,
                "success": success,
                "ip_address": ip_address,
            },
        )


class InputValidator:
    """Validate and sanitize user inputs"""

    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Sanitize filename to prevent path traversal"""
        # Remove path separators and dangerous characters
        safe_chars = set(
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_."
        )
        sanitized = "".join(c for c in filename if c in safe_chars)

        # Prevent empty names or names starting with dots
        if not sanitized or sanitized.startswith("."):
            sanitized = f"file_{secrets.token_hex(4)}"

        return sanitized

    @staticmethod
    def validate_project_name(name: str) -> bool:
        """Validate project name"""
        if not name or len(name.strip()) < 1:
            return False
        if len(name) > 200:
            return False
        # Prevent SQL injection patterns
        dangerous_patterns = ["'", '"', ";", "--", "/*", "*/", "xp_", "sp_"]
        return not any(pattern in name.lower() for pattern in dangerous_patterns)


# Global security manager instances
crypto_manager = CryptoManager()
jwt_manager = JWTManager()
audit_logger = SecurityAuditLogger()
