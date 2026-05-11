# Architecture: Deployment & Infrastructure

## Overview
Voyager Pro utilizes a containerized architecture to ensure environment consistency across Development, Staging, and Production.

## 🐳 Containerization (Docker Compose)
The system is orchestrated via `docker-compose.yml` with three primary services.

### Services & Port Mapping
| Service | Image/Build | Port (Host:Container) | Responsibility |
| :--- | :--- | :--- | :--- |
| **`db`** | `mcr.microsoft.com/mssql/server:2022-latest` | `1433:1433` | Microsoft SQL Server Persistence |
| **`backend`** | `.NET 8 SDK` (Custom Build) | `8080:8080` | ASP.NET Core Web API |
| **`frontend`** | `Node 20` -> `Nginx` (Custom Build) | `5173:80` | React + Vite (Served via Nginx) |

### Persistence & Volumes
- **`sql-data`**: Stores the `.mdf` and `.ldf` files for the database.
- **`upload-data`**: Stores physical files for the Document Vault and Memory Gallery.

## ⚙️ Environment Variables
- **`DB_CONNECTION`**: Connection string for SQL Server.
- **`JWT_SECRET`**: Key for signing authentication tokens.
- **`FILE_STORAGE_ROOT`**: Base path for uploaded files.

## 🚀 CI/CD & Production Hardening
- **Multi-Stage Builds**: Drastically reduces image size by excluding build-time dependencies.
- **Health Checks**: Containers auto-restart if the `/health` endpoint fails.
- **Non-Root Execution**: Backend and Frontend processes run as limited users for security.
- **Gzip/Brotli**: Nginx configured for high-performance asset compression.
