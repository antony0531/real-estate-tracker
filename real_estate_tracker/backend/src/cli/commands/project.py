"""
Project Commands for Real Estate Flip Tracker CLI
Handles project creation, listing, showing, updating, and deletion
"""

import typer
from typing import Optional
from rich.console import Console
from rich.table import Table
from rich import print as rprint
from rich.panel import Panel
from datetime import datetime

from ..utils import (
    format_currency,
    success_message,
    error_message,
    warning_message,
    confirm_deletion,
    validate_project_id,
)
from ...database import db_manager
from ...models import PropertyType, PropertyClass, ProjectStatus, Priority
from ...projects import ProjectManager, ExpenseManager

console = Console()
app = typer.Typer(help="Project management commands")


@app.command("create")
def create_project(
    name: str = typer.Argument(..., help="Project name"),
    budget: float = typer.Argument(..., help="Total renovation budget"),
    property_type: str = typer.Argument(
        ..., help="Property type (single_family or multifamily)"
    ),
    property_class: str = typer.Argument(
        ...,
        help="Property class (sf_class_a, sf_class_b, sf_class_c, sf_class_d, mf_class_a, mf_class_b, mf_class_c)",
    ),
    description: Optional[str] = typer.Option(
        None, "--description", "-d", help="Project description"
    ),
    floors: int = typer.Option(2, "--floors", "-f", help="Number of floors"),
    sqft: Optional[float] = typer.Option(
        None, "--sqft", "-s", help="Total square footage"
    ),
    address: Optional[str] = typer.Option(
        None, "--address", "-a", help="Property address"
    ),
    priority: Optional[str] = typer.Option(
        None, "--priority", "-p", help="Project priority (low, medium, high, urgent)"
    ),
):
    """Create a new renovation project"""

    # Validate property type and class
    valid_types = [t.value for t in PropertyType]
    valid_classes = [c.value for c in PropertyClass]

    if property_type not in valid_types:
        error_message(f"Invalid property type. Choose from: {', '.join(valid_types)}")
        raise typer.Exit(1)

    if property_class not in valid_classes:
        error_message(
            f"Invalid property class. Choose from: {', '.join(valid_classes)}"
        )
        raise typer.Exit(1)

    # Validate priority if provided
    if priority is not None:
        valid_priorities = [p.value for p in Priority]
        if priority not in valid_priorities:
            error_message(
                f"Invalid priority. Choose from: {', '.join(valid_priorities)}"
            )
            raise typer.Exit(1)

    session = db_manager.get_session()
    try:
        manager = ProjectManager(session)
        project = manager.create_project(
            name=name,
            budget=budget,
            property_type=property_type,
            property_class=property_class,
            description=description,
            num_floors=floors,
            total_sqft=sqft,
            address=address,
            priority=priority,
        )

        success_message(f"Created project: {project.name} (ID: {project.id})")
        rprint(f"[cyan]$ Budget: {format_currency(budget)}[/cyan]")
        rprint(
            f"[yellow]Type: {property_type.replace('_', ' ').title()}[/yellow] - {property_class.upper()}"
        )

        if sqft:
            rprint(f"Size: {sqft:,.0f} sq ft")

        rprint("\n>> Next steps:")
        rprint(
            f"   [cyan]real-estate-tracker room add {project.id} 'Living Room' 1 --length 20 --width 15[/cyan]"
        )

    except Exception as e:
        error_message(f"Error creating project: {e}")
        raise typer.Exit(1)
    finally:
        session.close()


@app.command("list")
def list_projects():
    """List all projects"""
    session = db_manager.get_session()
    try:
        manager = ProjectManager(session)
        projects = manager.list_projects()

        if not projects:
            print("No projects found")
            return

        # Print table header
        print("┌──────┬────────────┬──────────┬──────────┬────────────┬──────────┬────────────┐")
        print("│ ID   │ Name       │ Status   │ Priority │ Budget     │ Type     │ Created    │")
        print("├──────┼────────────┼──────────┼──────────┼────────────┼──────────┼────────────┤")

        # Print projects
        for project in projects:
            print(f"│ {project.id:<4} │ {project.name:<10} │ {project.status.value:<8} │ {project.priority.value:<8} │ ${project.total_budget:<9,.0f} │ {project.property_type.value:<8} │ {project.created_at.strftime('%Y-%m-%d')} │")

        # Print table footer
        print("└──────┴────────────┴──────────┴──────────┴────────────┴──────────┴────────────┘")

    except Exception as e:
        error_message(f"Error listing projects: {e}")
        raise typer.Exit(1)
    finally:
        session.close()


@app.command("show")
def show_project(project_id: int = typer.Argument(..., help="Project ID")):
    """Show detailed project information"""
    if not validate_project_id(project_id):
        raise typer.Exit(1)

    session = db_manager.get_session()
    try:
        manager = ProjectManager(session)
        expense_manager = ExpenseManager(session)

        project = manager.get_project(project_id)
        if not project:
            error_message(f"Project {project_id} not found")
            raise typer.Exit(1)

        # Print table header
        print("┌──────┬────────────┬──────────┬──────────┬────────────┬──────────┬────────────┐")
        print("│ ID   │ Name       │ Status   │ Priority │ Budget     │ Type     │ Created    │")
        print("├──────┼────────────┼──────────┼──────────┼────────────┼──────────┼────────────┤")

        # Print project
        print(f"│ {project.id:<4} │ {project.name:<10} │ {project.status.value:<8} │ {project.priority.value:<8} │ ${project.total_budget:<9,.0f} │ {project.property_type.value:<8} │ {project.created_at.strftime('%Y-%m-%d')} │")

        # Print table footer
        print("└──────┴────────────┴──────────┴──────────┴────────────┴──────────┴────────────┘")

    except Exception as e:
        error_message(f"Error showing project: {e}")
        raise typer.Exit(1)
    finally:
        session.close()


