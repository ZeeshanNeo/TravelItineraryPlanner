# Budget Tracking Module Implementation Plan

## Overview
The Budget Tracking module enables users to plan their trip finances by setting overall and category-specific budgets, logging expenses, and monitoring spending in real-time. It supports multiple currencies and provides visual reports of spending vs. budget.

## 1. Database Schema Extensions

### New Entities
- **TripBudget**: Stores the overall budget and category-specific allocations for a trip.
  - `Id` (Guid)
  - `TripId` (Guid, FK)
  - `TotalAmount` (Decimal)
  - `Currency` (String)
  - `CategoryBudgets` (JSON/Table: Category, Amount)
  - `CreatedAt`, `UpdatedAt`

- **Expense**: Records individual spending items.
  - `Id` (Guid)
  - `TripId` (Guid, FK)
  - `BookingId` (Guid, FK, Optional) - Links to a booking if applicable
  - `ActivityId` (Guid, FK, Optional) - Links to an activity if applicable
  - `Category` (Enum: Flight, Accommodation, Food, Transport, Activity, Shopping, Misc)
  - `Title` (String)
  - `Description` (String)
  - `Amount` (Decimal)
  - `Currency` (String)
  - `ExchangeRate` (Decimal) - Rate at time of entry relative to trip base currency
  - `Date` (DateTime)
  - `CreatedAt`, `UpdatedAt`

### Enums
- `ExpenseCategory`: Flight, Accommodation, Food, Transport, Activity, Shopping, Misc

## 2. Backend Implementation (.NET 8 Clean Architecture)

### Domain Layer
- Define `TripBudget` and `Expense` entities.
- Define `IExpenseRepository` and `ITripBudgetRepository`.

### Application Layer
- **DTOs**:
  - `TripBudgetResponse`, `UpdateTripBudgetRequest`
  - `ExpenseResponse`, `CreateExpenseRequest`, `UpdateExpenseRequest`
  - `BudgetSummaryResponse` (calculated fields: total spent, remaining, percentage by category)
- **Services**:
  - `IBudgetService`: Methods for managing budgets and fetching summaries.
  - `IExpenseService`: CRUD for expenses.
- **Validators**: FluentValidation for amounts (must be positive), required fields, and category enums.

### Infrastructure Layer
- Implement Repositories using EF Core.
- Add migrations for new tables.

### API Layer
- `BudgetsController`:
  - `GET /api/trips/{tripId}/budget`
  - `PUT /api/trips/{tripId}/budget`
  - `GET /api/trips/{tripId}/budget/summary`
- `ExpensesController`:
  - `GET /api/trips/{tripId}/expenses`
  - `POST /api/trips/{tripId}/expenses`
  - `GET /api/expenses/{id}`
  - `PUT /api/expenses/{id}`
  - `DELETE /api/expenses/{id}`

## 3. Frontend Implementation (React + TypeScript)

### Services
- `budget.service.ts`: API calls for budgets and summaries.
- `expense.service.ts`: API calls for expenses.

### Components
- **BudgetOverview**: Visual dashboard showing total budget, amount spent, and remaining balance. Includes progress bars.
- **ExpenseList**: Searchable and filterable list of logged expenses.
- **ExpenseForm**: Modal for adding/editing expenses.
- **BudgetPlanner**: Form to set the overall trip budget and allocate funds to categories.
- **ExpenseCharts**: Pie chart for spending by category, bar chart for budget vs. actual.

### UI/UX (Horizon Glass Aesthetic)
- Use vibrant color-coded categories.
- Glassmorphism cards for budget summaries.
- Real-time updates when an expense is added.

## 4. Business Logic & Edge Cases
- **Currency Conversion**: All expenses are normalized to the trip's base currency for reporting.
- **Over-budget Alerts**: Visual indicators (red bars) when a category exceeds its allocation.
- **Linking**: Automatically create expenses when a booking with a cost is confirmed (optional/future enhancement).

## 5. Acceptance Criteria
- [ ] User can set an overall budget for a trip.
- [ ] User can allocate budget to specific categories.
- [ ] User can log expenses in different currencies.
- [ ] Dashboard shows real-time spending vs. budget percentage.
- [ ] Expense list allows filtering by category and date.
- [ ] System handles decimal precision for financial data.
- [ ] Responsive design works across all device sizes.
