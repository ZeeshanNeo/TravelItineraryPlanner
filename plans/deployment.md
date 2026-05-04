# Docker & Deployment Plan

## Overview
This module focuses on containerizing the "Voyager Pro" application to ensure consistent deployment across different environments. We will use Docker and Docker Compose to orchestrate the React frontend, .NET backend, and SQL Server database.

## 1. Containerization Architecture

### Multi-Container Setup
- **Frontend Container**: Nginx-based image serving the production build of the React app.
- **Backend Container**: .NET 8 ASP.NET Core image running the Web API.
- **Database Container**: Microsoft SQL Server 2022 Express/Developer edition.
- **Volume Storage**: Persistent storage for SQL Server data and travel documents/photos.

## 2. Dockerization Strategy

### Backend (Dockerfile)
- **Base Image**: `mcr.microsoft.com/dotnet/aspnet:8.0`
- **Build Image**: `mcr.microsoft.com/dotnet/sdk:8.0`
- **Process**: Multi-stage build (Restore -> Build -> Publish -> Runtime).
- **Environment**: Configurable via `ASPNETCORE_ENVIRONMENT`.

### Frontend (Dockerfile)
- **Base Image**: `nginx:stable-alpine`
- **Build Image**: `node:20-alpine`
- **Process**: Multi-stage build (Install -> Build -> Serve).
- **Configuration**: custom `nginx.conf` to handle React Router client-side routing.

### Database (Docker Compose)
- **Image**: `mcr.microsoft.com/mssql/server:2022-latest`
- **Acceptance**: `ACCEPT_EULA=Y`
- **Credentials**: `MSSQL_SA_PASSWORD` managed via environment variables.

## 3. Orchestration (docker-compose.yml)

### Services
- `db`: SQL Server container.
- `backend`: Depends on `db`. Uses health-checks to ensure DB is ready before starting migrations.
- `frontend`: Depends on `backend`. Proxies `/api` requests to the backend service.

### Networks
- `voyager-network`: Private network for inter-container communication.

## 4. Environment Variable Strategy

### Configuration Layers
- **Development**: `.env.development`
- **Production**: `.env.production` (or CI/CD secrets)
- **Variables**:
  - `DB_CONNECTION_STRING`
  - `JWT_SECRET`
  - `ALLOWED_ORIGINS`
  - `UPLOAD_PATH`

## 5. Security & Production Readiness

### Hardening
- **Non-root Users**: Run containers as non-root where possible.
- **Resource Limits**: Define CPU and Memory limits in Docker Compose.
- **Health Checks**:
  - Backend: `/health` endpoint.
  - Database: `sys.dm_os_sys_info` check.

### Data Persistence
- **Volumes**:
  - `sql-data`: Persists the MSSQL data.
  - `upload-data`: Persists documents and photos.

## 6. Implementation Checklist

### Docker Files
- [ ] Create `backend/Dockerfile`.
- [ ] Create `frontend/Dockerfile`.
- [ ] Create `frontend/nginx.conf`.
- [ ] Create root-level `docker-compose.yml`.

### Infrastructure
- [ ] Configure `appsettings.Production.json` for backend.
- [ ] Implement health check endpoint in .NET.
- [ ] Create `.dockerignore` files for both frontend and backend.

### Deployment Scripting
- [ ] Create `deploy.sh` or `docker-build.ps1` for easy one-step builds.

## 7. Acceptance Criteria
- [ ] Entire stack starts with a single `docker-compose up --build` command.
- [ ] Data persists after `docker-compose down` and subsequent `up`.
- [ ] Frontend correctly proxies API requests to the backend container.
- [ ] Application is accessible at `http://localhost`.
- [ ] No hardcoded connection strings or secrets in the Docker images.
- [ ] Images are optimized for size (using alpine/slim bases).

> [!NOTE]
> Although the initial prompt mentioned PostgreSQL, the existing codebase and KPI contract specify Microsoft SQL Server. This plan proceeds with SQL Server to maintain architectural integrity.
