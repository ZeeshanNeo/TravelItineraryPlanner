# Module 08: Collaboration Features Implementation Plan

## Objective
Implement features that allow users to share trips, collaborate on planning, and manage group expenses and tasks.

## Backend Implementation

### 1. Domain Entities (`Domain/Entities/`)
- `TripMember`: Links Users to Trips with roles (Owner, Collaborator, Viewer).
- `Comment`: Associated with Itinerary Items or Trips.
- `TripTask`: Planning tasks that can be assigned to members.
- `GroupExpenseSplit`: For tracking who owes what in shared expenses.

### 2. Repositories (`Domain/Interfaces/` & `Infrastructure/Data/Repositories/`)
- `ITripMemberRepository`: Manages trip invitations and roles.
- `ICommentRepository`: CRUD for comments.
- `ITaskRepository`: CRUD for trip tasks.
- `IExpenseSplitRepository`: Handles expense division logic.

### 3. Application Services (`Application/Services/`)
- `ICollaborationService`: Manages sharing, permissions, and task assignments.
- `ICommentService`: Handles the comment system logic.

### 4. API Layer (`API/Controllers/`)
- `CollaborationController`: Sharing and member management.
- `CommentsController`: Threaded discussion endpoints.
- `TasksController`: Task management endpoints.

## Frontend Implementation

### 1. UI Components (`frontend/src/components/collaboration/`)
- `CollaborationModule`: Main hub for trip sharing and members.
- `MemberList`: Display and manage trip participants.
- `ShareTripModal`: Invite users by email and set roles.
- `CommentThread`: Inline discussion for itinerary items.
- `TaskManager`: Task board for trip planning.
- `GroupExpenseManager`: Splitting logic and balance overview.

### 2. Service Layer (`frontend/src/services/`)
- `collaboration.service.ts`: API client for all collaboration features.

## Key Features to Implement
- **Trip Sharing**: Invite users by email; check if user exists or send placeholder.
- **RBAC**: Owners can delete; Collaborators can edit; Viewers only read.
- **Task Assignment**: Assign status (To Do, Doing, Done) and owner to tasks.
- **Shared Expenses**: Multi-payer support with automated balance calculation.

## Acceptance Criteria
- Users can invite others to a trip via email.
- Permissions are strictly enforced on both frontend and backend.
- Comments appear in real-time (or near real-time via polling/refresh).
- Shared expenses correctly calculate "who owes whom".
