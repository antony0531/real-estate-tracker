"""
Database models for Real Estate Flip Tracker
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Text,
    ForeignKey,
    Enum,
    Boolean,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum

Base = declarative_base()


class PropertyType(enum.Enum):
    SINGLE_FAMILY = "single_family"
    MULTIFAMILY = "multifamily"


class PropertyClass(enum.Enum):
    # Single Family Classes
    SF_CLASS_A = "sf_class_a"  # $2.5-4M Ultra-Luxury
    SF_CLASS_B = "sf_class_b"  # $1-2M Luxury
    SF_CLASS_C = "sf_class_c"  # $700K-999K Safe middle class
    SF_CLASS_D = "sf_class_d"  # <$550K

    # Multifamily Classes
    MF_CLASS_A = "mf_class_a"  # $1-1.5M
    MF_CLASS_B = "mf_class_b"  # $750K-900K
    MF_CLASS_C = "mf_class_c"  # $500K-749K


class ExpenseCategory(enum.Enum):
    MATERIAL = "material"
    LABOR = "labor"


class ProjectStatus(enum.Enum):
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="editor")  # 'viewer' or 'editor'
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    projects = relationship("Project", back_populates="owner")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    total_budget = Column(Float, nullable=False)
    property_type = Column(Enum(PropertyType), nullable=False)
    property_class = Column(Enum(PropertyClass), nullable=False)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.PLANNING)

    # Property details
    num_floors = Column(Integer, default=1)
    total_sqft = Column(Float)
    address = Column(String(500))

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Foreign keys
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    owner = relationship("User", back_populates="projects")
    rooms = relationship("Room", back_populates="project", cascade="all, delete-orphan")
    expenses = relationship(
        "Expense", back_populates="project", cascade="all, delete-orphan"
    )


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)  # Living Room, Kitchen, etc.
    floor_number = Column(Integer, nullable=False)
    length_ft = Column(Float)
    width_ft = Column(Float)
    height_ft = Column(Float, default=8.0)
    initial_condition = Column(Integer, default=3)  # 1-5 scale
    notes = Column(Text)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)

    # Foreign keys
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    # Relationships
    project = relationship("Project", back_populates="rooms")
    expenses = relationship("Expense", back_populates="room")

    @property
    def square_footage(self):
        """Calculate room square footage"""
        if self.length_ft and self.width_ft:
            return self.length_ft * self.width_ft
        return None


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True)
    date = Column(DateTime, nullable=False)
    category = Column(Enum(ExpenseCategory), nullable=False)
    cost = Column(Float, nullable=False)
    labor_hours = Column(Float, default=0.0)
    condition_rating = Column(Integer, nullable=False)  # 1-5 scale
    notes = Column(Text)

    # Alert tracking
    is_over_template = Column(Boolean, default=False)
    template_variance_pct = Column(Float)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)

    # Foreign keys
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)

    # Relationships
    project = relationship("Project", back_populates="expenses")
    room = relationship("Room", back_populates="expenses")


# Predefined room types for easy selection
STANDARD_ROOMS = [
    "Living Room",
    "Kitchen",
    "Dining Room",
    "Bathroom 1",
    "Bathroom 2",
    "Bathroom 3",
    "Bedroom 1",
    "Bedroom 2",
    "Bedroom 3",
    "Bedroom 4",
    "Master Bedroom",
    "Basement",
    "Attic",
    "Backyard",
    "Garage",
    "Laundry Room",
    "Office/Study",
    "Family Room",
]
