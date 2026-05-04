# Travel Documentation Module Plan

## Overview
The Travel Documentation module is responsible for managing all essential non-itinerary information for a trip, including packing lists, pre-travel checklists, emergency contacts, digital document storage, and local destination information.

## 1. Domain Entities

### Packing List
- `PackingList` (Entity)
  - `Id`: Guid
  - `TripId`: Guid
  - `Title`: string
  - `Category`: string (e.g., Clothing, Gear, Documents)
  - `Items`: List<PackingItem>
- `PackingItem` (Owned Entity or separate table)
  - `Id`: Guid
  - `Name`: string
  - `Quantity`: int
  - `IsPacked`: bool

### Checklist System
- `TravelChecklist` (Entity)
  - `Id`: Guid
  - `TripId`: Guid
  - `Title`: string (e.g., Visa Requirements, Health & Vaccinations)
  - `Items`: List<ChecklistItem>
- `ChecklistItem`
  - `Id`: Guid
  - `Task`: string
  - `IsCompleted`: bool
  - `DueDate`: DateTime?

### Emergency Contacts
- `EmergencyContact` (Entity)
  - `Id`: Guid
  - `TripId`: Guid
  - `Name`: string
  - `Relationship`: string
  - `PhoneNumber`: string
  - `Email`: string
  - `IsLocal`: bool (e.g., local embassy vs. home contact)
  - `Notes`: string

### Digital Document Vault
- `TravelDocument` (Entity)
  - `Id`: Guid
  - `TripId`: Guid
  - `Title`: string
  - `DocumentType`: enum (Passport, Visa, Insurance, ID, Other)
  - `FileName`: string
  - `FilePath`: string
  - `UploadDate`: DateTime

### Local Information
- `LocalInfoNote` (Entity)
  - `Id`: Guid
  - `TripId`: Guid
  - `Title`: string
  - `Category`: enum (Customs, Phrases, EmergencyProcedures, Transport, Other)
  - `Content`: string (Markdown supported)

## 2. Infrastructure Layer

### Persistence
- Update `ApplicationDbContext` with new DbSets.
- Configure relationships (Cascade Delete with Trip).

### Repositories
- `IPackingListRepository`
- `IChecklistRepository`
- `IEmergencyContactRepository`
- `ITravelDocumentRepository`
- `ILocalInfoRepository`

### Services
- `IFileStorageService` (Already exists, but ensure it handles Document Vault uploads).

## 3. Application Layer

### Services
- `ITravelDocService`: Orchestrates all documentation operations.
- `IFileService`: Specific handling for document uploads/downloads.

### DTOs
- `PackingListDto`, `PackingItemDto`
- `ChecklistDto`, `ChecklistItemDto`
- `EmergencyContactDto`
- `TravelDocumentDto`
- `LocalInfoNoteDto`

## 4. API Layer

### Controllers
- `TravelDocsController`:
  - `GET /api/trips/{tripId}/packing-lists`
  - `POST /api/trips/{tripId}/packing-lists`
  - `PUT /api/packing-lists/{id}`
  - `DELETE /api/packing-lists/{id}`
  - `GET /api/trips/{tripId}/checklists`
  - `POST /api/trips/{tripId}/checklists`
  - `GET /api/trips/{tripId}/contacts`
  - `POST /api/trips/{tripId}/contacts`
  - `GET /api/trips/{tripId}/documents`
  - `POST /api/trips/{tripId}/documents` (Multipart upload)
  - `GET /api/documents/{id}/download`
  - `GET /api/trips/{tripId}/local-info`
  - `POST /api/trips/{tripId}/local-info`

## 5. Frontend Layer

### Services
- `travelDoc.service.ts`: API interaction.

### Components
- `TravelDocModule`: Main container within Itinerary Detail page.
- `PackingListManager`: Categorized packing items with progress tracking.
- `ChecklistSystem`: Task-based pre-travel items.
- `ContactList`: Emergency contact cards.
- `DocumentVault`: File upload area and document list with preview/download.
- `LocalInfoNotes`: Markdown editor/viewer for local info.

## 6. Acceptance Criteria
- [ ] Users can create multiple packing lists per trip.
- [ ] Packing progress is visually indicated.
- [ ] Checklist items can be marked as complete.
- [ ] Emergency contacts can be added with phone/email details.
- [ ] PDF/Image documents can be uploaded and retrieved.
- [ ] Local information notes support markdown formatting.
- [ ] All data is correctly scoped to the specific trip and user.
- [ ] UI is responsive and follows the Horizon Glass design system.
