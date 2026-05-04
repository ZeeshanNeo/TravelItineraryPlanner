# Module Test Cases

## Auth Module
- **Sign In / Registration Flow**: `PASS` 
  - Verified JWT token storage and backend cookie generation.
  - Successfully redirected to Dashboard upon successful login.
- **Logout Flow**: `PASS`
  - Fixed caching issue in `<ProtectedRoute>`. Session terminates correctly and redirects to `/login`.
  - Clears `access_token` from `localStorage` successfully.

## Trip Management Module
- **Trip Creation UI (PlanTrip)**: `PASS`
  - Validated multi-step wizard (Destination, Preferences, Collaborators).
  - Validated dynamic UI state updates and API request payload formatting.
- **Dashboard Trip Loading**: `PASS`
  - Integrated `tripService` to fetch trips dynamically.
  - Handled loading states and fallback UI (empty states).
- **Edit Trip**: `PASS`
  - Implemented `EditTripModal` component.
  - Validated updating Title, Destination, Dates, Travel Type, and Notes.
- **Archive & Delete Trip**: `PASS`
  - Added direct action buttons on the trip cards in the dashboard.
  - Validated toggling archive status and soft/hard deletes based on the API.
- **Backend API Validation (`/api/trips`)**: `PASS`
  - Resolved 500 Internal Server Error by generating Entity Framework Core migrations and creating the `Trips` table in the database.
  - Restarted the .NET backend process. All CRUD endpoints are fully functional.

---
*Last tested on: 2026-05-02*
