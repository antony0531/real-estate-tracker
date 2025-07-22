"""
CLI Utilities for Real Estate Flip Tracker
Shared functionality used across command modules
"""

from typing import Optional
from rich.console import Console
from rich import print as rprint

console = Console()


def get_version() -> str:
    """Get the application version"""
    try:
        from .. import __version__

        return __version__
    except ImportError:
        return "0.1.0"


def format_currency(amount: float) -> str:
    """Format a number as currency"""
    return f"${amount:,.2f}"


def format_percentage(value: float) -> str:
    """Format a decimal as percentage"""
    return f"{value:.1f}%"


def success_message(message: str):
    """Display a success message"""
    rprint(f"[green]{message}[/green]")


def error_message(message: str):
    """Display an error message"""
    rprint(f"[red]ERROR: {message}[/red]")


def warning_message(message: str):
    """Display a warning message"""
    rprint(f"[yellow]{message}[/yellow]")


def info_message(message: str):
    """Display an info message"""
    rprint(f"[cyan]{message}[/cyan]")


def validate_project_id(project_id: Optional[int]) -> bool:
    """Validate that project ID is provided and valid"""
    if project_id is None or project_id <= 0:
        error_message("Invalid project ID provided")
        return False
    return True


def confirm_deletion(item_name: str, item_type: str = "item") -> bool:
    """Get user confirmation for deletion operations"""
    import typer

    warning_message(f"About to delete {item_type}: {item_name}")
    rprint("This action CANNOT be undone!")

    return typer.confirm(f"Are you sure you want to delete this {item_type}?")
