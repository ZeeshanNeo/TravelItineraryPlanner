# Module: Budget & Expense Tracking

## Overview
A financial management tool designed for travelers to track spending against planned budgets in real-time.

## Key Performance Indicators (KPIs)
- **Budgeting**: Set total and category-specific trip budgets.
- **Expense Logging**: Track spending in multiple currencies.
- **Visual Analytics**: Real-time charts showing category breakdowns.
- **Budget Alerts**: Visual indicators for over-spending.

## 🗄️ Database Schema

### Budget Tables
```sql
CREATE TABLE Budgets (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    TripId UNIQUEIDENTIFIER NOT NULL,
    TotalAmount DECIMAL(18,2) NOT NULL,
    BaseCurrency NVARCHAR(3) DEFAULT 'USD',
    CategoryAllocations JSONB -- JSON mapping of category to amount
);

CREATE TABLE Expenses (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    BudgetId UNIQUEIDENTIFIER NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    Currency NVARCHAR(3) NOT NULL,
    Category NVARCHAR(20) NOT NULL, -- Flight, Food, Fun, etc.
    Date DATETIME2 DEFAULT GETUTCDATE()
);
```

## 🏗️ Technical Implementation

### Multi-Currency Logic
- Expenses are stored in their original currency.
- A background service or frontend utility performs conversion to the `BaseCurrency` for dashboard aggregation.

### Frontend Integration
- **Chart.js / Recharts**: Used to render spending distribution.
- **Responsive Lists**: Expense history optimized for mobile viewing with swipe-to-edit.

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/budgets/{tripId}` | Get budget summary and charts |
| `POST` | `/api/expenses` | Log a new expense |
| `PUT` | `/api/budgets/{id}/allocations` | Update category limits |

## 🛡️ Validation Rules
- **Cost**: Must be greater than zero.
- **Currency**: Must be a valid ISO 4217 code.
- **Allocations**: Total category budget cannot exceed 150% of the total trip budget.
