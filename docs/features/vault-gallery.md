# Module: Digital Vault & Memory Gallery

## Overview
A dual-purpose module for managing critical travel documentation (Vault) and preserving personal trip memories (Gallery).

## 🛡️ Digital Document Vault
Manages essential non-itinerary information.
- **Document Categories**: Passport, Visa, Insurance, ID, Bookings.
- **Packing Lists**: Trip-specific checklists with progress tracking.
- **Checklist System**: Pre-travel tasks (e.g., "Check Visa requirements").
- **Emergency Contacts**: Local embassy and home contact details.

### Domain Entities
- `PackingList` & `PackingItem`
- `TravelChecklist` & `ChecklistItem`
- `EmergencyContact` (Name, Relationship, Phone, IsLocal)
- `TravelDocument` (Title, Type, FilePath)

## 📸 Memory Gallery
The storytelling engine of Voyager Pro.
- **Memory Timeline**: Chronological view of photos and journal entries.
- **Photo Upload**: Multi-photo upload with tagging.
- **Journal Editor**: Markdown-supported rich text for daily entries.

### Domain Entities
- `TravelMemory`: Base entity.
- `MemoryPhoto`: File path, tags, and location.
- `JournalEntry`: Content and title.
- `MemoryTag`: Many-to-Many tagging system.

## 🏗️ Technical Implementation

### File Storage Service
- **Provider**: `LocalFileStorageService` (implements `IFileStorageService`).
- **Security**: Access restricted to authenticated trip members.
- **Organization**: Folders categorized by `TripId` and module (`Vault` vs `Gallery`).

### Frontend Strategy
- **Masonry Layout**: Adaptive grid for photo galleries.
- **Rich Text**: Lightweight editor for journal entries.
- **PWA Caching**: Documents in the Vault are cached for offline access.

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/memories/upload` | Add photos to the gallery |
| `GET` | `/api/vault/documents` | List stored tickets/passports |
| `POST` | `/api/packing-lists` | Create a new packing list |
| `GET` | `/api/memories/timeline` | Fetch combined photos/journals |
