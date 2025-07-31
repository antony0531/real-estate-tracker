# BudgetFlip - House Flipping Budget Tracker

A modern, offline-first budget tracking application designed specifically for house-flipping investors. Track expenses, manage budgets, and monitor project progress across multiple properties with a beautiful Monday.com-inspired interface.

## 🏠 Features

### Mobile App (PWA)
- **Offline-First**: Works without internet connection
- **Install on iPhone/Android**: Add to home screen, no app store needed
- **Mobile-Optimized UI**: Monday.com-inspired design
- **Quick Expense Entry**: Floating action button for fast expense tracking
- **Receipt Capture**: Take photos directly from the app

### Desktop Dashboard
- **Multiple Views**: Grid, Kanban board, Table, Calendar
- **Advanced Filtering**: Filter by status, priority, budget, date range
- **Inline Editing**: Edit project details directly in the table view
- **Drag & Drop**: Move projects between stages in Kanban view
- **Real-time Updates**: See changes across all devices instantly

### Core Functionality
- **Project Management**: Track multiple house-flipping projects
- **Budget Tracking**: Monitor budget vs. actual spending
- **Expense Categories**: Organize expenses by type
- **Team Collaboration**: Invite team members to projects
- **Document Storage**: Store receipts, invoices, permits
- **Analytics**: View spending trends and project profitability

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development without Docker)

### Running with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/BudgetFlip.git
   cd BudgetFlip
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Database UI: http://localhost:8080

4. **Default credentials for Adminer**
   - System: PostgreSQL
   - Server: postgres
   - Username: budgetflip_user
   - Password: budgetflip_pass
   - Database: budgetflip

### Stopping Services
```bash
docker-compose down        # Stop services
docker-compose down -v     # Stop and remove all data
```

## 📱 Mobile Installation

### iOS (iPhone/iPad)
1. Open Safari and navigate to the app
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Name it "BudgetFlip" and tap "Add"

### Android
1. Open Chrome and navigate to the app
2. Tap the three dots menu
3. Tap "Add to Home screen"
4. Confirm installation

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **File Storage**: Local (S3/Cloudinary in production)
- **Authentication**: JWT tokens

### Project Structure
```
BudgetFlip/
├── budgetflip/          # Frontend React app
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   └── utils/       # Helper functions
│   └── public/          # Static assets, PWA files
├── backend/             # Backend API
│   ├── src/
│   │   ├── config/      # Database, Redis config
│   │   ├── controllers/ # Route handlers
│   │   ├── middleware/  # Auth, validation
│   │   ├── routes/      # API routes
│   │   └── database/    # Schema, migrations
│   └── Dockerfile
└── docker-compose.yml   # Docker orchestration
```

## 💰 Deployment Options

### Free Tier (Perfect for Testing)
- **Database**: Supabase (500MB free)
- **Backend**: Vercel Functions (serverless)
- **Frontend**: Vercel/Netlify
- **File Storage**: Cloudinary (25GB free)
- **Total Cost**: $0/month

### Production Ready (~$50-100/month)
- **Database**: PostgreSQL on Railway/Render
- **Backend**: Railway/Render
- **Frontend**: Vercel Pro
- **File Storage**: AWS S3
- **Cache**: Redis Cloud

## 🔧 Development

### Environment Variables
Create `.env` files in both frontend and backend:

**Frontend (.env)**
```
VITE_API_URL=http://localhost:3000/api
```

**Backend (.env)**
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://budgetflip_user:budgetflip_pass@localhost:5432/budgetflip
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=http://localhost:5173
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout

#### Projects (Protected)
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Expenses (Protected)
- `GET /api/expenses/project/:projectId` - List project expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

## 📊 Database Schema

### Core Tables
- **users**: User accounts and authentication
- **projects**: House flipping projects
- **expenses**: Individual expense entries
- **expense_categories**: Expense categorization
- **documents**: File attachments (receipts, etc)
- **project_members**: Team collaboration
- **activity_logs**: Audit trail

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- UI inspired by [Monday.com](https://monday.com)
- Icons by [Lucide](https://lucide.dev)
- Charts by [Recharts](https://recharts.org)

## 📞 Support

For support, email support@budgetflip.com or open an issue in the GitHub repository.

---

Built with ❤️ for house flippers by house flippers