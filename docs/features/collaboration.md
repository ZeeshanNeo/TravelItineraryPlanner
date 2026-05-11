# Module: Collaboration & Sharing

## Overview
Supports group travel by enabling shared planning, task assignment, and discussion.

## Key Performance Indicators (KPIs)
- **Role-Based Access**: Manage Owner, Collaborator, and Viewer roles.
- **Sharing**: Invite travel companions to join a trip.
- **Task Management**: Assign planning items with status tracking.
- **Comments**: Threaded discussions on itinerary items.

## 🗄️ Domain Layer (C# Entities)

### TripMember
Links users to trips with specific permissions.
```csharp
public class TripMember
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public Guid UserId { get; set; }
    public MemberRole Role { get; set; } // Owner, Contributor, Viewer
}
```

### TripTask
Collaborative planning items.
```csharp
public class TripTask
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public TaskStatus Status { get; set; } // ToDo, Doing, Done
    public Guid? AssignedToUserId { get; set; }
}
```

## 🏗️ Technical Implementation

### Permissions Strategy
- **Authorized Viewers**: Only trip members can access the `/trips/:id` routes.
- **Action Guards**: UI components hide edit/delete buttons based on the user's `MemberRole`.

### Frontend Integration
- **Collaboration Drawer**: Shared task board and member list.
- **Real-time Notifications**: (Planned) SignalR integration for instant update alerts.

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/trips/{tripId}/members` | Invite a new companion |
| `GET` | `/api/trips/{tripId}/tasks` | Fetch the task board |
| `PATCH` | `/api/tasks/{id}/status` | Update task progress |
| `POST` | `/api/comments` | Add a comment to an activity |

## 🛡️ Security Rules
- Only **Owners** can invite or remove members.
- **Viewers** cannot create tasks or edit the itinerary.
- Tasks can only be deleted by the **Owner** or the **Assignee**.
