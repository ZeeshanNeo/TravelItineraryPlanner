# Trip Management Module Plan

## Overview
This document outlines the design and implementation plan for the Trip Management module, covering all KPIs from the project contract. The module enables users to create, view, edit, archive, and manage multiple trips.

## KPIs Covered
1. **Create Trip** – Define new trips with destination, dates, and travel type.
2. **Trip Details** – Store destination, purpose, travel companions, and notes.
3. **Multiple Trips** – Support planning and tracking multiple trips simultaneously.
4. **Edit Trip** – Modify trip details as plans evolve.
5. **Archive Trip** – Store completed trips for future reference.

## Architecture
- **Backend**: .NET 8 Clean Architecture (Domain, Application, Infrastructure, API)
- **Pattern**: Service + Repository (no CQRS, no MediatR)
- **Database**: Microsoft SQL Server with EF Core
- **Frontend**: React + TypeScript, Tailwind CSS, React Query
- **Authentication**: JWT with user‑specific data isolation

## Domain Layer

### Entities

#### Trip
```csharp
public class Trip
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public TravelType TravelType { get; set; }
    public string? Purpose { get; set; }
    public string? Notes { get; set; }
    public JsonDocument? TravelCompanions { get; set; } // JSON array of strings
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
}

public enum TravelType
{
    Business,
    Leisure,
    Family,
    Solo,
    Adventure,
    Romantic,
    Other
}
```

#### Relationships
- **User → Trip**: One‑to‑many (a user can have many trips)
- **Trip → Itinerary**: One‑to‑many (separate module)
- **Trip → Booking**: One‑to‑many (separate module)
- **Trip → Budget**: One‑to‑one (separate module)

### Interfaces
```csharp
public interface ITripRepository
{
    Task<Trip?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Trip?> GetByIdAndUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Trip>> GetByUserIdAsync(Guid userId, bool includeArchived = false, CancellationToken cancellationToken = default);
    Task AddAsync(Trip trip, CancellationToken cancellationToken = default);
    void Update(Trip trip);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
```

## Application Layer

### DTOs

#### CreateTripRequest
```csharp
public class CreateTripRequest
{
    public string Title { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public TravelType TravelType { get; set; }
    public string? Purpose { get; set; }
    public string? Notes { get; set; }
    public List<string>? TravelCompanions { get; set; }
}
```

#### UpdateTripRequest
```csharp
public class UpdateTripRequest
{
    public string? Title { get; set; }
    public string? Destination { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public TravelType? TravelType { get; set; }
    public string? Purpose { get; set; }
    public string? Notes { get; set; }
    public List<string>? TravelCompanions { get; set; }
}
```

