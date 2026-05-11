# Development Guide

This guide provides instructions for setting up and running Voyager Pro in your local development environment.

## 📋 Prerequisites

- **Docker Desktop** (Highly Recommended)
- **.NET 8 SDK**
- **Node.js (v18+)**
- **MSSQL Server** (If not using Docker)

## 🐳 Running with Docker (Recommended)

The easiest way to get started is using Docker Compose. This will spin up the database, backend, and frontend services.

```bash
docker-compose up --build
```

- **Frontend**: [http://localhost:8085](http://localhost:8085)
- **Backend API**: [http://localhost:5282](http://localhost:5282)
- **Swagger UI**: [http://localhost:5282/swagger](http://localhost:5282/swagger)

## 💻 Running Locally (Manual)

### 1. Database Setup
Ensure you have a SQL Server instance running and update the connection string in `backend/API/appsettings.Development.json`.

### 2. Backend API
```bash
cd backend
dotnet restore
dotnet ef database update --project Infrastructure --startup-project API
dotnet run --project API
```

### 3. Frontend App
```bash
cd frontend
npm install
npm run dev
```

## 🔑 Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `MSSQL_SA_PASSWORD` | SQL Server SA Password | `Password123!` |
| `JWT_SECRET` | Secret key for JWT signing | (Random string) |
| `API_URL` | URL of the backend API | `http://localhost:5282` |

## 🧪 Running Tests

### Backend
```bash
cd backend
dotnet test
```

### Frontend
```bash
cd frontend
npm run test
```

## 🛠️ Common Commands

- **Add Migration**: `dotnet ef migrations add <Name> --project Infrastructure --startup-project API`
- **Update Database**: `dotnet ef database update --project Infrastructure --startup-project API`
- **Frontend Lint**: `npm run lint`

## 🏗️ Refactor Notes (May 2026)

The following infrastructure was added in the May 2026 Architectural Refactor:

- **Identity Abstraction**: Use `ICurrentUserService` instead of manual claim parsing in controllers.
- **Global Error Handling**: Standardized via `ExceptionMiddleware`. No more ad-hoc `try-catch` blocks in controllers.
- **Mapping**: Mapster is used for all DTO conversions. See `Application/Common/Mappings/MappingConfig.cs`.
