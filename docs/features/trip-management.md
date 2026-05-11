# Module: Trip Management

## Overview
The primary module for organizing and tracking high-level travel data. It serves as the container for all other modules.

## Key Performance Indicators (KPIs)
- **Create Trip**: Define destinations, dates, and trip types.
- **Trip Details**: Store purpose, companions, and notes.
- **Multiple Trips**: Manage concurrent and historical planning.
- **Edit Trip**: Real-time updates to evolving plans.
- **Archive Trip**: Soft-delete functionality for completed journeys.

## 🗄️ Domain Layer (C# Entities)

### Trip Entity (Rich Domain Model)
```csharp
public class Trip : BaseEntity
{
    public Guid UserId { get; private set; }
    public string Title { get; private set; }
    public string Destination { get; private set; }
    public DateTime StartDate { get; private set; }
    public DateTime EndDate { get; private set; }
    // ... encapsulated behavior methods
}
```

## 🏗️ Technical Implementation

### Backend Strategy
- **Repository Pattern**: `ITripRepository` handles all data persistence and filtering.
- **Validation**: Enforced at the Domain level and via FluentValidation.
- **Security**: Data isolation enforced at the repository level via `UserId` filtering.

### Frontend Strategy
- **Dashboard**: Centralized hub showing active and upcoming trips.
- **Trip Detail Page**: Comprehensive view with navigation to sub-modules.
- **Responsive**: 1/2/3 column layout switching for Mobile, Tablet, and Desktop.

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/trips` | List active trips (supports `includeArchived`) |
| `POST` | `/api/trips` | Create a new trip |
| `PATCH` | `/api/trips/{id}/archive` | Toggle archived status |
| `DELETE` | `/api/trips/{id}` | Permanently remove a trip |

## 🧪 Edge Cases Handled
- **Timezone Management**: All dates stored as UTC; local conversion on the frontend.
- **Concurrency**: Basic last-write-wins strategy.
- **Companion Limits**: Capped at 20 items per trip.

---

## 🏗️ Refactor Notes (May 2026)

This module was the first to be migrated to the **May 2026 Architectural Standards**:
- **Result Pattern**: The API now returns wrapped Result objects, ensuring consistent error responses without exception overhead.
- **Rich Domain**: Date boundary validation (Start < End) was moved from the service layer into the `Trip` constructor and `UpdateDetails` method.
- **Automated Mapping**: Manual mapping logic in `TripService` was replaced by **Mapster** configurations.
