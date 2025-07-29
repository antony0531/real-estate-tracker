#!/usr/bin/env python3
"""
CLI Entry Point for Real Estate Flip Tracker

This is the main entry point that delegates to the new modular CLI package.
The CLI has been refactored into focused command modules for better maintainability.

New Structure:
- cli/__init__.py - Main CLI app configuration
- cli/commands/system.py - System operations (init, reset, version, status)
- cli/commands/project.py - Project management (create, list, show, update, delete)
- cli/commands/room.py - Room management (add, list, delete)
- cli/commands/expense.py - Expense tracking (add, list, delete)
- cli/commands/budget.py - Budget analysis (status, summary)
- cli/commands/export.py - Data export (csv, summary)
- cli/utils.py - Shared utilities and helpers
"""

# Import the modular CLI app
from .cli import app


def main():
    """Main entry point for the CLI"""
    app()


if __name__ == "__main__":
    main()
