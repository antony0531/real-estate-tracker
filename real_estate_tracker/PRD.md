# Real Estate Flip Tracker PRD

## 1. Overview

**Project Name:** Real Estate Flip Tracker
**Goal:** A local-first multi-platform app (CLI, Desktop, Mobile, Web) to help house-flipping investors plan, track, and analyze renovation budgets project-by-project, room-by-room, and category-by-category.

**Objectives:**

* Enable investors ("flippers") to set and monitor renovation budgets to avoid overruns.
* Capture detailed expense data (material, labor) with context (room, condition).
* Generate reusable templates and projections for future flips based on historical data.
* Provide at‑a‑glance dashboard insights (budget vs. spend, alerts, projections).
* Support local data storage (SQLite) with future cloud backup sync.

**Primary Users:** Solo investors or small teams managing one property at a time.

**Platform Strategy:**
* **Core:** Python CLI and REST API backend
* **Desktop:** Native desktop app (Windows, macOS, Linux) 
* **Mobile:** Cross-platform mobile app (iOS, Android)
* **Web:** Modern responsive web application
* **Cost Requirement:** All development tools and deployment must be free/open source

**Timeline:** 3 weeks to MVP, with interim demos at:

* **Day 7:** Basic expense logging & dashboard
* **Day 14:** Template generation & alerting
* **Day 21:** Excel export, snapshots, authentication, and final polish

---

## 2. User Workflow

1. **Project Initialization**

   * User creates a new project, enters overall renovation budget, project type, and selects property class:

     * **Single Family:**

       * Class A: Ultra-Luxury ($2.5–4 M)
       * Class B: Luxury ($1–2 M)
       * Class C: Safe middle class ($700 K–$999 K)
       * Class D: <$550 K
     * **Multifamily (2–3 units):**

       * Class A ($1–1.5 M)
       * Class B ($750 K–$900 K)
       * Class C ($500 K–$749 K)
   * Specify number of floors and rooms, with dimensions and initial condition ratings (1–5).
2. **Daily Dashboard**

   * On launch, shows:

     * Total budget vs. total spent (green/red gauge)
     * Line-chart projection of spend over time vs. budget
     * Upcoming due dates (e.g., payments due)
     * Remaining budget
