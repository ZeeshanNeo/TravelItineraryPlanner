# Booking Management Module Plan

## Overview
The Booking Management module enables users to store and manage travel bookings across four categories: Flights, Accommodation, Transportation, and Activities. Each booking can have associated documents (confirmation emails, tickets, receipts) and is linked to a Trip and optionally to an Activity. The module follows .NET 8 Clean Architecture with Service + Repository pattern, using React + TypeScript frontend.

## KPIs Covered
From the global KPI contract:
- Flight Details: Store airline, flight numbers, times, and confirmation codes
- Accommodation: Track hotel/reservation details and check-in/out times
- Transportation: Record rental car, train, or other transportation bookings
- Activity Bookings: Store tour reservations, event tickets, and activity bookings
- Document Storage: Upload confirmation emails and booking documents

## Database Schema

### Booking Entity
```sql
CREATE TABLE Bookings (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    TripId UNIQUEIDENTIFIER NOT NULL,
    ActivityId UNIQUEIDENTIFIER NULL, -- Optional link to Activity
    Category NVARCHAR(20) NOT NULL, -- 'Flight', 'Accommodation', 'Transportation', 'Activity'
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(2000) NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Cancelled', 'Completed'
    StartDate DATETIME2 NULL,
    EndDate DATETIME2 NULL,
    TimeZone NVARCHAR(50) NULL,
    Location NVARCHAR(200) NULL,
    Address NVARCHAR(500) NULL,
    Provider NVARCHAR(100) NULL, -- e.g., 'Air France', 'Hilton'
    ConfirmationCode NVARCHAR(100) NULL,
    Cost DECIMAL(18,2) NULL,
    Currency NVARCHAR(3) NULL,
    Notes NVARCHAR(2000) NULL,
    ContactInfo NVARCHAR(500) NULL,
    IsArchived BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (TripId) REFERENCES Trips(Id) ON DELETE CASCADE,
    FOREIGN KEY (ActivityId) REFERENCES Activities(Id) ON DELETE SET NULL
);
```

### BookingDocument Entity
```sql
CREATE TABLE BookingDocuments (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    BookingId UNIQUEIDENTIFIER NOT NULL,
    FileName NVARCHAR(255) NOT NULL,
    FilePath NVARCHAR(500) NOT NULL, -- Relative path within uploads directory
    FileSize BIGINT NOT NULL,
    MimeType NVARCHAR(100) NOT NULL,
    UploadedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (BookingId) REFERENCES Bookings(Id) ON DELETE CASCADE
);
```

### Relationships
- **Booking → Trip**: Many-to-One (Each booking belongs to a single trip)
- **Booking → Activity**: Optional One-to-One (A booking can be linked to an activity for scheduling)
- **Booking → BookingDocument**: One-to-Many (A booking can have multiple documents)

## File Storage Architecture
- **Storage Location**: Local filesystem under `uploads/bookings/{bookingId}/`
- **File Naming**: `{Guid}.{extension}` to avoid collisions
- **Size Limit**: 10 MB per file
- **Allowed Types**: PDF, PNG, JPEG, JPG, DOC, DOCX
- **Security**: Files served via authenticated API endpoints; direct access restricted
- **Backup**: Files included in regular backups; consider cloud storage for production

## Backend Architecture

### Domain Layer
- **Entities**: `Booking`, `BookingDocument`
- **Enums**: `BookingCategory`, `BookingStatus`
- **Interfaces**: `IBookingRepository`, `IBookingDocumentRepository`

### Application Layer
- **DTOs**: 
  - `BookingRequest` (Create/Update)
  - `BookingResponse`
  - `BookingDocumentResponse`
- **Services**: `IBookingService`, `IBookingDocumentService`
- **Validators**: `CreateBookingRequestValidator`, `UpdateBookingRequestValidator` using FluentValidation

### Infrastructure Layer
- **Repositories**: `BookingRepository`, `BookingDocumentRepository` (EF Core)
- **Services**: `BookingService`, `BookingDocumentService` (implements application interfaces)
- **File Storage Service**: `LocalFileStorageService` handling upload/download/delete

### API Layer
- **Controller**: `BookingsController` with CRUD endpoints
- **Controller**: `BookingDocumentsController` for file operations
- **Authentication**: JWT required for all endpoints
- **Authorization**: User can only access bookings for their own trips

## Frontend Architecture

### Pages
- **Bookings Page** (`/bookings`): Existing page enhanced with real data
- **Booking Detail Page** (`/bookings/:id`): View/edit booking with documents
- **Create/Edit Booking Modal**: Reusable modal for adding/editing bookings

### Components
- `BookingCard`: Display booking with status, dates, provider
- `BookingForm`: Form for creating/editing bookings with category-specific fields
- `DocumentUpload`: Drag‑and‑drop file upload with preview
- `BookingFilters`: Filter by category, status, trip

