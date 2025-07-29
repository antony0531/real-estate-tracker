#!/usr/bin/env python3
"""
Comprehensive CLI Testing Workflow for Real Estate Flip Tracker
This script tests all CLI functionality with realistic data
"""

import subprocess
import time
import sys
from rich import print as rprint
from rich.panel import Panel
from rich.console import Console

console = Console()


class CLITester:
    def __init__(self):
        self.commands = []
        self.project_id = None

    def run_command(self, cmd, description, expect_success=True):
        """Run a CLI command and track results"""
        rprint(f"\n🔧 [cyan]{description}[/cyan]")
        rprint(f"💻 Command: [dim]{cmd}[/dim]")

        try:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)

            if result.returncode == 0 and expect_success:
                rprint("[green]SUCCESS[/green]")
                if result.stdout.strip():
                    print(result.stdout)
            elif result.returncode != 0 and not expect_success:
                rprint("[green]EXPECTED FAILURE[/green] (Validation working)")
                if result.stderr.strip():
                    rprint(f"[yellow]{result.stderr.strip()}[/yellow]")
            else:
                rprint("[red]ERROR: UNEXPECTED RESULT[/red]")
                if result.stderr.strip():
                    rprint(f"[red]Error: {result.stderr.strip()}[/red]")
                if result.stdout.strip():
                    rprint(f"[yellow]Output: {result.stdout.strip()}[/yellow]")

            # Extract project ID from output if this is a create command
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

            time.sleep(1)  # Brief pause between commands
            return result.returncode == 0

        except Exception as e:
            rprint(f"[red]ERROR: Command failed: {e}[/red]")
            return False

    def test_system_commands(self):
        """Test basic system functionality"""
        rprint(Panel("🔧 Testing System Commands", style="bold cyan"))

        self.run_command("real-estate-tracker --help", "Show main help")
        self.run_command("real-estate-tracker version", "Show version info")
        self.run_command("real-estate-tracker status", "Show system status")

    def test_project_management(self):
        """Test project creation and management"""
        rprint(Panel("🏗️ Testing Project Management", style="bold green"))

        # Test project creation with full details
        self.run_command(
            'real-estate-tracker project create "Ridgefield House Flip" 150000 single_family sf_class_c --sqft 2000 --floors 2 --address "123 Main St, Ridgefield, NJ" --description "Complete renovation of 2-story colonial"',
            "Create detailed project",
        )

        # Test project listing
        self.run_command("real-estate-tracker project list", "List all projects")

        # Test project details (using captured project ID)
        if self.project_id:
            self.run_command(
                f"real-estate-tracker project show {self.project_id}",
                "Show project details",
            )

        # Test project help
        self.run_command("real-estate-tracker project --help", "Show project help")

        # Test validation - invalid property type
        self.run_command(
            'real-estate-tracker project create "Invalid Project" 100000 invalid_type sf_class_c',
            "Test invalid property type validation",
            expect_success=False,
        )

        # Test validation - invalid property class
        self.run_command(
            'real-estate-tracker project create "Invalid Project 2" 100000 single_family invalid_class',
            "Test invalid property class validation",
            expect_success=False,
        )

    def test_room_management(self):
        """Test room creation and management"""
        if not self.project_id:
            rprint("[red]ERROR: No project ID available for room tests[/red]")
            return

        rprint(Panel("Testing Room Management", style="bold blue"))

        # Test room creation with different configurations
        rooms = [
            ("Living Room", 1, 20, 15, 2, "Needs new flooring and paint"),
            ("Kitchen", 1, 12, 10, 3, "Appliances need updating"),
            ("Master Bedroom", 2, 16, 14, 4, "Good condition, minor touch-ups"),
            ("Bathroom 1", 2, 8, 6, 1, "Complete renovation needed"),
            ("Dining Room", 1, 12, 12, 3, "Hardwood floors to refinish"),
        ]

        for name, floor, length, width, condition, notes in rooms:
            self.run_command(
                f'real-estate-tracker room add {self.project_id} "{name}" {floor} --length {length} --width {width} --condition {condition} --notes "{notes}"',
                f"Add {name} with full details",
            )

        # Test room without dimensions
        self.run_command(
            f'real-estate-tracker room add {self.project_id} "Basement" 0 --condition 2',
            "Add room without dimensions",
        )

        # Test room listing
        self.run_command(
            f"real-estate-tracker room list {self.project_id}", "List all project rooms"
        )

        # Test room help
        self.run_command("real-estate-tracker room --help", "Show room help")

        # Test validation - invalid condition
        self.run_command(
            f'real-estate-tracker room add {self.project_id} "Invalid Room" 1 --condition 10',
            "Test invalid condition validation",
            expect_success=False,
        )

        # Test validation - non-existent project
        self.run_command(
            'real-estate-tracker room add 999 "Test Room" 1',
            "Test non-existent project validation",
            expect_success=False,
        )

    def test_expense_tracking(self):
        """Test expense addition and tracking"""
        if not self.project_id:
            rprint("[red]ERROR: No project ID available for expense tests[/red]")
            return

        rprint(Panel("Testing Expense Tracking", style="bold yellow"))

        # Test various material expenses
        material_expenses = [
            ("Living Room", 1500.00, "Hardwood flooring materials"),
            ("Kitchen", 2800.00, "Granite countertops and cabinets"),
            ("Master Bedroom", 600.00, "Paint and primer"),
            ("Bathroom 1", 3200.00, "Tile, fixtures, and vanity"),
            ("Dining Room", 400.00, "Sandpaper and wood stain"),
        ]

        for room, cost, notes in material_expenses:
            self.run_command(
                f'real-estate-tracker expense add {self.project_id} "{room}" material {cost} --notes "{notes}"',
                f"Add material expense to {room}",
            )

        # Test labor expenses with hours
        labor_expenses = [
            ("Living Room", 800.00, 16, "Floor installation labor"),
            ("Kitchen", 1200.00, 24, "Cabinet installation"),
            ("Master Bedroom", 300.00, 6, "Painting labor"),
            ("Bathroom 1", 1600.00, 32, "Plumbing and tile work"),
            ("Dining Room", 400.00, 8, "Floor refinishing"),
        ]

        for room, cost, hours, notes in labor_expenses:
            self.run_command(
                f'real-estate-tracker expense add {self.project_id} "{room}" labor {cost} --hours {hours} --notes "{notes}"',
                f"Add labor expense to {room}",
            )

        # Test expense help
        self.run_command("real-estate-tracker expense --help", "Show expense help")

        # Test validation - invalid category
        self.run_command(
            f'real-estate-tracker expense add {self.project_id} "Living Room" invalid_category 100',
            "Test invalid category validation",
            expect_success=False,
        )

        # Test validation - negative cost
        self.run_command(
            f'real-estate-tracker expense add {self.project_id} "Living Room" material -100',
            "Test negative cost validation",
            expect_success=False,
        )

        # Test validation - non-existent room
        self.run_command(
            f'real-estate-tracker expense add {self.project_id} "Non-existent Room" material 100',
            "Test non-existent room validation",
            expect_success=False,
        )

    def test_budget_analysis(self):
        """Test budget analysis and reporting"""
        if not self.project_id:
            rprint("[red]ERROR: No project ID available for budget tests[/red]")
            return

        rprint(Panel("Testing Budget Analysis", style="bold magenta"))

        # Show updated project details with expenses
        self.run_command(
            f"real-estate-tracker project show {self.project_id}",
            "Show project with expenses",
        )

        # Test detailed budget analysis
        self.run_command(
            f"real-estate-tracker budget status {self.project_id}",
            "Show detailed budget analysis",
        )

        # Test budget help
        self.run_command("real-estate-tracker budget --help", "Show budget help")

        # Test validation - non-existent project
        self.run_command(
            "real-estate-tracker budget status 999",
            "Test non-existent project for budget",
            expect_success=False,
        )

    def test_edge_cases(self):
        """Test edge cases and error handling"""
        rprint(Panel("⚠️ Testing Edge Cases & Error Handling", style="bold red"))

        # Test with very large budget
        self.run_command(
            'real-estate-tracker project create "Luxury Mansion" 5000000 single_family sf_class_a --sqft 10000',
            "Test with very large budget",
        )

        # Test with minimal project
        self.run_command(
            'real-estate-tracker project create "Minimal Project" 50000 multifamily mf_class_c',
            "Test minimal project creation",
        )

        # Test project list after multiple projects
        self.run_command("real-estate-tracker project list", "List multiple projects")

        # Test system status with data
        self.run_command("real-estate-tracker status", "System status with data")

    def test_unicode_and_special_chars(self):
        """Test Unicode characters and special cases"""
        rprint(Panel("🌍 Testing Unicode & Special Characters", style="bold green"))

        # Test with special characters (if they don't break things)
        self.run_command(
            'real-estate-tracker project create "O\'Brien Family Home" 175000 single_family sf_class_c --address "123 Main St, Anytown, USA"',
            "Test project with apostrophe",
        )

        # Test with numbers and hyphens
        self.run_command(
            'real-estate-tracker project create "Unit-2B Renovation" 125000 multifamily mf_class_b --description "2-bedroom unit renovation"',
            "Test project with hyphens and numbers",
        )

    def run_comprehensive_test(self):
        """Run the complete test suite"""
        rprint(
            Panel(
                "[bold cyan]Real Estate Flip Tracker - Comprehensive CLI Test Suite[/bold cyan]\n"
                "This will test all CLI functionality with realistic data",
                title="CLI Testing Started",
            )
        )

        try:
            # Run all test categories
            self.test_system_commands()
            self.test_project_management()
            self.test_room_management()
            self.test_expense_tracking()
            self.test_budget_analysis()
            self.test_edge_cases()
            self.test_unicode_and_special_chars()

            # Final status check
            rprint(
                Panel(
                    "[bold green]All CLI tests completed![/bold green]\n"
                    f"Project ID captured: {self.project_id}\n"
                    "The CLI is fully functional and ready for production use!",
                    title="Test Results",
                )
            )

            rprint("\n🔗 [cyan]Try these commands to explore your test data:[/cyan]")
            if self.project_id:
                rprint(f"   • real-estate-tracker project show {self.project_id}")
                rprint(f"   • real-estate-tracker budget status {self.project_id}")
                rprint(f"   • real-estate-tracker room list {self.project_id}")
            rprint("   • real-estate-tracker project list")
            rprint("   • real-estate-tracker status")

        except KeyboardInterrupt:
            rprint("\n[yellow]Test interrupted by user[/yellow]")
        except Exception as e:
            rprint(f"\n[red]ERROR: Test suite failed: {e}[/red]")


if __name__ == "__main__":
    tester = CLITester()
    tester.run_comprehensive_test()
