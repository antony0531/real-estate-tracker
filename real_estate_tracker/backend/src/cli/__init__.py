"""
CLI Module for Real Estate Flip Tracker
Modular command organization for better maintainability
"""

import sys
import os
import typer
from .commands import project, room, expense, budget, export, system

# Ensure UTF-8 encoding for all output (prevents Windows charmap issues)
if sys.platform.startswith("win"):
    # Set UTF-8 encoding for Windows console output
    os.environ.setdefault("PYTHONIOENCODING", "utf-8")
    # Reconfigure stdout/stderr for UTF-8 if needed
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
            sys.stderr.reconfigure(encoding="utf-8")
        except (AttributeError, OSError):
            # Fallback for older Python versions or restricted environments
            pass

# Main CLI application
app = typer.Typer(
    name="real-estate-tracker",
    help="Track renovation budgets for house flipping projects",
    rich_markup_mode="rich",
)

# Add system commands directly to main app
app.add_typer(system.app, name="system")
app.command("init")(system.init_app)
app.command("reset")(system.reset_app)
app.command("version")(system.show_version)
app.command("status")(system.show_status)

# Add feature-specific command groups
app.add_typer(project.app, name="project")
app.add_typer(room.app, name="room")
app.add_typer(expense.app, name="expense")
app.add_typer(budget.app, name="budget")
app.add_typer(export.app, name="export")


def main():
    """Main entry point for the CLI"""
    app()


if __name__ == "__main__":
    main()