@app.command("update")
def update_project(
    project_id: int = typer.Argument(..., help="Project ID to update"),
    name: Optional[str] = typer.Option(None, "--name", "-n", help="New project name"),
    budget: Optional[float] = typer.Option(None, "--budget", "-b", help="New budget"),
    description: Optional[str] = typer.Option(
        None, "--description", "-d", help="New description"
    ),
    floors: Optional[int] = typer.Option(
        None, "--floors", "-f", help="New number of floors"
    ),
    sqft: Optional[float] = typer.Option(
        None, "--sqft", "-s", help="New square footage"
    ),
    address: Optional[str] = typer.Option(None, "--address", "-a", help="New address"),
    status: Optional[str] = typer.Option(
        None,
        "--status",
        "-st",
        help="New status (planning, in_progress, completed, on_hold)",
    ),
    priority: Optional[str] = typer.Option(
        None,
        "--priority",
        "-p",
        help="New priority (low, medium, high, urgent)",
    ),
):
    """Update project details"""
    if not validate_project_id(project_id):
        raise typer.Exit(1)

    session = db_manager.get_session()
    try:
        manager = ProjectManager(session)
        project = manager.get_project(project_id)

        if not project:
            error_message(f"Project {project_id} not found")
            raise typer.Exit(1)

        updates = []

        # Update fields if provided
        if name is not None:
            old_name = project.name
            project.name = name
            updates.append(f"Name: '{old_name}' -> '{name}'")

        if budget is not None:
            if budget < 0:
                error_message("Budget cannot be negative")
                raise typer.Exit(1)
            old_budget = project.total_budget
            project.total_budget = budget
            updates.append(
                f"Budget: {format_currency(old_budget)} -> {format_currency(budget)}"
            )

        if description is not None:
            project.description = description
            updates.append(f"Description updated")

        if status is not None:
            valid_statuses = [s.value for s in ProjectStatus]
            if status not in valid_statuses:
                error_message(
                    f"Invalid status. Choose from: {', '.join(valid_statuses)}"
                )
                raise typer.Exit(1)
            old_status = project.status.value
            project.status = ProjectStatus(status)
            updates.append(f"Status: {old_status} -> {status}")

        if priority is not None:
            valid_priorities = [p.value for p in Priority]
            if priority not in valid_priorities:
                error_message(
                    f"Invalid priority. Choose from: {', '.join(valid_priorities)}"
                )
                raise typer.Exit(1)
            old_priority = project.priority.value
            project.priority = Priority(priority)
            updates.append(f"Priority: {old_priority} -> {priority}")

        if address is not None:
            project.address = address
            updates.append(f"Address updated")

        if not updates:
            warning_message(
                "No changes specified. Use --help to see available options."
            )
            return

        # Update timestamp
        project.updated_at = datetime.utcnow()

        session.commit()

        success_message(f"Successfully updated project: {project.name}")
        rprint("[cyan]Changes made:[/cyan]")
        for update in updates:
            rprint(f"  - {update}")

    except Exception as e:
        session.rollback()
        error_message(f"Error updating project: {e}")
        raise typer.Exit(1)
    finally:
        session.close()


@app.command("delete")
def delete_project(
    project_id: int = typer.Argument(..., help="Project ID to delete"),
    force: bool = typer.Option(False, "--force", "-f", help="Skip confirmation prompt"),
):
    """Delete a project and all its data (DESTRUCTIVE)"""
    if not validate_project_id(project_id):
        raise typer.Exit(1)

    session = db_manager.get_session()
    try:
        manager = ProjectManager(session)
        project = manager.get_project(project_id)

        if not project:
            error_message(f"Project {project_id} not found")
            raise typer.Exit(1)

        # Show what will be deleted
        room_count = len(project.rooms)
        expense_count = len(project.expenses)
        total_spent = sum(e.cost for e in project.expenses)

        warning_message(f"About to delete project '{project.name}'")
        rprint(f"This will permanently delete:")
        rprint(f"  - Project: {project.name}")
        rprint(f"  - Rooms: {room_count}")
        rprint(f"  - Expenses: {expense_count} ({format_currency(total_spent)} total)")
        rprint(f"  - All associated data")
        rprint("\nThis action CANNOT be undone!")

        if not force:
            if not confirm_deletion(project.name, "project"):
                warning_message("Project deletion cancelled.")
                return

            # Double confirmation for safety
            import typer

            expected_name = typer.prompt(f"Type '{project.name}' exactly to confirm")
            if expected_name != project.name:
                warning_message("Project name mismatch. Deletion cancelled for safety.")
                return

        # Perform deletion
        try:
            session.delete(project)
            session.commit()
            success_message(
                f"Successfully deleted project '{project.name}' and all associated data."
            )
        except Exception as e:
            session.rollback()
            error_message(f"Failed to delete project: {e}")
            raise typer.Exit(1)

    except Exception as e:
        error_message(f"Error during project deletion: {e}")
        raise typer.Exit(1)
    finally:
        session.close()
