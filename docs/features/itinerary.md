# Module: Itinerary Planning

## Overview
The Itinerary Planning module is the heart of the Voyager Pro experience, allowing users to build detailed, chronological schedules for their trips.

## Key Performance Indicators (KPIs)
- **Day-by-Day Planning**: Flexible scheduling for any trip duration.
- **Activity Scheduling**: Detailed slots with locations and descriptions.
- **Drag-and-Drop**: Intuitive reordering of activities.
- **Time Allocation**: Visual timeline of the daily schedule.
- **Travel Time**: Automated estimation between activities.

## 🗄️ Domain Layer (C# Entities)

### ItineraryDay
Each itinerary consists of multiple days, mapped to specific dates.
```csharp
public class ItineraryDay
{
    public Guid Id { get; set; }
    public Guid ItineraryId { get; set; }
    public int DayNumber { get; set; }
    public DateOnly Date { get; set; }
    public ICollection<Activity> Activities { get; set; } = new List<Activity>();
}
```

### Activity
The granular unit of planning, containing location and timing data.
```csharp
public class Activity
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public ActivityType Type { get; set; } // Accommodation, Dining, Sightseeing, etc.
    public int TravelTimeFromPrevious { get; set; } // in minutes
}
```

## 🏗️ Technical Implementation

### Backend Strategy
- **Repositories**: Dedicated interfaces for `IItineraryRepository`, `IItineraryDayRepository`, and `IActivityRepository`.
- **Validation**: FluentValidation ensures `EndTime` is always after `StartTime` and dates are within trip boundaries.

### Frontend Strategy
- **Drag-and-Drop**: Implemented using `@dnd-kit` for high-performance sorting.
- **Timeline Visualization**: Custom responsive component showing color-coded activity blocks.
- **Optimistic Updates**: React Query mutations allow the UI to update instantly during drag-and-drop operations, with background syncing.

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/itineraries/trip/{tripId}` | Fetch full itinerary with days |
| `POST` | `/api/itineraries/{itineraryId}/days` | Add a new day to the trip |
| `POST` | `/api/itineraries/days/{dayId}/activities` | Create a new activity |
| `PUT` | `/api/itineraries/days/{dayId}/activities/reorder` | Update activity sort order |

## 🧪 Testing Strategy
- **Logic Tests**: Unit tests for time conflict detection and travel time calculation.
- **UI Tests**: Integration tests for drag-and-drop interactions using React Testing Library.
