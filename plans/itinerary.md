# Itinerary Planning Module Plan

## Overview
This document outlines the design and implementation plan for the Itinerary Planning module, covering all KPIs from the project contract. The module enables users to create detailed day-by-day itineraries with activity scheduling, drag-and-drop reordering, time allocation visualization, and travel time calculation.

## KPIs Covered
1. **Day-by-Day Planning** – Create detailed schedules for each day of the trip.
2. **Activity Scheduling** – Add activities with time slots, locations, and descriptions.
3. **Drag-and-Drop** – Rearrange activities with intuitive drag-and-drop interface.
4. **Time Allocation** – Visual timeline showing how time is allocated each day.
5. **Travel Time Calculation** – Estimate travel time between locations.

## Architecture
- **Backend**: .NET 8 Clean Architecture (Domain, Application, Infrastructure, API)
- **Pattern**: Service + Repository (no CQRS, no MediatR)
- **Database**: Microsoft SQL Server with EF Core
- **Frontend**: React + TypeScript, Tailwind CSS, React Query, @dnd-kit for drag-and-drop
- **Authentication**: JWT with user‑specific data isolation

## Domain Layer

### Entities

#### Itinerary
```csharp
public class Itinerary
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int TotalDays { get; set; }

    // Navigation properties
    public Trip Trip { get; set; } = null!;
    public ICollection<ItineraryDay> Days { get; set; } = new List<ItineraryDay>();
}
```

#### ItineraryDay
```csharp
public class ItineraryDay
{
    public Guid Id { get; set; }
    public Guid ItineraryId { get; set; }
    public int DayNumber { get; set; }
    public DateOnly Date { get; set; }
    public string? Notes { get; set; }
    public int Order { get; set; }

    // Navigation properties
    public Itinerary Itinerary { get; set; } = null!;
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
}
```

#### Activity
```csharp
public class Activity
{
    public Guid Id { get; set; }
    public Guid DayId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Location { get; set; }
    public string? Address { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public ActivityType Type { get; set; }
    public int Order { get; set; }
    public decimal? EstimatedCost { get; set; }
    public string? BookingReference { get; set; }
    public bool IsFlexible { get; set; }
    public int TravelTimeFromPrevious { get; set; } // in minutes

    // Navigation properties
    public ItineraryDay Day { get; set; } = null!;
}

public enum ActivityType
{
    Accommodation,
    Transportation,
    Sightseeing,
    Dining,
    Shopping,
    Entertainment,
    Business,
    Leisure,
    Other
}
```

#### Relationships
- **Trip → Itinerary**: One-to-one (a trip has one itinerary)
- **Itinerary → ItineraryDay**: One-to-many (an itinerary has multiple days)
- **ItineraryDay → Activity**: One-to-many (a day has multiple activities)

### Interfaces
```csharp
public interface IItineraryRepository
{
    Task<Itinerary?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Itinerary?> GetByTripIdAsync(Guid tripId, CancellationToken cancellationToken = default);
    Task<Itinerary?> GetByIdAndTripUserIdAsync(Guid id, Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(Itinerary itinerary, CancellationToken cancellationToken = default);
    void Update(Itinerary itinerary);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public interface IItineraryDayRepository
{
    Task<ItineraryDay?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ItineraryDay>> GetByItineraryIdAsync(Guid itineraryId, CancellationToken cancellationToken = default);
    Task AddAsync(ItineraryDay day, CancellationToken cancellationToken = default);
    void Update(ItineraryDay day);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}

public interface IActivityRepository
{
    Task<Activity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Activity>> GetByDayIdAsync(Guid dayId, CancellationToken cancellationToken = default);
    Task AddAsync(Activity activity, CancellationToken cancellationToken = default);
    void Update(Activity activity);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
```

## Application Layer

### DTOs

#### CreateItineraryRequest
```csharp
public class CreateItineraryRequest
{
    public Guid TripId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Notes { get; set; }
}
```

#### UpdateItineraryRequest
```csharp
public class UpdateItineraryRequest
{
    public string? Title { get; set; }
    public string? Notes { get; set; }
}
```

#### CreateItineraryDayRequest
```csharp
public class CreateItineraryDayRequest
{
    public Guid ItineraryId { get; set; }
    public int DayNumber { get; set; }
    public DateOnly Date { get; set; }
    public string? Notes { get; set; }
}
```

#### CreateActivityRequest
```csharp
public class CreateActivityRequest
{
    public Guid DayId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Location { get; set; }
    public string? Address { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public ActivityType Type { get; set; }
    public decimal? EstimatedCost { get; set; }
    public string? BookingReference { get; set; }
    public bool IsFlexible { get; set; }
}
```