### Services
- `booking.service.ts`: API calls for booking CRUD
- `bookingDocument.service.ts`: API calls for document upload/download
- React Query hooks for caching and state management

### State Management
- Use React Query (`useQuery`, `useMutation`) for server state
- Local state for forms and filters

## API Endpoints

### Bookings
- `GET /api/bookings` – List bookings (filter by trip, category, status) or get a single booking if `id` query parameter is provided
- `POST /api/bookings` – Create a new booking
- `PUT /api/bookings/{id}` – Update booking
- `DELETE /api/bookings/{id}` – Delete booking (soft delete via archive)
- `GET /api/trips/{tripId}/bookings` – Get bookings for a specific trip

### Booking Documents
- `GET /api/bookings/{bookingId}/documents` – List documents for a booking
- `POST /api/bookings/{bookingId}/documents` – Upload a document (multipart/form-data)
- `GET /api/bookings/{bookingId}/documents/{documentId}` – Download document
- `DELETE /api/bookings/{bookingId}/documents/{documentId}` – Delete document

## Validation Requirements

### Booking Validation
- **Category**: Must be one of: Flight, Accommodation, Transportation, Activity
- **Title**: Required, max 200 characters
- **TripId**: Required, must exist and belong to current user
- **StartDate/EndDate**: If provided, EndDate must be ≥ StartDate
- **ConfirmationCode**: Unique per provider? (optional)
- **Cost**: If provided, must be ≥ 0
- **Currency**: Must be valid ISO 4213 code if cost provided

### Document Validation
- **File size**: ≤ 10 MB
- **File type**: Allowed MIME types
- **BookingId**: Must exist and belong to current user

## Acceptance Criteria

### User Story 1: Create a Flight Booking
- Given I am on a trip detail page
- When I click "Add Booking" and select "Flight"
- Then I see a form with fields: airline, flight number, departure/arrival times, confirmation code
- When I fill the form and submit
- Then the booking is saved and appears in the bookings list

### User Story 2: Upload Booking Document
- Given I have a booking
- When I click "Upload Document" and select a PDF file
- Then the file is uploaded and appears under the booking
- And I can download the file later

### User Story 3: Filter Bookings by Category
- Given I have multiple bookings across categories
- When I select "Flights" filter
- Then only flight bookings are displayed

### User Story 4: Update Booking Status
- Given I have a pending booking
- When I change its status to "Confirmed"
- Then the booking card updates to show confirmed status visually

### User Story 5: Link Booking to Activity
- Given I have an activity in my itinerary
- When I create a booking and select that activity
- Then the booking is linked and appears in the activity details

## Edge Cases
1. **Duplicate Confirmation Codes**: Allow duplicates across different providers but warn user.
2. **Overlapping Dates**: For accommodation, detect overlapping bookings at same location? (optional)
3. **File Upload Failures**: Handle network interruptions, show retry option.
4. **Large File Uploads**: Implement chunked uploads for files > 10 MB? (future)
5. **Currency Conversion**: If cost in different currency, store original; conversion for reporting later.
6. **Deleted Trip**: Cascade delete bookings (or archive them).
7. **Offline Scenario**: Frontend can store pending bookings locally and sync when online.

## Implementation Steps

### Phase 1: Backend Foundation
1. Create Domain entities and enums
2. Add EF Core configurations and migrations
3. Implement repositories and services
4. Create API controllers with basic CRUD
5. Add validation and error handling

### Phase 2: Frontend Integration
1. Create booking service and React Query hooks
2. Update Bookings page to fetch real data
3. Implement BookingCard and BookingForm components
4. Add document upload component
5. Connect filters and sorting

### Phase 3: Enhanced Features
1. Implement notifications for booking status changes (email/in‑app)
2. Add calendar sync (iCal export)
3. Implement bulk import from email (stretch)
4. Add reporting for booking costs

### Phase 4: Testing & Polish
1. Write unit tests for services and validators
2. Write integration tests for API endpoints
3. Write frontend component tests
4. Perform user acceptance testing
5. Optimize performance (pagination, lazy loading)

## Dependencies
- **Backend**: .NET 8, EF Core, FluentValidation, Azure Storage Blob (optional)
- **Frontend**: React, TypeScript, React Query, Tailwind CSS, Lucide Icons
- **Database**: Microsoft SQL Server

## Success Metrics
- All KPIs from global contract satisfied
- Users can store and retrieve bookings with documents
- System handles at least 10,000 bookings per user
- File uploads work reliably up to 10 MB
- Mobile‑responsive UI with touch‑friendly controls

## Open Questions
1. Should we support recurring bookings (e.g., weekly car rental)?
2. Should we integrate with external booking APIs (Google Travel, Airbnb)?
3. Should we add a "check‑in reminder" feature?

---

*This plan aligns with the global project boundaries, personas, and architecture. It will be executed in the Code mode following the Service + Repository pattern without CQRS.*