3. **Expense Entry**

   * Input each expense with fields:

     * Date (validated format)
     * Floor → Room (pre-populated list: Living Room, Kitchen, Bathroom #, Bedroom #, Basement, Backyard, Attic, Dining Room)
     * Category (Material or Labor)
     * Condition rating (1–5)
     * Cost (must be ≥ 0)
     * Labor hours (numeric)
     * Notes (free‑form)
   * System flags any spend exceeding template estimates by > 3% as a visible dashboard alert.
4. **Template Generation & Alerts**

   * After entering enough data, app generates per-room templates based on size and average spend by condition.
   * When a new expense deviates > 3% from template, dashboard flag or popup alerts the user.
5. **Snapshots & Versioning**

   * Automatically capture a snapshot on each expense entry, stored with timestamp.
   * Users can list and restore snapshots for audit or correction.
6. **Reports & Export**

   * Export to Excel with columns in order: Date, Room, Category, Condition, Cost, Labor Hours, Notes.
   * Generate KPIs: cost per sq ft (per room & project-wide), variance $ and % vs. budget, total labor hours vs. budgeted labor.
7. **Authentication & Security**

   * Local username + password login.
   * Role support (Viewer vs. Editor) for future multi-user extensions.
8. **Data Import/Export**

   * Import existing CSV/JSON with fields: project_id, room, cost, material, Notes.
   * SQLite DB import utility for legacy data.
9. **Packaging & Distribution**

   * Distribute via GitHub releases as portable CLI executables (Windows MSI/EXE & macOS bundle).
   * Optional Streamlit GUI downloadable as part of the same release.
10. **Future Cloud Backup**

    * Plan for optional cloud sync backup (post-MVP).

---

## 3. Success Criteria

* **MVP complete** when user can: set up a project, log expenses, view dashboard, receive alerts, export to Excel, and manage snapshots.
* **"Done"** state when user marks project as Complete or In Progress via CLI/GUI flag.
* Delivered within 3 weeks with interim demos as outlined.

---

**Appendix:** Pre-populated Room List for $2 M Ridgefield, NJ Single-Family Flip:

* Ground Floor → Living Room, Kitchen, Dining Room, Bathroom #, Bedroom #
* Second Floor → Bathroom #, Bedroom #
* Basement → Basement
* Attic → Attic
* Exterior → Backyard

**Condition Scale:** 1 (Poor) to 5 (Excellent)

**Alert Threshold:** 3% deviation from template estimates

---

## 4. Modern UX & Design Principles

### Design System
- **Color Palette:** Professional real estate theme (blues, greens, grays)
- **Typography:** Modern, readable fonts (Inter, system fonts)
- **Spacing:** Consistent 8px grid system
- **Components:** Reusable, accessible UI components
- **Responsive:** Mobile-first design approach

### User Experience Goals
- **Simplicity:** Minimal clicks to complete common tasks
- **Speed:** Fast loading, optimistic updates, offline support
- **Clarity:** Clear data visualization, intuitive navigation
- **Accessibility:** WCAG 2.1 AA compliance, keyboard navigation
- **Consistency:** Unified experience across all platforms

### Platform-Specific UX
- **Mobile:** Touch-friendly, swipe gestures, camera integration for receipts
- **Desktop:** Keyboard shortcuts, drag-and-drop, multi-window support
- **Web:** Progressive Web App (PWA) capabilities, browser notifications
- **CLI:** Colored output, progress bars, interactive prompts

---

## 5. Cybersecurity & Data Protection

### Security Priorities
Given that this application handles sensitive financial data, project details, and business information for real estate investments, cybersecurity is a critical foundation requirement, not an afterthought.

### Data Classification
- **Highly Sensitive:** Financial data, budgets, vendor information, property addresses
- **Sensitive:** Project timelines, room details, historical templates
- **Internal:** User preferences, application settings
- **Public:** Help documentation, feature descriptions

### Core Security Principles

#### 1. Local-First Security
- **Data Sovereignty:** All sensitive data remains on user's device by default
- **Zero Trust Network:** No dependency on cloud services for core functionality
- **Offline Operation:** Full functionality without internet connectivity
- **User Control:** Complete ownership and control of data location

#### 2. Data Protection at Rest
- **Database Encryption:** SQLite database encrypted with AES-256
- **Key Management:** User-derived keys from master password (PBKDF2 + salt)
- **File System Protection:** Sensitive files stored in protected user directories
- **Backup Security:** Encrypted local backups with separate encryption keys

#### 3. Data Protection in Transit
- **API Security:** All API communications over HTTPS/TLS 1.3 minimum
- **Certificate Pinning:** Mobile and desktop apps pin API certificates
- **Request Signing:** HMAC-based request authentication for API calls
- **No Sensitive Data in URLs:** All sensitive data in request bodies only

#### 4. Authentication & Authorization
- **Strong Password Policy:** Minimum 12 characters, complexity requirements
- **Password Hashing:** bcrypt with high work factor (rounds=12+)
- **Session Management:** JWT tokens with short expiration (15 minutes)
- **Multi-Factor Ready:** Architecture supports future MFA implementation
- **Account Lockout:** Brute force protection with exponential backoff

---

## 6. Technical Architecture

### Tech Stack

#### Backend (Core)
- **Language:** Python 3.8+
- **CLI Framework:** Typer (modern, type-safe CLI)
- **API Framework:** FastAPI (for REST API)
- **Database:** SQLite with SQLAlchemy ORM + encryption
- **Data Processing:** Pandas
- **Authentication:** passlib + bcrypt + JWT
- **Encryption:** cryptography library (AES-256, PBKDF2)
- **Testing:** pytest
- **Security Tools:** Bandit (static analysis), Safety (dependency scanning)

#### Frontend (Multi-Platform)
- **Web App:** React + TypeScript + Vite
- **UI Framework:** Tailwind CSS + Headless UI (modern, responsive)
- **Desktop App:** Tauri (Rust-based, lightweight alternative to Electron)
- **Mobile App:** React Native (cross-platform iOS/Android)
- **Charts/Visualization:** Recharts (React) + Chart.js
- **State Management:** Zustand (lightweight React state)

#### Development & Deployment (Free Tools)
- **Version Control:** Git + GitHub (with security scanning)
- **CI/CD:** GitHub Actions (free tier) with security checks
- **Code Quality:** ESLint + security plugins, Prettier, Black (Python)
- **Security Testing:** 
  - Backend: Bandit (static analysis), Safety (dependency scanning)
  - Frontend: npm audit, Snyk (free tier)
  - Penetration: OWASP ZAP (automated security testing)
- **Testing:** Jest (Frontend), pytest (Backend), security test suites
- **Packaging:** 
  - Desktop: Tauri (creates signed native executables)
  - Mobile: Expo (with security hardening)
  - CLI: PyInstaller (with code signing)
- **Documentation:** MkDocs with Material theme + security guides

### Project Structure
```
real_estate_tracker/
├── backend/                 # Python Backend & CLI
│   ├── src/
│   │   ├── __init__.py
│   │   ├── cli.py          # CLI interface
│   │   ├── api.py          # FastAPI REST API
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── database.py     # Database setup
│   │   ├── expenses.py     # Business logic
│   │   ├── projects.py     # Business logic
│   │   ├── templates.py    # Template generation
│   │   ├── dashboard.py    # Analytics logic
│   │   ├── auth.py         # Authentication
│   │   ├── security.py     # Security utilities
│   │   └── utils.py        # Utilities
│   ├── tests/
│   ├── requirements.txt
│   └── setup.py
├── frontend/               # React Web App
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── store/          # Zustand state management
│   │   ├── services/       # API calls
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Frontend utilities
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── desktop/                # Tauri Desktop App
│   ├── src-tauri/          # Rust backend for Tauri
│   ├── src/                # Frontend (shared with web)
│   └── tauri.conf.json
├── mobile/                 # React Native App
│   ├── src/
│   │   ├── components/     # Mobile-specific components
│   │   ├── screens/        # Mobile screens
│   │   ├── navigation/     # Navigation setup
│   │   └── services/       # API integration
│   ├── android/
│   ├── ios/
│   ├── package.json
│   └── app.json
├── shared/                 # Shared code between platforms
│   ├── types/              # TypeScript type definitions
│   ├── constants/          # Shared constants
│   └── utils/              # Cross-platform utilities
├── docs/                   # Documentation
├── .github/                # GitHub Actions workflows
├── README.md
└── PRD.md
```

### Development Phases

#### Phase 1 (Days 1-7): Backend Foundation
1. Python CLI and database models ✓ (already started)
2. FastAPI REST API setup
3. Basic project and expense endpoints
4. Authentication system
5. Core business logic testing

#### Phase 2 (Days 8-14): Frontend Development
1. React web app with modern UI (Tailwind CSS)
2. Mobile-responsive design
3. Dashboard with charts (Recharts)
4. Template generation and alerts
5. Real-time data synchronization

#### Phase 3 (Days 15-21): Multi-Platform & Polish
1. Tauri desktop app packaging
2. React Native mobile app
3. Excel export functionality
4. Snapshot system
5. CI/CD pipeline setup
6. Cross-platform testing and deployment

#### Platform Priorities
1. **Week 1:** CLI + API backend (foundation)
2. **Week 2:** Web app (primary interface)
3. **Week 3:** Desktop + Mobile apps (extended reach) 