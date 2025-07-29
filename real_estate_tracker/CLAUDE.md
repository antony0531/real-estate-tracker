# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Real Estate Flip Tracker - A comprehensive multi-platform budget management tool for house flippers. Currently in Phase 2 (Desktop App) development after completing Phase 1 (CLI Backend).

**Architecture**: Python CLI backend + Tauri/React desktop frontend + planned mobile support

## Key Commands

### Backend Development (Python CLI)
```bash
# Setup
cd backend
pip install -r requirements.txt

# Run CLI
python -m src.cli              # Development mode
real-estate-tracker            # If installed via pip

# Testing
python comprehensive_cli_test.py    # 54 test scenarios
python validation_suite.py          # Backend validation  
python cli_test_workflow.py         # Basic workflow tests

# Common CLI commands
python -m src.cli init              # Initialize database
python -m src.cli project create "Name" 150000 single_family sf_class_c
python -m src.cli project list
python -m src.cli expense add PROJECT_ID "Description" 500.00 room renovation
```

### Desktop Development (Tauri/React/TypeScript)
```bash
# Setup
cd desktop
npm install

# Development
npm run dev         # Vite dev server only
npm run tauri:dev   # Full Tauri development mode

# Build
npm run build       # Frontend build
npm run tauri:build # Full desktop app build

# Code Quality
npm run lint        # ESLint
npm run type-check  # TypeScript checking
npm run format      # Prettier formatting
npm run test        # Vitest tests
```

## Architecture Overview

### Project Structure
```
real_estate_tracker/
├── backend/            # Python CLI implementation
│   ├── src/           
│   │   ├── cli/       # Modular CLI commands
│   │   │   ├── commands/  # Individual command modules
│   │   │   │   ├── project.py
│   │   │   │   ├── room.py
│   │   │   │   ├── expense.py
│   │   │   │   ├── budget.py
│   │   │   │   ├── export.py
│   │   │   │   └── system.py
│   │   │   └── utils.py
│   │   ├── models.py      # SQLAlchemy ORM models
│   │   ├── database.py    # Database management
│   │   ├── projects.py    # Business logic layer
│   │   └── security.py    # Comprehensive security implementation
│   └── tests/
├── desktop/               # Tauri desktop application
│   ├── src-tauri/        # Rust backend
│   │   ├── src/
│   │   │   ├── main.rs
│   │   │   ├── commands.rs   # Tauri IPC commands
│   │   │   ├── python.rs     # Python CLI integration
│   │   │   └── database.rs   # Direct SQLite access
│   │   └── tauri.conf.json
│   └── src/              # React frontend
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route-based pages
│       ├── services/     # API/Tauri communication
│       └── types/        # TypeScript interfaces
└── mobile/              # Future React Native app
```

### Key Architectural Patterns

1. **Layered Architecture**: Clear separation between presentation (CLI/UI), business logic (services), and data access (ORM)

2. **Service Layer Pattern**: Business logic isolated in `projects.py` with `ProjectManager` class

3. **Security-First Design**: 
   - bcrypt password hashing (12 rounds)
   - AES-256 encryption for sensitive data
   - JWT authentication ready
   - Comprehensive input validation

4. **Local-First/Offline-First**: SQLite database in user home directory enables offline operation

5. **Tauri IPC Bridge**: Desktop app communicates with Python CLI via command invocation

### Database Schema

Primary entities:
- **User**: Authentication and ownership
- **Project**: Main project entity with budget tracking
- **Room**: Room-level organization  
- **Expense**: Detailed expense tracking
- **Budget**: Budget allocations by category

All models include created_at/updated_at timestamps and proper cascading relationships.

### Current Development Status

- **Phase 1 (CLI Backend)**: ✅ Complete
- **Phase 2 (Desktop App)**: 🔄 In Progress (Milestone 2)
  - Core UI components built
  - Tauri IPC integration complete
  - Working on enhanced validation, budget tracking, room management
- **Phase 3 (Mobile App)**: 📋 Planned
- **Phase 4 (Sync Infrastructure)**: 📋 Planned

### Security Considerations

The codebase implements comprehensive security:
- Input validation on all user inputs
- SQL injection prevention via SQLAlchemy ORM
- Path traversal protection in file operations
- Secure password storage with bcrypt
- Data encryption for sensitive fields
- JWT token preparation for API authentication

### Testing Approach

- **Backend**: Comprehensive integration tests via Python scripts
- **Frontend**: Vitest for unit tests, React Testing Library planned
- **E2E**: Manual testing currently, Playwright planned

Always run the validation suites before committing significant changes.