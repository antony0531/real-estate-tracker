# Real Estate Tracker - Development Makefile
.PHONY: help build up down restart logs shell test lint clean

# Default target
help:
	@echo "Real Estate Tracker - Development Commands"
	@echo "========================================="
	@echo "make build       - Build all Docker images"
	@echo "make up          - Start all services"
	@echo "make down        - Stop all services"
	@echo "make restart     - Restart all services"
	@echo "make logs        - View logs from all services"
	@echo "make shell-back  - Open shell in backend container"
	@echo "make shell-front - Open shell in frontend container"
	@echo "make test        - Run all tests"
	@echo "make lint        - Run linters"
	@echo "make clean       - Clean up containers and volumes"
	@echo "make dev         - Start development environment"
	@echo "make prod        - Start production environment"

# Build Docker images
build:
	docker-compose build

# Start services
up:
	docker-compose up -d

# Start development environment
dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Start production environment
prod:
	docker-compose -f docker-compose.yml up -d

# Stop services
down:
	docker-compose down

# Restart services
restart: down up

# View logs
logs:
	docker-compose logs -f

# Open shell in backend container
shell-back:
	docker-compose exec backend /bin/sh

# Open shell in frontend container
shell-front:
	docker-compose exec frontend /bin/sh

# Run backend tests
test-back:
	docker-compose exec backend pytest tests/ -v

# Run frontend tests
test-front:
	docker-compose exec frontend npm test

# Run all tests
test: test-back test-front

# Run backend linting
lint-back:
	docker-compose exec backend black --check src/
	docker-compose exec backend flake8 src/

# Run frontend linting
lint-front:
	docker-compose exec frontend npm run lint

# Run all linters
lint: lint-back lint-front

# Clean up everything
clean:
	docker-compose down -v
	docker system prune -f

# Database operations
db-shell:
	docker-compose exec backend python -m src.cli

db-migrate:
	docker-compose exec backend alembic upgrade head

db-rollback:
	docker-compose exec backend alembic downgrade -1

# Development utilities
install-hooks:
	cd desktop && npm install --save-dev husky lint-staged
	cd desktop && npx husky install
	cd desktop && npx husky add .husky/pre-commit "npx lint-staged"

# Format code
format:
	docker-compose exec backend black src/
	docker-compose exec frontend npm run format

# Security scan
security:
	docker-compose exec backend bandit -r src/
	docker-compose exec backend safety check
	docker-compose exec frontend npm audit

# Build production images
build-prod:
	docker build -t real-estate-backend:latest ./backend
	docker build -t real-estate-frontend:latest ./desktop