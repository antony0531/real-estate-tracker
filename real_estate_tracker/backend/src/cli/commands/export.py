"""
Export Commands for Real Estate Flip Tracker CLI
Handles data export operations (CSV, reports, etc.)
"""

import typer
import csv
import os
from typing import Optional
from rich import print as rprint

from ..utils import format_currency, success_message, error_message, validate_project_id
from ...database import db_manager
from ...projects import ProjectManager, ExpenseManager

app = typer.Typer(help="Data export commands")


@app.command("csv")
def export_csv(
    project_id: int = typer.Argument(..., help="Project ID to export"),
    output_file: Optional[str] = typer.Option(
        None, "--output", "-o", help="Output CSV filename"
    ),
    no_rooms: bool = typer.Option(False, "--no-rooms", help="Exclude room details"),
    no_expenses: bool = typer.Option(
        False, "--no-expenses", help="Exclude expense details"
    ),
):
    """Export project data to CSV format"""
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

        # Generate filename if not provided
        if not output_file:
            safe_name = "".join(
                c for c in project.name if c.isalnum() or c in (" ", "-", "_")
            ).rstrip()
            safe_name = safe_name.replace(" ", "_")
            output_file = f"{safe_name}_export.csv"
        else:
            # Security: Sanitize user-provided filename to prevent path traversal
            import os.path

            output_file = os.path.basename(output_file)  # Remove any directory paths
            if not output_file.endswith(".csv"):
                output_file += ".csv"
            # Additional sanitization
            safe_chars = set(
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-_"
            )
            output_file = "".join(c if c in safe_chars else "_" for c in output_file)

        # Get financial summary
        summary = expense_manager.get_project_summary(project_id)

        with open(output_file, "w", newline="", encoding="utf-8") as csvfile:
            writer = csv.writer(csvfile)

            # Project header information
            writer.writerow(["Real Estate Tracker - Project Export"])
            writer.writerow([])
            writer.writerow(["Project Details"])
            writer.writerow(["Name", project.name])
            writer.writerow(["Status", project.status.value.replace("_", " ").title()])
            writer.writerow(
                [
                    "Property Type",
                    project.property_type.value.replace("_", " ").title(),
                ]
            )
            writer.writerow(["Property Class", project.property_class.value.upper()])
            writer.writerow(["Created", project.created_at.strftime("%Y-%m-%d")])
            if project.address:
                writer.writerow(["Address", project.address])
            if project.description:
                writer.writerow(["Description", project.description])
            writer.writerow([])

            # Financial summary
            writer.writerow(["Financial Summary"])
            if summary:
                writer.writerow(["Total Budget", summary["total_budget"]])
                writer.writerow(["Total Spent", summary["total_spent"]])
                writer.writerow(["Remaining Budget", summary["remaining_budget"]])
                writer.writerow(["Budget Used %", f"{summary['budget_used_pct']:.1f}%"])
                writer.writerow(["Material Costs", summary["material_costs"]])
                writer.writerow(["Labor Costs", summary["labor_costs"]])
                writer.writerow(["Total Labor Hours", summary["total_labor_hours"]])
                if summary.get("cost_per_sqft"):
                    writer.writerow(["Cost per Sq Ft", summary["cost_per_sqft"]])
            else:
                writer.writerow(["Total Budget", project.total_budget])
                writer.writerow(["Total Spent", 0])
                writer.writerow(["Remaining Budget", project.total_budget])
                writer.writerow(["Budget Used %", "0.0%"])
            writer.writerow([])

            # Room details
            if not no_rooms and project.rooms:
                writer.writerow(["Room Details"])
                writer.writerow(
                    [
                        "Room Name",
                        "Floor",
                        "Square Footage",
                        "Initial Condition",
                        "Length (ft)",
                        "Width (ft)",
                        "Height (ft)",
                        "Notes",
                    ]
                )
                for room in project.rooms:
                    writer.writerow(
                        [
                            room.name,
                            room.floor_number,
                            room.square_footage or "",
                            f"{room.initial_condition}/5",
                            room.length_ft or "",
                            room.width_ft or "",
                            room.height_ft or "",
                            room.notes or "",
                        ]
                    )
                writer.writerow([])

            # Expense details
            if not no_expenses and project.expenses:
                writer.writerow(["Expense Details"])
                writer.writerow(
                    [
                        "Date",
                        "Room",
                        "Category",
                        "Cost",
                        "Labor Hours",
                        "Condition Rating",
                        "Notes",
                    ]
                )
                for expense in sorted(project.expenses, key=lambda x: x.created_at):
                    writer.writerow(
                        [
                            expense.created_at.strftime("%Y-%m-%d"),
                            expense.room.name,
                            expense.category.value.title(),
                            expense.cost,
                            expense.labor_hours or "",
                            (
                                f"{expense.condition_rating}/5"
                                if expense.condition_rating
                                else ""
                            ),
                            expense.notes or "",
                        ]
                    )

        success_message(f"Successfully exported project data to: {output_file}")

        # Show file stats
        file_size = os.path.getsize(output_file)
        if file_size < 1024:
            size_str = f"{file_size} bytes"
        elif file_size < 1024 * 1024:
            size_str = f"{file_size / 1024:.1f} KB"
        else:
            size_str = f"{file_size / (1024 * 1024):.1f} MB"

        rprint(f"File size: {size_str}")
        rprint(f"Location: [cyan]{os.path.abspath(output_file)}[/cyan]")

    except Exception as e:
        error_message(f"Error exporting to CSV: {e}")
        raise typer.Exit(1)
    finally:
        session.close()