#### ReorderActivitiesRequest
```csharp
public class ReorderActivitiesRequest
{
    public List<Guid> ActivityIds { get; set; } = new List<Guid>();
}
```

#### CalculateTravelTimeRequest
```csharp
public class CalculateTravelTimeRequest
{
    public string FromAddress { get; set; } = string.Empty;
    public string ToAddress { get; set; } = string.Empty;
    public string Mode { get; set; } = "driving"; // driving, walking, transit
}
```

#### ItineraryResponse
```csharp
public class ItineraryResponse
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int TotalDays { get; set; }
    public List<ItineraryDayResponse> Days { get; set; } = new List<ItineraryDayResponse>();
}
```

#### ItineraryDayResponse
```csharp
public class ItineraryDayResponse
{
    public Guid Id { get; set; }
    public Guid ItineraryId { get; set; }
    public int DayNumber { get; set; }
    public DateOnly Date { get; set; }
    public string? Notes { get; set; }
    public List<ActivityResponse> Activities { get; set; } = new List<ActivityResponse>();
}
```

#### ActivityResponse
```csharp
public class ActivityResponse
{
    public Guid Id { get; set; }
    public Guid DayId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Location { get; set; }
    public string? Address { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public ActivityType Type { get; set; }
    public int Order { get; set; }
    public decimal? EstimatedCost { get; set; }
    public string? BookingReference { get; set; }
    public bool IsFlexible { get; set; }
    public int TravelTimeFromPrevious { get; set; }
}
```

### Validators
Use FluentValidation with the following rules:

**CreateItineraryRequestValidator**
- TripId: Required, must be a valid GUID
- Title: Required, max length 200
- Notes: Optional, max length 2000

**CreateItineraryDayRequestValidator**
- ItineraryId: Required, must be a valid GUID
- DayNumber: Required, must be between 1 and 365
- Date: Required, must be a valid date

**CreateActivityRequestValidator**
- DayId: Required, must be a valid GUID
- Title: Required, max length 200
- Description: Optional, max length 2000
- Location: Optional, max length 200
- Address: Optional, max length 500
- StartTime: Required
- EndTime: Required, must be after StartTime
- Type: Required, must be a defined enum value
- EstimatedCost: Optional, must be >= 0
- BookingReference: Optional, max length 100

**ReorderActivitiesRequestValidator**
- ActivityIds: Required, must contain at least one GUID, max 100 items

### Service Interface
```csharp
public interface IItineraryService
{
    // Itinerary operations
    Task<ItineraryResponse> CreateItineraryAsync(CreateItineraryRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<ItineraryResponse> GetItineraryByTripIdAsync(Guid tripId, Guid userId, CancellationToken cancellationToken = default);
    Task<ItineraryResponse> UpdateItineraryAsync(Guid itineraryId, UpdateItineraryRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task DeleteItineraryAsync(Guid itineraryId, Guid userId, CancellationToken cancellationToken = default);

    // Day operations
    Task<ItineraryDayResponse> AddDayAsync(CreateItineraryDayRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<ItineraryDayResponse> UpdateDayAsync(Guid dayId, UpdateItineraryDayRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task DeleteDayAsync(Guid dayId, Guid userId, CancellationToken cancellationToken = default);

    // Activity operations
    Task<ActivityResponse> AddActivityAsync(CreateActivityRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task<ActivityResponse> UpdateActivityAsync(Guid activityId, UpdateActivityRequest request, Guid userId, CancellationToken cancellationToken = default);
    Task DeleteActivityAsync(Guid activityId, Guid userId, CancellationToken cancellationToken = default);
    Task ReorderActivitiesAsync(Guid dayId, ReorderActivitiesRequest request, Guid userId, CancellationToken cancellationToken = default);

    // Travel time calculation
    Task<int> CalculateTravelTimeAsync(CalculateTravelTimeRequest request, CancellationToken cancellationToken = default);
}
```

## Infrastructure Layer

### Repository Implementation
- `ItineraryRepository` in `Infrastructure.Data.Repositories` implementing `IItineraryRepository` with EF Core.
- `ItineraryDayRepository` in `Infrastructure.Data.Repositories` implementing `IItineraryDayRepository`.
- `ActivityRepository` in `Infrastructure.Data.Repositories` implementing `IActivityRepository`.

### Service Implementation
`ItineraryService` in `Infrastructure.Services` implementing `IItineraryService`, using repositories and `ILogger`.

### Database Migration
Add `DbSet<Itinerary>`, `DbSet<ItineraryDay>`, and `DbSet<Activity>` to `ApplicationDbContext` and configure relationships:
- Foreign key `TripId` referencing `Trips.Id` with cascade delete.
- Foreign key `ItineraryId` referencing `Itineraries.Id` with cascade delete.
- Foreign key `DayId` referencing `ItineraryDays.Id` with cascade delete.
- Indexes for query performance: `IX_Itineraries_TripId`, `IX_ItineraryDays_ItineraryId`, `IX_Activities_DayId`.

