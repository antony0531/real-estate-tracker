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
from ...models import PropertyType, PropertyClass, ProjectStatus
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
            rprint("No projects found. Create your first project:")
            rprint(
                "   [cyan]real-estate-tracker project create 'My First Flip' 150000 single_family sf_class_c[/cyan]"
            )
            return

        table = Table(title="Your Real Estate Projects")
        table.add_column("ID", style="cyan", width=6)
        table.add_column("Name", style="bold")
        table.add_column("Status", style="yellow")
        table.add_column("Budget", style="green", justify="right")
        table.add_column("Type", style="blue")
        table.add_column("Created", style="dim")

        for project in projects:
            status_color = {
                ProjectStatus.PLANNING: "yellow",
                ProjectStatus.IN_PROGRESS: "blue",
                ProjectStatus.COMPLETED: "green",
                ProjectStatus.ON_HOLD: "red",
            }.get(project.status, "white")

            table.add_row(
                str(project.id),
                project.name,
                f"[{status_color}]{project.status.value.replace('_', ' ').title()}[/{status_color}]",
                f"${project.total_budget:,.0f}",
                project.property_type.value.replace("_", " ").title(),
                project.created_at.strftime("%Y-%m-%d"),
            )

        console.print(table)

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

        # Get financial summary
        summary = expense_manager.get_project_summary(project_id)

        # Project header
        rprint(
            Panel(
                f"[bold cyan]{project.name}[/bold cyan]\n"
                f"Status: [yellow]{project.status.value.replace('_', ' ').title()}[/yellow]\n"
                f"Type: {project.property_type.value.replace('_', ' ').title()} - {project.property_class.value.upper()}\n"
                f"Created: {project.created_at.strftime('%Y-%m-%d')}",
                title="Project Details",
            )
        )

        # Financial summary
        if summary and summary.get("expense_count", 0) > 0:
            budget_color = "red" if summary["over_budget"] else "green"
            remaining_color = "red" if summary["remaining_budget"] < 0 else "green"

            rprint(
                Panel(
                    f"Total Budget: [cyan]{format_currency(summary['total_budget'])}[/cyan]\n"
                    f"Total Spent: [{budget_color}]{format_currency(summary['total_spent'])}[/{budget_color}]\n"
                    f"Remaining: [{remaining_color}]{format_currency(summary['remaining_budget'])}[/{remaining_color}]\n"
                    f"Budget Used: [{budget_color}]{summary['budget_used_pct']:.1f}%[/{budget_color}]\n"
                    f"Materials: {format_currency(summary['material_costs'])}\n"
                    f"Labor: {format_currency(summary['labor_costs'])} ({summary['total_labor_hours']:.1f} hrs)"
                    + (
                        f"\nCost/sq ft: {format_currency(summary['cost_per_sqft'])}"
                        if summary.get("cost_per_sqft")
                        else ""
                    ),
                    title="Financial Summary",
                )
            )
        else:
            rprint(
                Panel(
                    f"Total Budget: [cyan]{format_currency(project.total_budget)}[/cyan]\n"
                    f"Total Spent: [green]$0.00[/green]\n"
                    f"Remaining: [green]{format_currency(project.total_budget)}[/green]\n"
                    f"Budget Used: [green]0.0%[/green]",
                    title="Financial Summary",
                )
            )

        # Show rooms if any exist
        rooms = manager.list_rooms(project_id)
        if rooms:
            room_table = Table(title="Rooms")
            room_table.add_column("Name", style="cyan")
            room_table.add_column("Floor", style="yellow", justify="center")
            room_table.add_column("Size", style="green", justify="right")
            room_table.add_column("Condition", style="blue", justify="center")

            for room in rooms:
                size = (
                    f"{room.square_footage:.0f} sq ft"
                    if room.square_footage
                    else "Not set"
                )
                room_table.add_row(
                    room.name,
                    str(room.floor_number),
                    size,
                    f"{room.initial_condition}/5",
                )

            console.print(room_table)
        else:
            rprint("\nNo rooms added yet. Add your first room:")
            rprint(
                f"   [cyan]real-estate-tracker room add {project_id} 'Living Room' 1 --length 20 --width 15[/cyan]"
            )

    except Exception as e:
        error_message(f"Error showing project: {e}")
        raise typer.Exit(1)
    finally:
        session.close()


@app.command("update")
def update_project(
    project_id: int = typer.Argument(..., help="Project ID to update"),
    name: Optional[str] = typer.Option(None, "--name", "-n", help="New project name"),
    budget: Optional[float] = typer.Option(
        None, "--budget", "-b", help="New budget amount"
    ),
    description: Optional[str] = typer.Option(
        None, "--description", "-d", help="New description"
    ),
    status: Optional[str] = typer.Option(
        None,
        "--status",
        "-s",
        help="New status (planning, in_progress, completed, on_hold)",
    ),
    address: Optional[str] = typer.Option(None, "--address", "-a", help="New address"),
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