@app.command("summary")
def export_summary(
    output_file: Optional[str] = typer.Option(
        None, "--output", "-o", help="Output CSV filename"
    ),
):
    """Export a summary of all projects to CSV"""
    session = db_manager.get_session()
    try:
        project_manager = ProjectManager(session)
        expense_manager = ExpenseManager(session)

        projects = project_manager.list_projects()
        if not projects:
            error_message("No projects found to export")
            raise typer.Exit(1)

        # Generate filename if not provided
        if not output_file:
            from datetime import datetime

            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"project_summary_{timestamp}.csv"
        else:
            # Security: Sanitize user-provided filename
            output_file = os.path.basename(output_file)
            if not output_file.endswith(".csv"):
                output_file += ".csv"
            safe_chars = set(
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-_"
            )
            output_file = "".join(c if c in safe_chars else "_" for c in output_file)

        with open(output_file, "w", newline="", encoding="utf-8") as csvfile:
            writer = csv.writer(csvfile)

            # Header
            writer.writerow(["Real Estate Tracker - Project Summary"])
            writer.writerow([])
            writer.writerow(
                [
                    "Generated",
                    f"{__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                ]
            )
            writer.writerow([])

            # Project summary table
            writer.writerow(
                [
                    "Project ID",
                    "Project Name",
                    "Status",
                    "Property Type",
                    "Property Class",
                    "Total Budget",
                    "Total Spent",
                    "Remaining Budget",
                    "Budget Used %",
                    "Material Costs",
                    "Labor Costs",
                    "Labor Hours",
                    "Room Count",
                    "Expense Count",
                    "Created Date",
                ]
            )

            for project in projects:
                summary = expense_manager.get_project_summary(project.id)

                if summary:
                    writer.writerow(
                        [
                            project.id,
                            project.name,
                            project.status.value.replace("_", " ").title(),
                            project.property_type.value.replace("_", " ").title(),
                            project.property_class.value.upper(),
                            summary["total_budget"],
                            summary["total_spent"],
                            summary["remaining_budget"],
                            f"{summary['budget_used_pct']:.1f}%",
                            summary["material_costs"],
                            summary["labor_costs"],
                            summary["total_labor_hours"],
                            len(project.rooms),
                            summary["expense_count"],
                            project.created_at.strftime("%Y-%m-%d"),
                        ]
                    )
                else:
                    # Project with no expenses
                    writer.writerow(
                        [
                            project.id,
                            project.name,
                            project.status.value.replace("_", " ").title(),
                            project.property_type.value.replace("_", " ").title(),
                            project.property_class.value.upper(),
                            project.total_budget,
                            0,
                            project.total_budget,
                            "0.0%",
                            0,
                            0,
                            0,
                            len(project.rooms),
                            0,
                            project.created_at.strftime("%Y-%m-%d"),
                        ]
                    )

        success_message(f"Successfully exported project summary to: {output_file}")

        file_size = os.path.getsize(output_file)
        size_str = (
            f"{file_size} bytes" if file_size < 1024 else f"{file_size / 1024:.1f} KB"
        )
        rprint(f"File size: {size_str}")
        rprint(f"Projects exported: {len(projects)}")
        rprint(f"Location: [cyan]{os.path.abspath(output_file)}[/cyan]")

    except Exception as e:
        error_message(f"Error exporting summary: {e}")
        raise typer.Exit(1)
    finally:
        session.close()
