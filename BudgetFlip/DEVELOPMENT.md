# BudgetFlip Development Guide

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm 10+
- Docker Desktop
- Git
- VS Code (recommended) with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript

### Initial Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/yourusername/BudgetFlip.git
   cd BudgetFlip
   ```

2. **Backend setup**
   ```bash
   cd backend
   cp .env.example .env
   npm install
   ```

3. **Frontend setup**
   ```bash
   cd ../budgetflip
   npm install
   ```

4. **Start Docker services**
   ```bash
   cd ..
   docker-compose up -d
   ```

## 🏃‍♂️ Running the Application

### With Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Without Docker
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd budgetflip
npm run dev
```

## 📁 Project Structure

### Frontend (budgetflip/)
```
src/
├── components/          # Reusable UI components
│   ├── AdvancedFilter   # Filter modal
│   ├── CalendarView     # Calendar display
│   ├── KanbanBoard      # Kanban board view
│   ├── MobileNav        # Mobile navigation
│   ├── ProjectCard      # Project display card
│   └── TableView        # Table with inline edit
├── contexts/            # React contexts
│   └── AuthContext      # Authentication state
├── pages/              # Page components
│   ├── Home            # Mobile home page
│   ├── Login           # Authentication
│   ├── ProjectsDashboard # Main dashboard
│   └── MyWork          # Mobile work view
├── utils/              # Helper functions
└── App.tsx             # Main app component
```

### Backend (backend/)
```
src/
├── config/             # Configuration
│   ├── database.ts     # PostgreSQL setup
│   └── redis.ts        # Redis cache setup
├── controllers/        # Business logic
│   └── auth.controller # Authentication
├── middleware/         # Express middleware
│   ├── auth           # JWT verification
│   ├── error          # Error handling
│   └── validation     # Request validation
├── routes/            # API endpoints
│   ├── auth          # Auth routes
│   ├── projects      # Project CRUD
│   └── expenses      # Expense CRUD
├── database/          # Database files
│   └── init.sql      # Schema definition
└── server.ts         # Express server
```

## 🔑 Key Technologies

### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **React Router**: Navigation
- **Vite**: Build tool
- **Recharts**: Data visualization
- **Lucide React**: Icons

### Backend
- **Express**: Web framework
- **TypeScript**: Type safety
- **PostgreSQL**: Primary database
- **Redis**: Caching layer
- **JWT**: Authentication
- **Bcrypt**: Password hashing
- **Winston**: Logging

## 🎨 Design System

### Colors (Tailwind Config)
```javascript
colors: {
  primary: {
    50: '#e6f4ff',
    100: '#c3e5ff',
    // ... Monday.com blue palette
    600: '#0073ea'
  },
  success: '#00c875',  // Green
  warning: '#ffcb00',  // Yellow
  danger: '#e2445c',   // Red
}
```

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Primary (blue), secondary (gray)
- **Status badges**: Color-coded by status
- **Forms**: Clean inputs with validation

## 🔒 Authentication Flow

1. **Registration**
   - User submits email, password, name
   - Password hashed with bcrypt
   - User created in database
   - JWT + refresh token returned

2. **Login**
   - Email/password validated
   - JWT + refresh token returned
   - Token stored in localStorage

3. **Protected Routes**
   - JWT sent in Authorization header
   - Middleware validates token
   - User context available in request

## 📊 Database Design

### Key Relationships
- Users → Projects (one-to-many)
- Projects → Expenses (one-to-many)
- Projects → Project Members (many-to-many)
- Expenses → Documents (one-to-many)

### Performance Optimizations
- Indexes on foreign keys
- Materialized view for project summaries
- Redis caching for frequent queries

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd budgetflip
npm test
```

### Test Structure
- Unit tests for utilities
- Integration tests for API
- Component tests for UI
- E2E tests with Cypress

## 🚀 Deployment

### Environment-Specific Configs

**Development**
- Local PostgreSQL & Redis
- CORS allows localhost
- Debug logging enabled

**Production**
- Managed PostgreSQL (Supabase)
- Redis Cloud
- CORS restricted to domain
- Error logging only

### CI/CD Pipeline
1. Push to main branch
2. GitHub Actions runs tests
3. Build Docker images
4. Deploy to staging
5. Manual promotion to production

## 🐛 Debugging

### Common Issues

**"Cannot connect to database"**
- Check Docker is running
- Verify DATABASE_URL in .env
- Check postgres container logs

**"CORS error"**
- Update CORS_ORIGIN in backend .env
- Ensure frontend uses correct API URL

**"Token expired"**
- Implement refresh token rotation
- Check JWT_EXPIRES_IN setting

### Useful Commands
```bash
# View Docker logs
docker-compose logs -f [service-name]

# Access PostgreSQL
docker-compose exec postgres psql -U budgetflip_user -d budgetflip

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL

# Rebuild containers
docker-compose build --no-cache
```

## 📚 API Development

### Adding New Endpoints

1. **Create Route File**
   ```typescript
   // src/routes/newfeature.routes.ts
   import { Router } from 'express';
   const router = Router();
   ```

2. **Add Controller**
   ```typescript
   // src/controllers/newfeature.controller.ts
   export const getFeature = async (req, res) => {
     // Implementation
   };
   ```

3. **Register in Server**
   ```typescript
   // src/server.ts
   app.use('/api/newfeature', newFeatureRoutes);
   ```

### Database Migrations
```bash
# Create migration file
touch backend/src/database/migrations/001_add_feature.sql

# Run migration
docker-compose exec postgres psql -U budgetflip_user -d budgetflip -f /path/to/migration.sql
```

## 🔄 State Management

### Frontend State
- **AuthContext**: User authentication
- **Local State**: Component-specific
- **URL State**: Filters, pagination
- **Cache**: React Query (future)

### Backend State
- **Database**: PostgreSQL for persistence
- **Redis**: Session data, cache
- **Memory**: Rate limit counters

## 🎯 Best Practices

### Code Style
- Use TypeScript strict mode
- Follow ESLint rules
- Format with Prettier
- Meaningful variable names
- Comment complex logic

### Git Workflow
- Feature branches
- Conventional commits
- PR reviews required
- Squash merge to main

### Security
- Validate all inputs
- Sanitize user data
- Use parameterized queries
- Rate limit APIs
- Audit dependencies

## 📈 Performance

### Frontend
- Lazy load routes
- Memoize expensive operations
- Virtualize long lists
- Optimize images
- Bundle splitting

### Backend
- Database query optimization
- Redis caching strategy
- Connection pooling
- Compression middleware
- CDN for static assets

## 🔗 Useful Links

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Docker Compose](https://docs.docker.com/compose/)

---

For more help, check the issues or create a new one!