# BudgetFlip Backend API

Backend API for BudgetFlip - House Flipping Budget Tracker

## 🚀 Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development without Docker)

### Running with Docker (Recommended)

1. **Clone the repository** (if not already done)

2. **Create environment file**
   ```bash
   cd backend
   cp .env.example .env
   ```

3. **Start all services**
   ```bash
   # From the root directory (where docker-compose.yml is located)
   cd ..
   docker-compose up -d
   ```

   This will start:
   - PostgreSQL database on port 5432
   - Redis cache on port 6379
   - Backend API on port 3000
   - Adminer (database UI) on port 8080
   - Frontend on port 5173

4. **Check service health**
   ```bash
   # Check if services are running
   docker-compose ps
   
   # View logs
   docker-compose logs -f backend
   
   # Check API health
   curl http://localhost:3000/health
   ```

5. **Access services**
   - API: http://localhost:3000
   - Frontend: http://localhost:5173
   - Adminer: http://localhost:8080
     - System: PostgreSQL
     - Server: postgres
     - Username: budgetflip_user
     - Password: budgetflip_pass
     - Database: budgetflip

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove all data (careful!)
docker-compose down -v
```

## 📚 API Documentation

### Authentication Endpoints

#### Register
```
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token
```
POST /api/auth/refresh
{
  "refreshToken": "your-refresh-token"
}
```

### Protected Endpoints (require Bearer token)

#### Projects
- `GET /api/projects` - Get all user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Expenses
- `GET /api/expenses/project/:projectId` - Get project expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

## 🛠️ Local Development (without Docker)

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set up databases**
   - Install PostgreSQL and create database
   - Install Redis
   - Update .env with connection strings

3. **Run development server**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/         # Database, Redis configuration
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth, error handling, validation
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Helpers and utilities
│   └── server.ts       # Express app entry point
├── tests/              # Test files
├── logs/               # Application logs
└── uploads/            # File uploads (local dev only)
```

## 🔧 Environment Variables

See `.env.example` for all available configuration options. Key variables:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret for JWT tokens
- `CORS_ORIGIN` - Frontend URL for CORS

## 📦 Database Migrations

The database schema is automatically initialized when the PostgreSQL container starts. To run migrations manually:

```bash
# Connect to database container
docker-compose exec postgres psql -U budgetflip_user -d budgetflip

# Run SQL files
\i /docker-entrypoint-initdb.d/init.sql
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚢 Production Deployment

See the deployment guide in the main project README for instructions on deploying to free-tier services like Supabase and Vercel.