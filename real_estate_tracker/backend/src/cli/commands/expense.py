"""
Expense Commands for Real Estate Flip Tracker CLI
Handles expense addition, listing, and deletion operations
"""

import typer
from typing import Optional
from rich.console import Console
from rich.table import Table
from rich import print as rprint

from ..utils import (
    format_currency,
    success_message,
    error_message,
    warning_message,
    confirm_deletion,
    validate_project_id,
)
from ...database import db_manager
from ...models import ExpenseCategory
from ...projects import ProjectManager, ExpenseManager

console = Console()
app = typer.Typer(help="Expense tracking commands")


@app.command("add")
def add_expense(
    project_id: int = typer.Argument(..., help="Project ID"),
    room_name: str = typer.Argument(..., help="Room name"),
    category: str = typer.Argument(..., help="Expense category (material or labor)"),
    cost: float = typer.Argument(..., help="Cost amount"),
    hours: float = typer.Option(
        0.0, "--hours", "-h", help="Labor hours (for labor category)"
    ),
    condition: int = typer.Option(
        3, "--condition", "-c", help="Room condition after work (1-5 scale)"
    ),
    notes: Optional[str] = typer.Option(None, "--notes", "-n", help="Expense notes"),
):
    """Add an expense to a project room"""

    if not validate_project_id(project_id):
        raise typer.Exit(1)

    valid_categories = [c.value for c in ExpenseCategory]
    if category not in valid_categories:
        error_message(f"Invalid category. Choose from: {', '.join(valid_categories)}")
        raise typer.Exit(1)

    if condition < 1 or condition > 5:
        error_message("Condition must be between 1-5")
        raise typer.Exit(1)

    if cost < 0:
        error_message("Cost cannot be negative")
        raise typer.Exit(1)

    session = db_manager.get_session()
    try:
        manager = ExpenseManager(session)
        expense = manager.add_expense(
            project_id=project_id,
            room_name=room_name,
            category=category,
            cost=cost,
            labor_hours=hours,
            condition_rating=condition,
            notes=notes,
        )

        if expense:
            rprint(
                f"Added expense: [green]{format_currency(cost)}[/green] for {category} in [cyan]{room_name}[/cyan]"
            )
            if category == "labor" and hours > 0:
                rprint(f"Time: {hours} hours (${cost/hours:.2f}/hr)")
            if notes:
                rprint(f"Notes: {notes}")
        else:
            error_message(f"Room '{room_name}' not found in project {project_id}")
            raise typer.Exit(1)

    except Exception as e:
        error_message(f"Error adding expense: {e}")
        raise typer.Exit(1)
    finally:
        session.close()


