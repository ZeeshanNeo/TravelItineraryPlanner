# ADR 001: Choice of Microsoft SQL Server

## Status
Accepted

## Context
The project requires a robust, relational database with strong ACID properties to manage complex itineraries, bookings, and financial data. While some initial discussions mentioned PostgreSQL, the existing infrastructure and KPI contract were designed around MSSQL.

## Decision
We will use Microsoft SQL Server 2022 as the primary relational database.

## Rationale
1. **Consistency**: Aligns with the existing .NET ecosystem and EF Core best practices for this project.
2. **Persistence**: Docker Compose setup with volumes ensures data persists across container restarts.
3. **Enterprise Readiness**: Provides native support for complex JSON queries (useful for travel preferences and category budgets).

## Consequences
- Requires the use of `mcr.microsoft.com/mssql/server` in Docker.
- Backend must use the `Microsoft.EntityFrameworkCore.SqlServer` provider.
