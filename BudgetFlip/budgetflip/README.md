# BudgetFlip - Project Overview Screen

A simple React application for house-flipping investors to track renovation budgets.

## Requirements

- Node.js 18.x or higher (tested with v18.20.8)
- npm 10.x or higher

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   Visit `http://localhost:5173` to see the app

## Features Implemented

- **Project Overview Screen** with:
  - Budget Gauge - Shows budget vs spent with color indicators
  - Remaining Budget - Displays remaining funds
  - Spend Projection Chart - Placeholder for future chart implementation
  - Upcoming Due Dates - List of upcoming payments and deadlines
  
- **Navigation** between Overview and Expenses tabs
- **Responsive design** that works on mobile and desktop

## Project Structure

```
src/
├── components/
│   ├── BudgetGauge.tsx       # Budget vs spent indicator
│   ├── SpendProjectionChart.tsx # Chart placeholder
│   ├── UpcomingDueDates.tsx  # Due dates list
│   └── RemainingBudget.tsx   # Remaining budget display
├── pages/
│   ├── ProjectOverview.tsx   # Main overview page
│   └── ProjectExpenses.tsx   # Expenses page (placeholder)
├── App.tsx                   # Main app with routing
└── App.css                   # Global styles
```

## Routes

- `/` - Redirects to project overview
- `/project/123/overview` - Project Overview Screen
- `/project/123/expenses` - Expenses Screen (placeholder)

## Backend Integration

The project now includes a full backend API with:

### 🐳 Docker Development Environment

1. **Start all services with Docker:**
   ```bash
   # From the root directory
   cd ..
   docker-compose up -d
   ```

   This starts:
   - PostgreSQL database
   - Redis cache
   - Backend API (port 3000)
   - Frontend (port 5173)
   - Adminer database UI (port 8080)

2. **Access the application:**
   - Frontend: http://localhost:5173
   - API Health: http://localhost:3000/health
   - Database UI: http://localhost:8080

3. **Stop services:**
   ```bash
   docker-compose down
   ```

### 🔌 API Integration

The frontend is ready to connect to the backend API. Key endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/projects` - Get user projects
- `POST /api/expenses` - Add expense

Update the `.env` file in the frontend to connect:
```
VITE_API_URL=http://localhost:3000/api
```

## Next Steps

- Connect frontend to backend API
- Replace mock data with real API calls
- Add file upload for receipts
- Implement real-time updates
- Deploy to production (free tier)