#### TripResponse
```csharp
public class TripResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public TravelType TravelType { get; set; }
    public string? Purpose { get; set; }
    public string? Notes { get; set; }
    public List<string>? TravelCompanions { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

#### ArchiveTripRequest
```csharp
public class ArchiveTripRequest
{
    public bool IsArchived { get; set; }
}
```

### Validators
Use FluentValidation with the following rules:

**CreateTripRequestValidator**
- Title: Required, max length 100
- Destination: Required, max length 200
- StartDate: Required, must be a valid date
- EndDate: Required, must be after StartDate
- TravelType: Required, must be a defined enum value
- Purpose: Optional, max length 500
- Notes: Optional, max length 2000
- TravelCompanions: Optional, each item max length 100, max 20 items

**UpdateTripRequestValidator**
- Same rules as above, but all fields optional; if provided, apply same validation.

**ArchiveTripRequestValidator**
- IsArchived: Required boolean.

### Service Interface
```csharp
public interface ITripService
{
    Task<TripResponse> CreateTripAsync(CreateTripRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<TripResponse> GetTripAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<TripResponse>> GetUserTripsAsync(Guid userId, bool includeArchived = false, CancellationToken cancellationToken = default);
    Task<TripResponse> UpdateTripAsync(Guid tripId, UpdateTripRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task ArchiveTripAsync(Guid tripId, ArchiveTripRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task DeleteTripAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default);
}
```

## Infrastructure Layer

### Repository Implementation
`TripRepository` in `Infrastructure.Data.Repositories` implementing `ITripRepository` with EF Core.

### Service Implementation
`TripService` in `Infrastructure.Services` implementing `ITripService`, using `ITripRepository`, `IUserRepository` (for validation), and `ILogger`.

### Database Migration
Add `DbSet<Trip>` to `ApplicationDbContext` and configure relationships:
- Foreign key `UserId` referencing `Users.Id` with cascade delete.
- Index on `UserId` and `IsArchived` for query performance.
- JSON conversion for `TravelCompanions`.

## API Layer

### Endpoints
All endpoints require authentication (JWT). The user ID is extracted from the token.

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/api/trips` | Create a new trip |
| GET    | `/api/trips` | Get all trips for the current user (optional `?includeArchived=true`) |
| GET    | `/api/trips/{id}` | Get a specific trip by ID (must belong to user) |
| PUT    | `/api/trips/{id}` | Update a trip |
| PATCH  | `/api/trips/{id}/archive` | Archive/unarchive a trip |
| DELETE | `/api/trips/{id}` | Delete a trip (soft delete optional) |

### Controller
`TripsController` in `API.Controllers` with standard CRUD actions, returning appropriate HTTP status codes (200, 201, 400, 404, 403).

## Frontend Implementation

### Pages & Components

#### 1. PlanTrip Page (`/plan-trip`)
- **Purpose**: Multi‑step form for creating a new trip.
- **Changes**: Replace mock submission with API call to `POST /api/trips`.
- **Validation**: Real‑time validation using the same rules as backend.
- **After success**: Redirect to trip detail page or dashboard.

#### 2. Dashboard Page (`/dashboard`)
- **Purpose**: Overview of user’s active trips.
- **Changes**: Fetch trips from `GET /api/trips` and display as interactive cards.
- **Components**: `TripCard` component for each trip, with quick actions (view, edit, archive).
- **Filter**: Toggle to show/hide archived trips.

#### 3. TripDetail Page (`/trips/:id`)
- **Purpose**: View and edit trip details.
- **New page**: Shows all trip fields, editable inline (or separate edit mode).
- **Actions**: Buttons to archive, delete, or navigate to related modules (itinerary, booking, budget).

#### 4. TripList Page (`/trips`)
- **Purpose**: Dedicated page listing all trips with advanced filtering (by destination, date range, travel type).
- **Optional**: Can be merged into Dashboard if not needed separately.

### Reusable Components
- `TripCard`: Displays trip image (placeholder), destination, dates, travel type, and status.
- `TripForm`: Form for create/edit with validation.
- `TripFilters`: Filtering UI for the trip list.

### State Management
- Use React Query for data fetching, caching, and mutations.
- Centralized error handling with toast notifications.

### Responsive Design
- Mobile‑first responsive layouts using Tailwind CSS.
- Touch‑friendly buttons and controls.
- Breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop).

## Validation & Error Handling

### Backend Validation
- FluentValidation integrated with ASP.NET Core model validation.
- Custom validation for business rules (e.g., date consistency).
- Global exception middleware returning consistent error responses.

### Frontend Validation
- Form‑level validation using React Hook Form + Zod (or similar).
- Display validation errors inline.

### Edge Cases
1. **Concurrent edits**: Last‑write‑wins strategy; consider adding a `Version` column for optimistic concurrency if needed later.
2. **Large travel companions list**: Limit to 20 items, each max 100 characters.
3. **Past dates**: Allow past dates for historical trips.
4. **Timezone handling**: Store all dates as UTC, display in user’s local timezone.
5. **User permissions**: Ensure users can only access their own trips (repository methods filter by `UserId`).
6. **Archived trip visibility**: Archived trips are excluded by default; include only when explicitly requested.
7. **Soft delete**: Optionally soft‑delete trips (set `IsDeleted` flag) instead of physical deletion.

## Acceptance Criteria

### Create Trip
- Given a logged‑in user, when they submit a valid trip form, a new trip is created and appears in their trip list.
- Given missing required fields, the system displays validation errors and does not create the trip.
- Given a start date after the end date, validation fails with a descriptive error.

### Trip Details
- Given a trip exists, the user can view all stored details (destination, purpose, travel companions, notes) on the trip detail page.
- Given a trip with travel companions stored as JSON, the frontend renders them as a readable list.

### Multiple Trips
- Given a user has multiple trips, the dashboard displays all trips (paginated or scrollable).
- Given a user has archived trips, they can toggle a filter to show/hide archived trips.

### Edit Trip
- Given a trip exists, the user can edit any field and save changes; the updated data is reflected immediately.
- Given a user tries to edit a trip they don’t own, they receive a 403 Forbidden error.

### Archive Trip
- Given an active trip, the user can archive it, moving it to the archived list.
- Given an archived trip, the user can unarchive it, making it active again.

## Testing

### Backend Tests
- Unit tests for `TripService`, validators, and repository.
- Integration tests for API endpoints (using `WebApplicationFactory`).
- Edge‑case tests for validation rules and permission checks.

### Frontend Tests
- Component tests for `TripCard`, `TripForm` using React Testing Library.
- End‑to‑end tests for critical user flows (create, edit, archive) with Playwright or Cypress.

## Database Migration Steps
1. Create `Trips` table with columns as per entity.
2. Add foreign‑key constraint to `Users` table.
3. Create indexes on `UserId`, `IsArchived`, and `StartDate` for performance.
4. Seed sample trips for development.

## Deployment Considerations
- Migration will be applied automatically via EF Core migrations in CI/CD.
- No breaking changes to existing schema.
- Backward compatible: existing users without trips will see empty state.

## Dependencies
- **Backend**: .NET 8, EF Core, FluentValidation, Microsoft SQL Server.
- **Frontend**: React 18, TypeScript, Tailwind CSS, React Query, React Hook Form, date‑handling library (date‑fns or dayjs).

## Timeline Estimate
- **Day 1**: Database design, backend entities, repository, service.
- **Day 2**: API endpoints, validation, unit tests.
- **Day 3**: Frontend pages (PlanTrip, Dashboard integration), components.
- **Day 4**: Frontend‑backend integration, error handling, responsive polish.
- **Day 5**: Testing, bug fixes, documentation.

## Success Metrics
- All five KPIs implemented and passing.
- Full test coverage for critical paths.
- Responsive design works on mobile, tablet, and desktop.
- No regressions in existing modules (authentication, profile).
- Performance: trip list loads under 2 seconds with 100+ trips.

---
*This plan adheres to the project rules: .NET 8 Clean Architecture, Service + Repository pattern, no CQRS/MediatR, and follows the persona of a Senior Full Stack Engineer.*