@app.command("list")
def list_expenses(
    project_id: int = typer.Argument(..., help="Project ID"),
    room_name: Optional[str] = typer.Option(
        None, "--room", "-r", help="Filter by room name"
    ),
    category: Optional[str] = typer.Option(
        None, "--category", "-c", help="Filter by category (material/labor)"
    ),
):
    """List expenses for a project with optional filters"""
    if not validate_project_id(project_id):
        raise typer.Exit(1)

    session = db_manager.get_session()
    try:
        project_manager = ProjectManager(session)
        expense_manager = ExpenseManager(session)

        project = project_manager.get_project(project_id)
        if not project:
            error_message(f"Project {project_id} not found")
            raise typer.Exit(1)

        expenses = expense_manager.list_expenses(project_id)

        # Apply filters
        if room_name:
            expenses = [e for e in expenses if e.room.name.lower() == room_name.lower()]
        if category:
            valid_categories = [c.value for c in ExpenseCategory]
            if category not in valid_categories:
                error_message(
                    f"Invalid category. Choose from: {', '.join(valid_categories)}"
                )
                raise typer.Exit(1)
            expenses = [e for e in expenses if e.category.value == category]

        if not expenses:
            filter_text = ""
            if room_name:
                filter_text += f" in room '{room_name}'"
            if category:
                filter_text += f" for {category}"
            rprint(
                f"No expenses found for project: [cyan]{project.name}[/cyan]{filter_text}"
            )
            return

        # Calculate totals
        total_cost = sum(e.cost for e in expenses)
        total_hours = sum(e.labor_hours for e in expenses if e.labor_hours)

        filter_info = ""
        if room_name or category:
            filters = []
            if room_name:
                filters.append(f"Room: {room_name}")
            if category:
                filters.append(f"Category: {category}")
            filter_info = f" ({', '.join(filters)})"

        rprint(f"[cyan]Expenses for Project: {project.name}[/cyan]{filter_info}\n")

        table = Table(title="Expense Details")
        table.add_column("Date", style="dim", width=10)
        table.add_column("Room", style="cyan", width=12)
        table.add_column("Category", style="yellow", width=10)
        table.add_column("Cost", style="green", justify="right", width=12)
        table.add_column("Hours", style="blue", justify="right", width=8)
        table.add_column("Notes", style="dim", no_wrap=False)

        for expense in sorted(expenses, key=lambda x: x.created_at, reverse=True):
            notes = (
                expense.notes[:40] + "..."
                if expense.notes and len(expense.notes) > 40
                else (expense.notes or "")
            )
            hours_text = (
                f"{expense.labor_hours:.1f}" if expense.labor_hours > 0 else "-"
            )

            table.add_row(
                expense.created_at.strftime("%Y-%m-%d"),
                expense.room.name,
                expense.category.value.title(),
                format_currency(expense.cost),
                hours_text,
                notes,
            )

        console.print(table)

        # Summary
        rprint(
            f"\n[bold]Total Cost:[/bold] [green]{format_currency(total_cost)}[/green]"
        )
        if total_hours > 0:
            rprint(f"[bold]Total Hours:[/bold] [blue]{total_hours:.1f}[/blue]")
            avg_hourly = (
                (sum(e.cost for e in expenses if e.labor_hours > 0) / total_hours)
                if total_hours > 0
                else 0
            )
            if avg_hourly > 0:
                rprint(
                    f"[bold]Average Hourly:[/bold] [yellow]{format_currency(avg_hourly)}/hr[/yellow]"
                )

    except Exception as e:
        error_message(f"Error listing expenses: {e}")
        raise typer.Exit(1)
    finally:
        session.close()


@app.command("delete")
def delete_expense(
    expense_id: int = typer.Argument(..., help="Expense ID to delete"),
    force: bool = typer.Option(False, "--force", "-f", help="Skip confirmation prompt"),
):
    """Delete a specific expense by ID"""
    session = db_manager.get_session()
    try:
        from ...models import Expense

        expense = session.query(Expense).filter_by(id=expense_id).first()
        if not expense:
            error_message(f"Expense {expense_id} not found")
            raise typer.Exit(1)

        # Show expense details
        rprint(f"[yellow]About to delete expense:[/yellow]")
        rprint(f"  ID: {expense.id}")
        rprint(f"  Project: {expense.project.name}")
        rprint(f"  Room: {expense.room.name}")
        rprint(f"  Category: {expense.category.value.title()}")
        rprint(f"  Cost: {format_currency(expense.cost)}")
        rprint(f"  Date: {expense.created_at.strftime('%Y-%m-%d')}")
        if expense.labor_hours > 0:
            rprint(f"  Hours: {expense.labor_hours:.1f}")
        if expense.notes:
            rprint(f"  Notes: {expense.notes}")

        if not force:
            if not confirm_deletion(format_currency(expense.cost), "expense"):
                warning_message("Expense deletion cancelled.")
                return

        session.delete(expense)
        session.commit()
        success_message(
            f"Successfully deleted expense {format_currency(expense.cost)} from {expense.room.name}."
        )

    except Exception as e:
        session.rollback()
        error_message(f"Error deleting expense: {e}")
        raise typer.Exit(1)
    finally:
        session.close()
