# Docker Deployment Guide

## Overview

This guide explains how to deploy the Smart Parking Management System using Docker and Docker Compose.

## Prerequisites

- Docker (v20.10+)
- Docker Compose (v2.0+)
- 4GB RAM minimum
- 10GB free disk space

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd parking-system-main
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

### 3. Start Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 4. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432

## Environment Configuration

### Required Variables

```env
# Database
DB_USER=parking_user
DB_PASSWORD=your_secure_password
DB_NAME=parking_system

# Backend
JWT_SECRET=your_very_long_random_secret_key
```

### Optional Variables

```env
# Ports
DB_PORT=5432
PORT=5000

# Node Environment
NODE_ENV=production
```

## Docker Commands

### Starting Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend

# Start with build
docker-compose up -d --build
```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop specific service
docker-compose stop backend
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100
```

### Executing Commands

```bash
# Access backend container
docker-compose exec backend sh

# Access database
docker-compose exec database psql -U parking_user -d parking_system

# Run npm commands
docker-compose exec backend npm test
```

## Development Mode

Use `docker-compose.dev.yml` for development with hot reload:

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

## Database Management

### Initialize Database

Database is automatically initialized with migrations on first run.

### Manual Migration

```bash
# Access database container
docker-compose exec database psql -U parking_user -d parking_system

# Run migration manually
docker-compose exec database psql -U parking_user -d parking_system -f /docker-entrypoint-initdb.d/migrations/001_initial_schema.sql
```

### Backup Database

```bash
# Create backup
docker-compose exec database pg_dump -U parking_user parking_system > backup_$(date +%Y%m%d).sql

# Restore backup
docker-compose exec -T database psql -U parking_user parking_system < backup_20251203.sql
```

### Seed Data

```bash
# Load seed data
docker-compose exec database psql -U parking_user -d parking_system -f /docker-entrypoint-initdb.d/seeds/001_seed_data.sql
```

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose up -d --build

# Remove volumes and restart
docker-compose down -v
docker-compose up -d
```

### Database Connection Issues

```bash
# Check database health
docker-compose exec database pg_isready -U parking_user

# Verify environment variables
docker-compose exec backend env | grep DB_

# Restart database
docker-compose restart database
```

### Port Already in Use

```bash
# Find process using port
# Windows
netstat -ano | findstr :5000

# Kill process or change port in .env
```

### Container Logs

```bash
# Backend logs
docker-compose logs backend

# Database logs
docker-compose logs database

# Frontend logs
docker-compose logs frontend
```

## Production Deployment

### Security Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Configure firewall
- [ ] Set up monitoring
- [ ] Regular backups

### Recommended Setup

```bash
# Use production compose file
docker-compose -f docker-compose.yml up -d

# Enable restart policy
# (already configured in docker-compose.yml)

# Set up reverse proxy (Nginx)
# Configure SSL certificates
```

### Scaling

```bash
# Scale backend instances
docker-compose up -d --scale backend=3

# Use load balancer (Nginx/HAProxy)
```

## Monitoring

### Health Checks

```bash
# Check container health
docker-compose ps

# Backend health
curl http://localhost:5000/

# Database health
docker-compose exec database pg_isready
```

### Resource Usage

```bash
# View resource usage
docker stats

# Specific container
docker stats parking-backend
```

## Maintenance

### Update Images

```bash
# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build
```

### Clean Up

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove all stopped containers
docker container prune
```

## Docker Architecture

```
┌─────────────────────────────────────────┐
│         Docker Compose                  │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────┐    ┌──────────────┐  │
│  │  Frontend   │    │   Backend    │  │
│  │  (Nginx)    │───▶│  (Node.js)   │  │
│  │  Port 3000  │    │  Port 5000   │  │
│  └─────────────┘    └──────┬───────┘  │
│                             │          │
│                      ┌──────▼───────┐  │
│                      │  PostgreSQL  │  │
│                      │  Port 5432   │  │
│                      └──────────────┘  │
│                             │          │
│                      ┌──────▼───────┐  │
│                      │   Volume     │  │
│                      │ (Persistent) │  │
│                      └──────────────┘  │
└─────────────────────────────────────────┘
```

## Network Configuration

All services communicate through `parking-network`:

- Frontend → Backend: HTTP
- Backend → Database: PostgreSQL protocol
- External → Frontend: Port 3000
- External → Backend: Port 5000

## Volume Management

### Persistent Data

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect parking-system-main_postgres_data

# Backup volume
docker run --rm -v parking-system-main_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

## Best Practices

1. **Use .env file** for configuration
2. **Regular backups** of database volume
3. **Monitor logs** for errors
4. **Update images** regularly
5. **Use health checks** for reliability
6. **Limit resource usage** in production
7. **Enable logging** to external service

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Node.js Docker Image](https://hub.docker.com/_/node)
- [Nginx Docker Image](https://hub.docker.com/_/nginx)

---

**Last Updated**: December 2025  
**Version**: 1.0.0