## API Layer

### Endpoints
All endpoints require authentication (JWT). The user ID is extracted from the token.

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/api/itineraries` | Create a new itinerary for a trip |
| GET    | `/api/itineraries/trip/{tripId}` | Get itinerary for a specific trip |
| PUT    | `/api/itineraries/{id}` | Update an itinerary |
| DELETE | `/api/itineraries/{id}` | Delete an itinerary |
| POST   | `/api/itineraries/{itineraryId}/days` | Add a day to an itinerary |
| PUT    | `/api/itineraries/days/{dayId}` | Update a day |
| DELETE | `/api/itineraries/days/{dayId}` | Delete a day |
| POST   | `/api/itineraries/days/{dayId}/activities` | Add an activity to a day |
| PUT    | `/api/itineraries/activities/{activityId}` | Update an activity |
| DELETE | `/api/itineraries/activities/{activityId}` | Delete an activity |
| PUT    | `/api/itineraries/days/{dayId}/activities/reorder` | Reorder activities within a day |
| POST   | `/api/itineraries/travel-time/calculate` | Calculate travel time between locations |

## Frontend Architecture

### Component Structure
```
src/
├── features/
│   └── itinerary/
│       ├── components/
│       │   ├── ItineraryPlanner.tsx      # Main planner component
│       │   ├── DayCard.tsx               # Day card with activities
│       │   ├── ActivityCard.tsx          # Draggable activity card
│       │   ├── TimelineView.tsx          # Visual timeline
│       │   ├── ActivityForm.tsx          # Add/edit activity form
│       │   └── TravelTimeCalculator.tsx  # Travel time calculator
│       ├── hooks/
│       │   ├── useItinerary.ts           # Itinerary data fetching
│       │   ├── useDragAndDrop.ts         # Drag-and-drop logic
│       │   └── useTravelTime.ts          # Travel time calculation
│       └── pages/
│           ├── ItineraryDetailPage.tsx   # Detailed itinerary view
│           └── ItineraryPlannerPage.tsx  # Full planner page
```

### Drag-and-Drop Implementation
Use `@dnd-kit` library for drag-and-drop functionality:
- `DndContext` for drag context
- `SortableContext` for sortable lists
- `useSortable` hook for individual sortable items
- Visual feedback during dragging

### Timeline Visualization
Create a responsive timeline component that shows:
- Day-by-day breakdown
- Activity blocks with time allocation
- Color-coded activity types
- Travel time indicators between activities
- Mobile-friendly horizontal scrolling

### Responsive Design
- Mobile-first approach (320px+ width)
- Tablet optimization (768px+ width)
- Desktop optimization (1024px+ width)
- Touch-friendly drag handles for mobile
- Collapsible panels for smaller screens

### State Management
- Use React Query for server state (itinerary data)
- Use Zustand or Context for client state (UI state, drag state)
- Optimistic updates for drag-and-drop reordering

## Acceptance Criteria

### Functional Requirements
1. Users can create an itinerary for an existing trip
2. Users can add/remove days to the itinerary
3. Users can add/remove/edit activities within days
4. Users can drag and drop activities to reorder them within a day
5. Users can drag and drop activities between days
6. System displays a visual timeline of activities
7. System calculates and displays travel time between consecutive activities
8. Users can mark activities as flexible (time adjustable)
9. System validates activity time conflicts
10. Itinerary data persists across sessions

### Non-Functional Requirements
1. Responsive design works on mobile, tablet, and desktop
2. Drag-and-drop works smoothly on touch devices
3. API responses within 500ms for typical operations
4. Offline viewing of itineraries (cached data)
5. Accessible to screen readers (ARIA labels)

### Edge Cases
1. Handling time zone differences for international trips
2. Activities spanning multiple days (e.g., multi-day tours)
3. Overlapping activity times with warnings
4. Large itineraries with 50+ activities per day
5. Concurrent editing by multiple collaborators (future)
6. Network failures during drag-and-drop operations

## Testing Strategy

### Backend Tests
- Unit tests for `ItineraryService`, `ItineraryDayService`, `ActivityService`
- Integration tests for API endpoints
- Repository tests with in-memory database
- Validation tests for DTOs

### Frontend Tests
- Component tests with React Testing Library
- Integration tests for drag-and-drop functionality
- E2E tests for critical user flows (create itinerary, add activities, reorder)
- Accessibility tests

## Implementation Timeline
1. **Phase 1**: Domain entities, repositories, and database migrations
2. **Phase 2**: Service layer implementation and validation
3. **Phase 3**: API controllers and endpoint testing
4