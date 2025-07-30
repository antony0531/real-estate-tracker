"""
Database connection and session management for Real Estate Flip Tracker
"""

import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base, User
from .security import crypto_manager, audit_logger


class DatabaseManager:
    def __init__(self, db_path: str = None):
        """Initialize database manager with optional custom path"""
        if db_path is None:
            # Default to user's home directory
            home_dir = Path.home()
            db_dir = home_dir / ".real_estate_tracker"
            db_dir.mkdir(exist_ok=True)
            db_path = str(db_dir / "tracker.db")

        self.db_path = db_path
        self.engine = create_engine(f"sqlite:///{db_path}", echo=False)
        
        # Enable foreign key constraints for SQLite
        from sqlalchemy import event
        @event.listens_for(self.engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()
        
        self.SessionLocal = sessionmaker(
            autocommit=False, autoflush=False, bind=self.engine
        )

    def create_tables(self):
        """Create all database tables"""
        Base.metadata.create_all(bind=self.engine)

    def get_session(self):
        """Get a database session"""
        return self.SessionLocal()

    def init_default_user(self, username: str = "admin", password: str = "Admin123!"):
        """Create default admin user if no users exist"""
        session = self.get_session()
        try:
            user_count = session.query(User).count()
            if user_count == 0:
                hashed_password = crypto_manager.hash_password(password)
                default_user = User(
                    username=username, password_hash=hashed_password, role="editor"
                )
                session.add(default_user)
                session.commit()
                print(f"✅ Created default user: {username}")
                audit_logger.log_event("user_created", details={"username": username})
                return default_user
            return None
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()


# Global database manager instance
db_manager = DatabaseManager()


def get_db():
    """Dependency to get database session"""
    session = db_manager.get_session()
    try:
        yield session
    finally:
        session.close()


def init_database():
    """Initialize the database with tables and default user"""
    print("🔧 Initializing database...")
    db_manager.create_tables()
    db_manager.init_default_user()
    print(f"📁 Database created at: {db_manager.db_path}")


def reset_database():
    """Reset the database (for development/testing)"""
    if os.path.exists(db_manager.db_path):
        os.remove(db_manager.db_path)
        print("🗑️  Database reset")
    init_database()


if __name__ == "__main__":
    # For testing database setup
    init_database()
