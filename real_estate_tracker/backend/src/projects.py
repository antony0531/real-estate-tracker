"""
Business logic for project management operations
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime
from .models import (
    Project,
    Room,
    Expense,
    User,
    PropertyType,
    PropertyClass,
    ExpenseCategory,
    ProjectStatus,
    Priority,
    STANDARD_ROOMS,
)
from .database import get_db


class ProjectManager:
    """Handle all project-related business logic"""

    def __init__(self, db_session: Session):
        self.db = db_session

    def create_project(
        self,
        name: str,
        budget: float,
        property_type: str,
        property_class: str,
        owner_id: int = 1,
        description: str = None,
        num_floors: int = 2,
        total_sqft: float = None,
        address: str = None,
        priority: str = None,
    ) -> Project:
        """Create a new project"""

        # Convert string enums to enum values
        prop_type = PropertyType(property_type)
        prop_class = PropertyClass(property_class)

        # Handle priority
        proj_priority = Priority.MEDIUM  # Default
        if priority:
            proj_priority = Priority(priority)

        project = Project(
            name=name,
            description=description,
            total_budget=budget,
            property_type=prop_type,
            property_class=prop_class,
            status=ProjectStatus.PLANNING,
            priority=proj_priority,
            num_floors=num_floors,
            total_sqft=total_sqft,
            address=address,
            owner_id=owner_id,
        )

        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)

        return project

    def list_projects(self, owner_id: int = 1) -> List[Project]:
        """Get all projects for a user"""
        return self.db.query(Project).filter_by(owner_id=owner_id).all()

    def get_project(self, project_id: int) -> Optional[Project]:
        """Get a specific project by ID"""
        return self.db.query(Project).filter_by(id=project_id).first()

    def update_project_status(self, project_id: int, status: str) -> bool:
        """Update project status"""
        project = self.get_project(project_id)
        if not project:
            return False

        project.status = ProjectStatus(status)
        project.updated_at = datetime.utcnow()
        self.db.commit()
        return True

    def delete_project(self, project_id: int) -> bool:
        """Delete a project and all associated data"""
        project = self.get_project(project_id)
        if not project:
            return False

        self.db.delete(project)
        self.db.commit()
        return True

    def add_room(
        self,
        project_id: int,
        name: str,
        floor_number: int,
        length_ft: float = None,
        width_ft: float = None,
        height_ft: float = 8.0,
        condition: int = 3,
        notes: str = None,
    ) -> Optional[Room]:
        """Add a room to a project"""

        project = self.get_project(project_id)
        if not project:
            return None

        room = Room(
            name=name,
            floor_number=floor_number,
            length_ft=length_ft,
            width_ft=width_ft,
            height_ft=height_ft,
            initial_condition=condition,
            notes=notes,
            project_id=project_id,
        )

        self.db.add(room)
        self.db.commit()
        self.db.refresh(room)

        return room

    def list_rooms(self, project_id: int) -> List[Room]:
        """Get all rooms for a project"""
        return self.db.query(Room).filter_by(project_id=project_id).all()

    def get_room(self, room_id: int) -> Optional[Room]:
        """Get a specific room by ID"""
        return self.db.query(Room).filter_by(id=room_id).first()

    def get_room_by_name(self, project_id: int, room_name: str) -> Optional[Room]:
        """Get a room by name within a project"""
        return (
            self.db.query(Room).filter_by(project_id=project_id, name=room_name).first()
        )


class ExpenseManager:
    """Handle all expense-related business logic"""

    def __init__(self, db_session: Session):
        self.db = db_session

    def add_expense(
        self,
        project_id: int,
        room_name: str,
        category: str,
        cost: float,
        labor_hours: float = 0.0,
        condition_rating: int = 3,
        notes: str = None,
        date: datetime = None,
    ) -> Optional[Expense]:
        """Add an expense to a project room"""

        # Get the room
        room = (
            self.db.query(Room).filter_by(project_id=project_id, name=room_name).first()
        )

        if not room:
            return None

        expense = Expense(
            date=date or datetime.now(),
            category=ExpenseCategory(category),
            cost=cost,
            labor_hours=labor_hours,
            condition_rating=condition_rating,
            notes=notes,
            project_id=project_id,
            room_id=room.id,
        )

        self.db.add(expense)
        self.db.commit()
        self.db.refresh(expense)

        return expense

    def list_expenses(self, project_id: int) -> List[Expense]:
        """Get all expenses for a project"""
        return self.db.query(Expense).filter_by(project_id=project_id).all()

    def get_room_expenses(self, project_id: int, room_name: str) -> List[Expense]:
        """Get expenses for a specific room"""
        room = (
            self.db.query(Room).filter_by(project_id=project_id, name=room_name).first()
        )

        if not room:
            return []

        return (
            self.db.query(Expense)
            .filter_by(project_id=project_id, room_id=room.id)
            .all()
        )

    def get_project_summary(self, project_id: int) -> Dict[str, Any]:
        """Get comprehensive project financial summary"""

        project = self.db.query(Project).filter_by(id=project_id).first()
        if not project:
            return {}

        expenses = self.list_expenses(project_id)

        total_spent = sum(expense.cost for expense in expenses)
        total_labor_hours = sum(expense.labor_hours for expense in expenses)

        material_costs = sum(
            expense.cost
            for expense in expenses
            if expense.category == ExpenseCategory.MATERIAL
        )
        labor_costs = sum(
            expense.cost
            for expense in expenses
            if expense.category == ExpenseCategory.LABOR
        )

        remaining_budget = project.total_budget - total_spent
        budget_used_pct = (
            (total_spent / project.total_budget * 100)
            if project.total_budget > 0
            else 0
        )

        # Cost per sq ft calculation
        cost_per_sqft = None
        if project.total_sqft and project.total_sqft > 0:
            cost_per_sqft = total_spent / project.total_sqft

        return {
            "project": project,
            "total_budget": project.total_budget,
            "total_spent": total_spent,
            "remaining_budget": remaining_budget,
            "budget_used_pct": budget_used_pct,
            "material_costs": material_costs,
            "labor_costs": labor_costs,
            "total_labor_hours": total_labor_hours,
            "cost_per_sqft": cost_per_sqft,
            "expense_count": len(expenses),
            "over_budget": total_spent > project.total_budget,
        }

    def get_room_summary(self, project_id: int, room_name: str) -> Dict[str, Any]:
        """Get financial summary for a specific room"""

        room = (
            self.db.query(Room).filter_by(project_id=project_id, name=room_name).first()
        )

        if not room:
            return {}

        expenses = self.get_room_expenses(project_id, room_name)

        total_spent = sum(expense.cost for expense in expenses)
        total_labor_hours = sum(expense.labor_hours for expense in expenses)

        material_costs = sum(
            expense.cost
            for expense in expenses
            if expense.category == ExpenseCategory.MATERIAL
        )
        labor_costs = sum(
            expense.cost
            for expense in expenses
            if expense.category == ExpenseCategory.LABOR
        )

        # Cost per sq ft for this room
        cost_per_sqft = None
        if room.square_footage and room.square_footage > 0:
            cost_per_sqft = total_spent / room.square_footage

        return {
            "room": room,
            "total_spent": total_spent,
            "material_costs": material_costs,
            "labor_costs": labor_costs,
            "total_labor_hours": total_labor_hours,
            "cost_per_sqft": cost_per_sqft,
            "expense_count": len(expenses),
            "square_footage": room.square_footage,
        }
