# Module: Booking Management

## Overview
A comprehensive system for tracking and managing travel logistics across Flights, Accommodation, Transportation, and Activities.

## Key Performance Indicators (KPIs)
- **Flight Details**: Tracking airlines, flight numbers, and confirmation codes.
- **Accommodation**: Managing hotel reservations and check-in/out times.
- **Transportation**: Recording rental cars, trains, and local transfers.
- **Activity Bookings**: Storing tour tickets and event reservations.
- **Document Storage**: Uploading receipts and confirmation PDFs.

## 🗄️ Database Schema

### Bookings Table
```sql
CREATE TABLE Bookings (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    TripId UNIQUEIDENTIFIER NOT NULL,
    Category NVARCHAR(20) NOT NULL, -- 'Flight', 'Accommodation', etc.
    Title NVARCHAR(200) NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    ConfirmationCode NVARCHAR(100) NULL,
    Cost DECIMAL(18,2) NULL,
    FOREIGN KEY (TripId) REFERENCES Trips(Id) ON DELETE CASCADE
);
```

## 🏗️ Technical Implementation

### File Storage Architecture
- **Location**: Local filesystem under `uploads/bookings/{bookingId}/`.
- **Naming**: GUID-based filenames to prevent collisions.
- **Security**: Files are served via authenticated API streams; direct access is restricted.
- **Limits**: Max file size of 10MB; supports PDF, PNG, and JPEG.

### Frontend Integration
- **Reusable Modals**: Category-specific forms for creating and editing bookings.
- **Document Upload**: Drag-and-drop zone with real-time preview and progress indicators.
- **Filtering**: Advanced UI to filter bookings by status or category.

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/trips/{tripId}/bookings` | List all bookings for a trip |
| `POST` | `/api/bookings` | Create a new booking |
| `POST` | `/api/bookings/{bookingId}/documents` | Upload a confirmation file |
| `GET` | `/api/bookings/{id}/download` | Retrieve a stored document |

## 🧪 Acceptance Criteria
- [ ] Users can link a booking directly to an itinerary activity.
- [ ] Multiple documents can be attached to a single booking.
- [ ] Cost tracking supports multi-currency inputs.
