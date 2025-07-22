"""
Room Commands for Real Estate Flip Tracker CLI
Handles room addition, listing, and deletion operations
"""

import typer
from typing import Optional
from rich.console import Console
from rich.table import Table
from rich import print as rprint

from ..utils import (
    success_message,
    error_message,
    warning_message,
    confirm_deletion,
    validate_project_id,
)
from ...database import db_manager
from ...projects import ProjectManager

console = Console()
app = typer.Typer(help="Room management commands")


@app.command("add")
def add_room(
    project_id: int = typer.Argument(..., help="Project ID"),
    name: str = typer.Argument(..., help="Room name"),
    floor: int = typer.Argument(..., help="Floor number"),
    length: Optional[float] = typer.Option(
        None, "--length", "-l", help="Room length in feet"
    ),
    width: Optional[float] = typer.Option(
        None, "--width", "-w", help="Room width in feet"
    ),
    height: float = typer.Option(8.0, "--height", "-h", help="Room height in feet"),
    condition: int = typer.Option(
        3, "--condition", "-c", help="Initial condition (1-5 scale)"
    ),
    notes: Optional[str] = typer.Option(None, "--notes", "-n", help="Additional notes"),
):
    """Add a room to a project"""

    if not validate_project_id(project_id):
        raise typer.Exit(1)

    if condition < 1 or condition > 5:
        error_message("Condition must be between 1-5")
        raise typer.Exit(1)

    session = db_manager.get_session()
    try:
        manager = ProjectManager(session)
        room = manager.add_room(
            project_id=project_id,
            name=name,
            floor_number=floor,
            length_ft=length,
            width_ft=width,
            height_ft=height,
            condition=condition,
            notes=notes,
        )

        if room:
            success_message(f"Added room: {room.name} to project {project_id}")
            rprint(f"Floor {floor}, Condition: {condition}/5")
            if room.square_footage:
                rprint(f"Size: {room.square_footage:.0f} sq ft ({length}x{width})")

            rprint("\nNext step - Add your first expense:")
            rprint(
                f"   [cyan]real-estate-tracker expense add {project_id} '{name}' material 1500 --notes 'Flooring materials'[/cyan]"
            )
        else:
            error_message(f"Project {project_id} not found")
            raise typer.Exit(1)

    except Exception as e:
        error_message(f"Error adding room: {e}")
        raise typer.Exit(1)
    finally:
        session.close()


@app.command("list")
def list_rooms(project_id: int = typer.Argument(..., help="Project ID")):
    """List all rooms in a project"""
    if not validate_project_id(project_id):
        raise typer.Exit(1)

    session = db_manager.get_session()
    try:
        manager = ProjectManager(session)
        project = manager.get_project(project_id)

        if not project:
            error_message(f"Project {project_id} not found")
            raise typer.Exit(1)

        rooms = manager.list_rooms(project_id)

        if not rooms:
            rprint(f"No rooms found for project: [cyan]{project.name}[/cyan]")
            rprint("Add your first room:")
            rprint(
                f"   [cyan]real-estate-tracker room add {project_id} 'Living Room' 1[/cyan]"
            )
            return

        rprint(f"[cyan]Rooms in Project: {project.name}[/cyan]\n")

        table = Table(title="Room Details")
        table.add_column("Name", style="cyan")
        table.add_column("Floor", style="yellow", justify="center")
        table.add_column("Size", style="green", justify="right")
        table.add_column("Condition", style="blue", justify="center")
        table.add_column("Notes", style="dim", no_wrap=False)

        for room in rooms:
            size = (
                f"{room.square_footage:.0f} sq ft" if room.square_footage else "Not set"
            )
            notes = (
                room.notes[:50] + "..."
                if room.notes and len(room.notes) > 50
                else (room.notes or "")
            )

            table.add_row(
                room.name,
                str(room.floor_number),
                size,
                f"{room.initial_condition}/5",
                notes,
            )

        console.print(table)

    except Exception as e:
        error_message(f"Error listing rooms: {e}")
        raise typer.Exit(1)
    finally:
        session.close()


@app.command("delete")
def delete_room(
    project_id: int = typer.Argument(..., help="Project ID"),
    room_name: str = typer.Argument(..., help="Room name to delete"),
    force: bool = typer.Option(False, "--force", "-f", help="Skip confirmation prompt"),
):
    """Delete a room and all its expenses"""
    if not validate_project_id(project_id):
        raise typer.Exit(1)

    session = db_manager.get_session()
    try:
        manager = ProjectManager(session)
        project = manager.get_project(project_id)

        if not project:
            error_message(f"Project {project_id} not found")
            raise typer.Exit(1)

        # Find the room
        room = None
        for r in project.rooms:
            if r.name.lower() == room_name.lower():
                room = r
                break

        if not room:
            error_message(f"Room '{room_name}' not found in project {project_id}")
            raise typer.Exit(1)

        expense_count = len(room.expenses)
        total_spent = sum(e.cost for e in room.expenses)

        warning_message(f"About to delete room: {room.name}")
        if expense_count > 0:
            rprint(
                f"This will also delete {expense_count} expenses (${total_spent:,.2f} total)"
            )

        if not force:
            if not confirm_deletion(room.name, "room"):
                warning_message("Room deletion cancelled.")
                return

        # Delete the room (cascades to expenses)
        session.delete(room)
        session.commit()
        success_message(
            f"Successfully deleted room '{room.name}' and {expense_count} expenses."
        )

    except Exception as e:
        session.rollback()
        error_message(f"Error deleting room: {e}")
        raise typer.Exit(1)
    finally:
        session.close()
