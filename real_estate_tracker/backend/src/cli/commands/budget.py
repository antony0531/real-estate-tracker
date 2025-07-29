"""
Budget Commands for Real Estate Flip Tracker CLI
Handles budget analysis and status operations
"""

import typer
from rich.console import Console
from rich.panel import Panel
from rich import print as rprint

from ..utils import (
    format_currency,
    format_percentage,
    error_message,
    validate_project_id,
)
from ...database import db_manager
from ...projects import ProjectManager, ExpenseManager

console = Console()
app = typer.Typer(help="Budget analysis commands")


@app.command("status")
def budget_status(project_id: int = typer.Argument(..., help="Project ID")):
    """Show budget status and analysis for a project"""
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

        # Get financial summary
        summary = expense_manager.get_project_summary(project_id)

        if not summary or summary.get("expense_count", 0) == 0:
            rprint(
                Panel(
                    f"[bold cyan]{project.name}[/bold cyan]\n"
                    f"Total Budget: [cyan]{format_currency(project.total_budget)}[/cyan]\n"
                    f"Total Spent: [green]$0.00[/green]\n"
                    f"Remaining: [green]{format_currency(project.total_budget)}[/green]\n"
                    f"Budget Used: [green]0.0%[/green]\n"
                    f"\n[dim]No expenses recorded yet.[/dim]",
                    title="Budget Status",
                )
            )
            return

        # Calculate budget usage percentage
        budget_used = min(summary["budget_used_pct"], 100)
        remaining = summary["remaining_budget"]

        # Determine status color based on budget usage
        status_color = (
            "red" if budget_used >= 100 else "yellow" if budget_used >= 80 else "green"
        )

        # Simple progress bar using ASCII characters
        bar_length = 50
        filled_length = int(min(budget_used, 100) * bar_length // 100)
        bar = "#" * filled_length + "-" * (bar_length - filled_length)

        rprint(
            Panel(
                f"{project.name} - Budget Analysis\n"
                f"Total Budget: {format_currency(summary['total_budget'])}\n"
                f"Total Spent: [{status_color}]{format_currency(summary['total_spent'])}[/{status_color}]\n"
                f"Remaining: [{'red' if remaining < 0 else 'green'}]{format_currency(remaining)}[/{'red' if remaining < 0 else 'green'}]\n"
                f"Budget Used: [{status_color}]{format_percentage(budget_used)}[/{status_color}]\n"
                f"\n[{status_color}][{bar}][/{status_color}] {format_percentage(budget_used)}\n"
                f"\nMaterial Costs: {format_currency(summary['material_costs'])}\n"
                f"Labor Costs: {format_currency(summary['labor_costs'])} ({summary['total_labor_hours']:.1f} hrs)\n"
                + (
                    f"Cost per sq ft: {format_currency(summary['cost_per_sqft'])}\n"
                    if summary.get("cost_per_sqft")
                    else ""
                )
                + (
                    f"\n[red]WARNING: Over budget by {format_currency(abs(remaining))}![/red]"
                    if remaining < 0
                    else (
                        f"\n[yellow]ALERT: {format_percentage(100 - budget_used)} remaining[/yellow]"
                        if budget_used >= 80
                        else ""
                    )
                ),
                title="Budget Status",
                border_style=status_color,
            )
        )

        # Room breakdown if multiple rooms
        if len(project.rooms) > 1:
            rprint("\n[cyan]Cost Breakdown by Room:[/cyan]")
            room_expenses = {}
            for expense in project.expenses:
                room_name = expense.room.name
                if room_name not in room_expenses:
                    room_expenses[room_name] = {
                        "total": 0,
                        "material": 0,
                        "labor": 0,
                        "hours": 0,
                    }
                room_expenses[room_name]["total"] += expense.cost
                if expense.category.value == "material":
                    room_expenses[room_name]["material"] += expense.cost
                else:
                    room_expenses[room_name]["labor"] += expense.cost
                    room_expenses[room_name]["hours"] += expense.labor_hours or 0

            for room, costs in sorted(
                room_expenses.items(), key=lambda x: x[1]["total"], reverse=True
            ):
                pct_of_budget = (costs["total"] / summary["total_budget"]) * 100
                rprint(
                    f"  [cyan]{room}:[/cyan] {format_currency(costs['total'])} "
                    f"({format_percentage(pct_of_budget)} of budget)"
                )
                rprint(
                    f"    Materials: {format_currency(costs['material'])}, "
                    f"Labor: {format_currency(costs['labor'])} ({costs['hours']:.1f} hrs)"
                )

        # Budget alerts and recommendations
        if remaining < 0:
            rprint(f"\n[bold red]BUDGET EXCEEDED:[/bold red] Consider:")
            rprint("  - Review remaining work scope")
            rprint("  - Identify cost-cutting opportunities")
            rprint("  - Update project budget if justified")
        elif budget_used >= 90:
            rprint(f"\n[bold yellow]BUDGET WARNING:[/bold yellow] Monitor closely:")
            rprint("  - Track remaining work carefully")
            rprint("  - Consider contingency planning")
        elif budget_used >= 80:
            rprint(f"\n[bold yellow]BUDGET ALERT:[/bold yellow] Approaching limit:")
            rprint("  - Review upcoming expenses")
            rprint("  - Consider prioritizing essential work")

    except Exception as e:
        error_message(f"Error getting budget status: {e}")
        raise typer.Exit(1)
    finally:
        session.close()


@app.command("summary")
def budget_summary():
    """Show budget summary across all projects"""
    session = db_manager.get_session()
    try:
        project_manager = ProjectManager(session)
        expense_manager = ExpenseManager(session)

        projects = project_manager.list_projects()
        if not projects:
            rprint("No projects found.")
            return

        rprint("[cyan]Budget Summary - All Projects[/cyan]\n")

        total_budgeted = 0
        total_spent = 0
        project_count = 0
        over_budget_count = 0

        for project in projects:
            summary = expense_manager.get_project_summary(project.id)
            if summary:
                total_budgeted += summary["total_budget"]
                total_spent += summary["total_spent"]
                project_count += 1
                if summary["over_budget"]:
                    over_budget_count += 1

                # Quick status line per project
                status = "OVER" if summary["over_budget"] else "OK"
                status_color = "red" if summary["over_budget"] else "green"
                budget_pct = summary["budget_used_pct"]

                rprint(
                    f"[cyan]{project.name}:[/cyan] {format_currency(summary['total_spent'])} / "
                    f"{format_currency(summary['total_budget'])} "
                    f"([{status_color}]{format_percentage(budget_pct)}[/{status_color}] - {status})"
                )

        # Overall summary
        if project_count > 0:
            overall_pct = (
                (total_spent / total_budgeted) * 100 if total_budgeted > 0 else 0
            )
            remaining = total_budgeted - total_spent

            rprint(f"\n[bold]Portfolio Summary:[/bold]")
            rprint(f"Total Projects: {len(projects)}")
            rprint(f"Active Projects: {project_count}")
            rprint(f"Over Budget: {over_budget_count}")
            rprint(f"Total Budgeted: [cyan]{format_currency(total_budgeted)}[/cyan]")
            rprint(f"Total Spent: [yellow]{format_currency(total_spent)}[/yellow]")
            rprint(
                f"Portfolio Remaining: [{'red' if remaining < 0 else 'green'}]{format_currency(remaining)}[/{'red' if remaining < 0 else 'green'}]"
            )
            rprint(f"Overall Usage: {format_percentage(overall_pct)}")

    except Exception as e:
        error_message(f"Error generating budget summary: {e}")
        raise typer.Exit(1)
    finally:
        session.close()
