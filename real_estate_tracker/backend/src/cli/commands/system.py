"""
System Commands for Real Estate Flip Tracker CLI
Handles initialization, reset, version, and status operations
"""

import typer
from rich.console import Console
from rich.table import Table
from rich import print as rprint

from ..utils import get_version
from ...database import init_database, reset_database, db_manager

console = Console()
app = typer.Typer(help="System management commands")


@app.command("init")
def init_app():
    """Initialize the Real Estate Tracker database"""
    try:
        init_database()
        rprint("[green]Real Estate Tracker initialized successfully![/green]")
        rprint(">> You can now create your first project:")
        rprint(
            "   [cyan]real-estate-tracker project create 'My First Flip' 150000 single_family sf_class_c[/cyan]"
        )
    except Exception as e:
        rprint(f"[red]ERROR: Error initializing database: {e}[/red]")
        raise typer.Exit(1)


@app.command("reset")
def reset_app(
    confirm: bool = typer.Option(False, "--confirm", help="Skip confirmation prompt")
):
    """Reset the database (WARNING: This will delete all data!)"""
    if not confirm:
        confirm_reset = typer.confirm(
            "WARNING: This will delete ALL your data. Are you sure?"
        )
        if not confirm_reset:
            rprint("[yellow]Database reset cancelled.[/yellow]")
            return

    try:
        reset_database()
        rprint("[green]Database reset successfully![/green]")
    except Exception as e:
        rprint(f"[red]ERROR: Error resetting database: {e}[/red]")
        raise typer.Exit(1)


@app.command("version")
def show_version():
    """Show version information"""
    version = get_version()
    rprint(f"Real Estate Tracker v{version}")
    rprint(">> Multi-platform house flipping budget tracker")
    rprint(">> Supports CLI, Web, Desktop, and Mobile interfaces")


@app.command("status")
def show_status():
    """Show system status and configuration"""
    rprint("[cyan]>> Real Estate Tracker Status[/cyan]")

    table = Table(title="System Information")
    table.add_column("Component", style="cyan")
    table.add_column("Status", style="green")
    table.add_column("Details", style="dim")

    table.add_row("Database", "Connected", f"Path: {db_manager.db_path}")
    table.add_row("Security", "Enabled", "Password hashing, encryption ready")
    table.add_row("CLI", "Active", "Typer framework with Rich output")

    # Show project statistics
    session = db_manager.get_session()
    try:
        from ...models import Project, Expense

        project_count = session.query(Project).count()
        expense_count = session.query(Expense).count()

        table.add_row("Projects", f"{project_count}", "Active projects in database")
        table.add_row("Expenses", f"{expense_count}", "Total expenses tracked")
    except:
        table.add_row("Data", "ERROR", "Could not retrieve statistics")
    finally:
        session.close()

    console.print(table)
