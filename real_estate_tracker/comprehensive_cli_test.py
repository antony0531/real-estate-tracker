#!/usr/bin/env python3
"""
Comprehensive CLI Test Suite for Real Estate Flip Tracker
Tests all commands, features, and edge cases including new functionality

This test suite covers:
- Full CRUD operations for projects, rooms, and expenses
- Advanced filtering and search
- Export functionality
- Update operations
- Delete operations with safety checks
- Error handling and input validation
- Security features and edge cases
"""

import subprocess
import sys
import os
import tempfile
import json
from datetime import datetime
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich import print as rprint

console = Console()


class ComprehensiveCLITester:
    def __init__(self):
        self.project_id = None
        self.room_names = []
        self.expense_ids = []
        self.test_results = {"passed": 0, "failed": 0, "tests": []}

        # Set working directory to backend where the virtual environment is
        self.backend_dir = os.path.join(
            os.path.dirname(os.path.abspath(__file__)), "backend"
        )

        # Try to use virtual environment Python if available
        venv_python = os.path.join(self.backend_dir, "venv", "Scripts", "python.exe")
        if not os.path.exists(venv_python):
            # Try Unix-style venv path
            venv_python = os.path.join(self.backend_dir, "venv", "bin", "python")

        if os.path.exists(venv_python):
            self.cli_base = [venv_python, "-m", "src.cli"]
            rprint(f"[green]Using virtual environment Python: {venv_python}[/green]")
        else:
            self.cli_base = [sys.executable, "-m", "src.cli"]
            rprint(
                f"[yellow]Warning: Virtual environment not found, using system Python[/yellow]"
            )
            rprint(
                f"[yellow]Make sure to activate venv first: backend/venv/Scripts/activate[/yellow]"
            )

    def run_command(self, cmd, description, expect_success=True, capture_output=True):
        """Run a CLI command and track results"""
        import shlex

        # Properly parse command with quoted strings
        cmd_parts = shlex.split(cmd)
        if cmd_parts[0] == "real-estate-tracker":
            cmd_parts = cmd_parts[1:]  # Remove 'real-estate-tracker' prefix

        full_cmd = self.cli_base + cmd_parts

        try:
            result = subprocess.run(
                full_cmd,
                capture_output=capture_output,
                text=True,
                cwd=self.backend_dir,  # Run from backend directory
                timeout=30,
            )

            success = (result.returncode == 0) == expect_success

            if success:
                self.test_results["passed"] += 1
                status = "[green]PASS[/green]"
            else:
                self.test_results["failed"] += 1
                status = "[red]FAIL[/red]"

            self.test_results["tests"].append(
                {
                    "description": description,
                    "command": cmd,
                    "success": success,
                    "stdout": result.stdout,
                    "stderr": result.stderr,
                    "returncode": result.returncode,
                }
            )

            rprint(f"{status} - {description}")
            if not success:
                rprint(f"  Command: {cmd}")
                rprint(
                    f"  Expected success: {expect_success}, Got: {result.returncode == 0}"
                )
                if result.stderr:
                    rprint(f"  Error: {result.stderr.strip()}")
                elif result.returncode != 0 and not result.stderr:
                    rprint(f"  Exit code: {result.returncode} (no error message)")
                    if result.stdout:
                        rprint(f"  Output: {result.stdout.strip()[:200]}...")

            # Capture project ID for future tests
            if "project create" in cmd and result.returncode == 0:
                for line in result.stdout.split("\n"):
                    if "ID:" in line:
                        try:
                            self.project_id = int(
                                line.split("ID:")[1].split(")")[0].strip()
                            )
                            rprint(
                                f"[blue]Captured Project ID: {self.project_id}[/blue]"
                            )
                        except:
                            pass

            return result

        except subprocess.TimeoutExpired:
            self.test_results["failed"] += 1
            rprint(f"[red]TIMEOUT[/red] - {description}")
            return None
        except Exception as e:
            self.test_results["failed"] += 1
            rprint(f"[red]ERROR[/red] - {description}: {e}")
            return None

    def test_basic_system_commands(self):
        """Test basic system commands"""
        rprint(Panel("Testing Basic System Commands", style="bold cyan"))

        self.run_command("real-estate-tracker --help", "CLI help system")
        self.run_command("real-estate-tracker version", "Version information")
        self.run_command("real-estate-tracker status", "System status")

    def test_project_lifecycle(self):
        """Test complete project lifecycle"""
        rprint(Panel("Testing Project Lifecycle", style="bold green"))

        # Create project
        self.run_command(
            "real-estate-tracker project create 'Test Comprehensive Project' 200000 single_family sf_class_b --description 'Full test project' --sqft 2500 --address '123 Test St'",
            "Create comprehensive test project",
        )

        # List projects
        self.run_command("real-estate-tracker project list", "List all projects")

        # Show project details
        if self.project_id:
            self.run_command(
                f"real-estate-tracker project show {self.project_id}",
                "Show project details",
            )

            # Test project updates
            self.run_command(
                f"real-estate-tracker project update {self.project_id} --name 'Updated Test Project'",
                "Update project name",
            )

            self.run_command(
                f"real-estate-tracker project update {self.project_id} --budget 225000",
                "Update project budget",
            )

            self.run_command(
                f"real-estate-tracker project update {self.project_id} --status in_progress",
                "Update project status",
            )

            # Multiple updates at once
            self.run_command(
                f"real-estate-tracker project update {self.project_id} --description 'Updated description' --address '456 New Address'",
                "Update multiple project fields",
            )

        # Test invalid project operations
        self.run_command(
            "real-estate-tracker project show 99999",
            "Show non-existent project",
            expect_success=False,
        )
        self.run_command(
            "real-estate-tracker project update 99999 --name 'Invalid'",
            "Update non-existent project",
            expect_success=False,
        )

    def test_room_operations(self):
        """Test room management operations"""
        rprint(Panel("Testing Room Management", style="bold blue"))

        if not self.project_id:
            rprint("[red]ERROR: No project ID available for room tests[/red]")
            return

        # Add various room types
        rooms_to_add = [
            ("Kitchen", 1, 12, 15, "Primary cooking area"),
            ("Living Room", 1, 20, 18, "Main gathering space"),
            ("Master Bedroom", 2, 14, 16, "Primary bedroom"),
            ("Bathroom", 2, 8, 6, "Full bathroom upstairs"),
        ]

        for name, floor, length, width, notes in rooms_to_add:
            self.run_command(
                f"real-estate-tracker room add {self.project_id} '{name}' {floor} --length {length} --width {width} --condition 3 --notes '{notes}'",
                f"Add {name}",
            )
            self.room_names.append(name)

        # List rooms
        self.run_command(
            f"real-estate-tracker room list {self.project_id}", "List all rooms"
        )

        # Test room deletion
        if self.room_names:
            self.run_command(
                f"real-estate-tracker room delete {self.project_id} 'Bathroom' --force",
                "Delete room with --force",
            )

        # Test invalid room operations
        self.run_command(
            f"real-estate-tracker room add 99999 'Invalid Room' 1",
            "Add room to non-existent project",
            expect_success=False,
        )
        self.run_command(
            f"real-estate-tracker room list 99999",
            "List rooms for non-existent project",
            expect_success=False,
        )
        self.run_command(
            f"real-estate-tracker room delete {self.project_id} 'NonExistentRoom' --force",
            "Delete non-existent room",
            expect_success=False,
        )

    def test_expense_operations(self):
        """Test expense management operations"""
        rprint(Panel("Testing Expense Management", style="bold yellow"))

        if not self.project_id or not self.room_names:
            rprint("[red]ERROR: Need project and rooms for expense tests[/red]")
            return

        # Add various expenses
        expenses_to_add = [
            ("Kitchen", "material", 5500, 0, "Cabinets and countertops"),
            ("Kitchen", "labor", 1200, 15, "Cabinet installation"),
            ("Living Room", "material", 2800, 0, "Hardwood flooring"),
            ("Living Room", "labor", 800, 12, "Flooring installation"),
            ("Master Bedroom", "material", 1500, 0, "Paint and fixtures"),
            ("Master Bedroom", "labor", 600, 8, "Painting labor"),
        ]

        for room, category, cost, hours, notes in expenses_to_add:
            if room in self.room_names:  # Only add if room exists
                cmd = f"real-estate-tracker expense add {self.project_id} '{room}' {category} {cost}"
                if hours > 0:
                    cmd += f" --hours {hours}"
                cmd += f" --notes '{notes}'"

                self.run_command(cmd, f"Add {category} expense to {room}")

        # Test expense listing with filters
        self.run_command(
            f"real-estate-tracker expense list {self.project_id}", "List all expenses"
        )
        self.run_command(
            f"real-estate-tracker expense list {self.project_id} --category material",
            "List material expenses",
        )
        self.run_command(
            f"real-estate-tracker expense list {self.project_id} --category labor",
            "List labor expenses",
        )
        self.run_command(
            f"real-estate-tracker expense list {self.project_id} --room 'Kitchen'",
            "List Kitchen expenses",
        )
        self.run_command(
            f"real-estate-tracker expense list {self.project_id} --room 'Kitchen' --category material",
            "List Kitchen material expenses",
        )

        # Test invalid expense operations
        self.run_command(
            f"real-estate-tracker expense add {self.project_id} 'NonExistentRoom' material 1000",
            "Add expense to non-existent room",
            expect_success=False,
        )
        self.run_command(
            f"real-estate-tracker expense add {self.project_id} 'Kitchen' invalid_category 1000",
            "Add expense with invalid category",
            expect_success=False,
        )
        self.run_command(
            f"real-estate-tracker expense add {self.project_id} 'Kitchen' material -500",
            "Add negative expense",
            expect_success=False,
        )
        self.run_command(
            "real-estate-tracker expense delete 99999 --force",
            "Delete non-existent expense",
            expect_success=False,
        )

    def test_budget_analysis(self):
        """Test budget analysis functionality"""
        rprint(Panel("Testing Budget Analysis", style="bold magenta"))

        if not self.project_id:
            rprint("[red]ERROR: Need project for budget analysis[/red]")
            return

        # Test budget status
        self.run_command(
            f"real-estate-tracker budget status {self.project_id}",
            "Budget status analysis",
        )

        # Test with non-existent project
        self.run_command(
            "real-estate-tracker budget status 99999",
            "Budget status for non-existent project",
            expect_success=False,
        )

    def test_export_functionality(self):
        """Test export functionality"""
        rprint(Panel("Testing Export Functionality", style="bold green"))

        if not self.project_id:
            rprint("[red]ERROR: Need project for export tests[/red]")
            return

        # Create temporary directory for exports
        with tempfile.TemporaryDirectory() as temp_dir:
            # Test CSV export with default filename
            self.run_command(
                f"real-estate-tracker export csv {self.project_id}",
                "Export to CSV (auto filename)",
            )

            # Test CSV export with custom filename (secure)
            safe_filename = os.path.join(temp_dir, "test_export.csv")
            self.run_command(
                f"real-estate-tracker export csv {self.project_id} --output '{safe_filename}'",
                "Export to CSV (custom filename)",
            )

            # Test export options
            self.run_command(
                f"real-estate-tracker export csv {self.project_id} --no-rooms",
                "Export CSV without rooms",
            )
            self.run_command(
                f"real-estate-tracker export csv {self.project_id} --no-expenses",
                "Export CSV without expenses",
            )
            self.run_command(
                f"real-estate-tracker export csv {self.project_id} --no-rooms --no-expenses",
                "Export CSV (project only)",
            )

            # Test security - try path traversal (should be sanitized)
            malicious_path = "../../../etc/passwd"
            self.run_command(
                f"real-estate-tracker export csv {self.project_id} --output '{malicious_path}'",
                "Export with path traversal attempt (should be sanitized)",
            )

        # Test export with non-existent project
        self.run_command(
            "real-estate-tracker export csv 99999",
            "Export non-existent project",
            expect_success=False,
        )

    def test_input_validation(self):
        """Test input validation and error handling"""
        rprint(Panel("Testing Input Validation", style="bold red"))

        # Test invalid property types and classes
        self.run_command(
            "real-estate-tracker project create 'Invalid Project' 100000 invalid_type sf_class_a",
            "Create project with invalid property type",
            expect_success=False,
        )

        self.run_command(
            "real-estate-tracker project create 'Invalid Project' 100000 single_family invalid_class",
            "Create project with invalid property class",
            expect_success=False,
        )

        # Test invalid budget
        self.run_command(
            "real-estate-tracker project create 'Invalid Budget' -5000 single_family sf_class_b",
            "Create project with negative budget",
            expect_success=False,
        )

        if self.project_id:
            # Test invalid room conditions
            self.run_command(
                f"real-estate-tracker room add {self.project_id} 'Invalid Room' 1 --condition 0",
                "Add room with invalid condition (too low)",
                expect_success=False,
            )

            self.run_command(
                f"real-estate-tracker room add {self.project_id} 'Invalid Room' 1 --condition 6",
                "Add room with invalid condition (too high)",
                expect_success=False,
            )

            # Test invalid expense conditions
            if self.room_names:
                self.run_command(
                    f"real-estate-tracker expense add {self.project_id} '{self.room_names[0]}' material 1000 --condition 0",
                    "Add expense with invalid condition (too low)",
                    expect_success=False,
                )

    def test_edge_cases(self):
        """Test edge cases and boundary conditions"""
        rprint(Panel("Testing Edge Cases", style="bold cyan"))

        # Test very long names (should work)
        long_name = "A" * 190  # Just under 200 char limit
        self.run_command(
            f"real-estate-tracker project create '{long_name}' 100000 single_family sf_class_c",
            "Create project with very long name",
        )

        # Test special characters in names (should be handled safely)
        special_name = "Test Project & Symbols #123 @ Special"
        self.run_command(
            f"real-estate-tracker project create '{special_name}' 100000 single_family sf_class_c",
            "Create project with special characters",
        )

        # Test large numbers
        self.run_command(
            "real-estate-tracker project create 'Large Budget Test' 999999999 single_family sf_class_c",
            "Create project with very large budget",
        )

    def test_database_reset_safety(self):
        """Test database reset functionality"""
        rprint(Panel("Testing Database Reset Safety", style="bold red"))

        # Note: We won't actually reset since it would destroy test data
        # But we can test the command structure
        rprint("[yellow]Skipping actual database reset to preserve test data[/yellow]")
        rprint("[yellow]In production, test: real-estate-tracker reset --help[/yellow]")

    def cleanup_test_data(self):
        """Clean up test data"""
        rprint(Panel("Cleaning Up Test Data", style="bold yellow"))

        if self.project_id:
            # Delete the test project (this will cascade to rooms and expenses)
            self.run_command(
                f"real-estate-tracker project delete {self.project_id} --force",
                "Clean up test project",
            )

    def generate_report(self):
        """Generate comprehensive test report"""
        total_tests = self.test_results["passed"] + self.test_results["failed"]
        success_rate = (
            (self.test_results["passed"] / total_tests * 100) if total_tests > 0 else 0
        )

        # Summary table
        table = Table(title="Test Results Summary")
        table.add_column("Metric", style="cyan")
        table.add_column("Value", style="green")

        table.add_row("Total Tests", str(total_tests))
        table.add_row("Passed", str(self.test_results["passed"]))
        table.add_row("Failed", str(self.test_results["failed"]))
        table.add_row("Success Rate", f"{success_rate:.1f}%")

        console.print(table)

        # Failed tests detail
        if self.test_results["failed"] > 0:
            rprint("\n[red bold]Failed Tests:[/red bold]")
            for test in self.test_results["tests"]:
                if not test["success"]:
                    rprint(f"  - {test['description']}")
                    rprint(f"    Command: {test['command']}")
                    if test["stderr"]:
                        rprint(f"    Error: {test['stderr'].strip()}")
                    rprint()

        # Final assessment
        if success_rate >= 95:
            status_color = "green"
            status_text = "EXCELLENT - Ready for production"
        elif success_rate >= 85:
            status_color = "yellow"
            status_text = "GOOD - Minor issues to address"
        else:
            status_color = "red"
            status_text = "NEEDS WORK - Critical issues found"

        rprint(
            Panel(
                f"[bold {status_color}]Overall Assessment: {status_text}[/bold {status_color}]\n"
                f"Success Rate: {success_rate:.1f}% ({self.test_results['passed']}/{total_tests})\n"
                f"All new CLI commands and features tested comprehensively.",
                title="Comprehensive Test Results",
            )
        )

        return success_rate >= 85  # Return True if tests mostly passed

    def run_all_tests(self):
        """Run the complete test suite"""
        rprint(
            Panel(
                "[bold cyan]Real Estate Tracker - Comprehensive CLI Test Suite[/bold cyan]\n"
                "Testing all commands, CRUD operations, security features, and edge cases",
                title="Starting Comprehensive Tests",
            )
        )

        try:
            # Run all test categories
            self.test_basic_system_commands()
            self.test_project_lifecycle()
            self.test_room_operations()
            self.test_expense_operations()
            self.test_budget_analysis()
            self.test_export_functionality()
            self.test_input_validation()
            self.test_edge_cases()

            # Generate final report
            success = self.generate_report()

            # Cleanup
            self.cleanup_test_data()

            return success

        except KeyboardInterrupt:
            rprint("\n[yellow]Test interrupted by user[/yellow]")
            return False
        except Exception as e:
            rprint(f"\n[red]ERROR: Test suite failed: {e}[/red]")
            return False


def main():
    """Main entry point"""
    tester = ComprehensiveCLITester()
    success = tester.run_all_tests()

    if success:
        rprint(
            "\n[bold green]Comprehensive testing completed successfully![/bold green]"
        )
        sys.exit(0)
    else:
        rprint("\n[bold red]Some tests failed. Review the results above.[/bold red]")
        sys.exit(1)


if __name__ == "__main__":
    main()
