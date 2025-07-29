# Docker Setup Guide

## Prerequisites

- Docker Desktop installed (https://www.docker.com/products/docker-desktop/)
- Docker Compose v2.0+ (included with Docker Desktop)
- Git installed
- Make (optional, for using Makefile commands)

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/your-org/real-estate-tracker.git
cd real-estate-tracker

# Copy environment variables
cp .env.example .env
```

### 2. Start Development Environment

Using Make:
```bash
make dev
```

Or using Docker Compose directly:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000 (when API is implemented)
- **Database Admin**: http://localhost:8080 (Adminer)
- **Mail Server**: http://localhost:8025 (MailHog)

## Docker Architecture

### Services

1. **Backend** (`real_estate_backend`)
   - Python 3.11 with all dependencies
   - Hot reloading in development
   - Persistent SQLite database

2. **Frontend** (`real_estate_frontend`)
   - Node.js 18 Alpine
   - Vite dev server with HMR
   - Auto-reloading on file changes

3. **Adminer** (development only)
   - Web-based database management
   - Access SQLite database visually

4. **MailHog** (development only)
   - Captures all outgoing emails
   - Web UI to view sent emails

### Volumes

- `./data`: Persistent database storage
- `backend-cache`: Python package cache
- `postgres_data`: For future PostgreSQL migration

## Common Commands

### Using Makefile

```bash
# Build all images
make build

# Start services
make up

# Stop services
make down

# View logs
make logs

# Run tests
make test

# Open shell in container
make shell-back   # Backend shell
make shell-front  # Frontend shell

# Format code
make format

# Run security scan
make security

# Clean everything
make clean
```

### Using Docker Compose

```bash
# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Run in background
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild images
docker-compose build --no-cache

# View logs
docker-compose logs -f [service_name]

# Execute commands in container
docker-compose exec backend python -m src.cli
docker-compose exec frontend npm run lint
```

## Development Workflow

### 1. Backend Development

The backend volume is mounted, so changes are reflected immediately:

```bash
# Make changes to backend/src/...
# If using CLI, restart is automatic
# If running API, uvicorn will auto-reload
```

### 2. Frontend Development

Frontend uses Vite's HMR for instant updates:

```bash
# Make changes to desktop/src/...
# Browser will auto-refresh
```

### 3. Database Management

Access Adminer at http://localhost:8080:
- System: SQLite 3
- Database: `/data/tracker.db`
- Leave username/password empty

### 4. Testing

```bash
# Run backend tests
make test-back

# Run frontend tests
make test-front

# Run all tests
make test
```

## Production Deployment

### 1. Build Production Images

```bash
# Build optimized images
docker build -t real-estate-backend:latest ./backend
docker build -t real-estate-frontend:latest ./desktop
```

### 2. Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    image: real-estate-backend:latest
    environment:
      - ENVIRONMENT=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - /var/lib/real-estate/data:/data
    restart: unless-stopped

  frontend:
    image: real-estate-frontend:latest
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

### 3. Deploy

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Port Conflicts

If you get "port already in use" errors:

```bash
# Find what's using the port
lsof -i :5173  # Frontend
lsof -i :8000  # Backend

# Change ports in docker-compose.yml
ports:
  - "5174:5173"  # Use different host port
```

### Permission Issues

If you get permission errors:

```bash
# Fix ownership
sudo chown -R $USER:$USER ./data

# Or run with user mapping
docker-compose run --user $(id -u):$(id -g) backend ...
```

### Build Failures

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Database Issues

```bash
# Reset database
rm -rf ./data/*.db
docker-compose run backend python -m src.cli init

# Backup database
docker-compose exec backend sqlite3 /data/tracker.db .dump > backup.sql
```

## CI/CD Integration

The GitHub Actions workflow automatically:

1. Runs tests on every push
2. Builds Docker images
3. Pushes to GitHub Container Registry
4. Deploys to staging/production

See `.github/workflows/main.yml` for details.

## Security Notes

1. **Never commit .env files** - Use .env.example as template
2. **Change default secrets** - Update JWT_SECRET in production
3. **Use specific versions** - Pin Docker image versions
4. **Scan for vulnerabilities** - Run `make security` regularly
5. **Limit container privileges** - Use `read_only: true` where possible

## Next Steps

1. Set up Kubernetes manifests for orchestration
2. Add monitoring (Prometheus/Grafana)
3. Implement backup automation
4. Set up SSL/TLS termination
5. Configure CDN for static assets