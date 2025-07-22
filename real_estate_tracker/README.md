# Real Estate Flip Tracker

A local-first multi-platform app to help house-flipping investors plan, track, and analyze renovation budgets project-by-project, room-by-room, and category-by-category.

## Features

- 🏠 **Multi-Platform:** CLI, Web, Desktop, and Mobile apps
- 💰 **Detailed Budget Tracking:** Track expenses by room and category
- 📊 **Smart Alerts:** Get notified when spending exceeds templates
- 📈 **Dashboard Insights:** Visual analytics and spending patterns
- 🔒 **Security First:** Enterprise-grade encryption and local data control
- 📱 **Modern UX:** Responsive design with accessibility features
- 💾 **Local Storage:** SQLite database with optional cloud sync

## Quick Start

### 1. Setup Backend (Python CLI)

```powershell
# Navigate to backend directory (you should be here already)
cd backend

# Make sure virtual environment is activated
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Install the package in development mode
pip install -e .
```

### 2. Initialize Database

```powershell
# Initialize the database and create default user
real-estate-tracker init

# Check system status
real-estate-tracker status

# Show version information
real-estate-tracker version
```

### 3. Basic Commands

```powershell
# Show help
real-estate-tracker --help

# Reset database (WARNING: deletes all data)
real-estate-tracker reset --yes
```

## Project Structure

```
real_estate_tracker/
├── backend/                 # Python Backend & CLI ✅
│   ├── src/
│   │   ├── __init__.py     # Package info
│   │   ├── cli.py          # CLI interface  
│   │   ├── models.py       # Database models
│   │   ├── database.py     # Database setup
│   │   ├── security.py     # Security utilities
│   │   └── ...             # More modules (coming soon)
│   ├── requirements.txt    # Python dependencies
│   └── setup.py           # Package configuration
├── frontend/               # React Web App (Phase 2)
├── desktop/                # Tauri Desktop App (Phase 3)
├── mobile/                 # React Native App (Phase 3)
├── shared/                 # Shared code & types
├── docs/                   # Documentation
├── PRD.md                  # Product Requirements Document
└── README.md              # This file
```

## Development Phases

- **✅ Phase 1 (Days 1-7):** Backend Foundation - CLI + Database
- **⏳ Phase 2 (Days 8-14):** Frontend Development - React Web App  
- **⏳ Phase 3 (Days 15-21):** Multi-Platform - Desktop + Mobile

## Tech Stack

### Backend
- **Python 3.8+** with Typer CLI framework
- **SQLite** database with SQLAlchemy ORM
- **FastAPI** for REST API (coming soon)
- **Enterprise Security:** bcrypt, JWT, AES-256 encryption

### Frontend (Coming Soon)
- **React + TypeScript** for web interface
- **Tauri** for lightweight desktop apps
- **React Native** for mobile apps
- **Tailwind CSS** for modern UI design

## Security Features

- 🔐 **Strong Authentication:** 12+ character passwords with complexity
- 🛡️ **Data Encryption:** AES-256 encryption for sensitive data
- 🏠 **Local-First:** Your data stays on your device
- 📋 **Audit Logging:** Complete security event tracking
- 🔒 **Input Validation:** Protection against injection attacks

## Database Location

- **Windows:** `%USERPROFILE%\.real_estate_tracker\tracker.db`
- **macOS/Linux:** `~/.real_estate_tracker/tracker.db`

## Default Login

- **Username:** `admin`
- **Password:** `Admin123!`

*Change this immediately after first login!*

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pytest backend/tests/`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

**🚀 Ready to track your real estate investments like a pro!** 