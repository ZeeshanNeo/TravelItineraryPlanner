# Enterprise Bug Fix & UI/UX Hardening Implementation Plan

This plan outlines the steps to fix existing bugs, complete missing features, and apply enterprise-grade UI/UX hardening to the Travel Itinerary Planner application, as specified in `AI-Agent/error/bugfix-and-hardening.md`.

## User Review Required

> [!IMPORTANT]
> - **RBAC Implementation**: We will introduce an `Admin` role and protect routes/features. This might require a database migration if the `User` entity doesn't have a `Role` property yet.
> - **PDF Export**: We will use libraries like `jsPDF` or `html2canvas` for frontend-based PDF generation to avoid heavy server-side dependencies for now, unless server-side generation is preferred.
> - **Calendar Sync**: Implementation will focus on generating `.ics` files for universal calendar support.

## Proposed Changes

### 1. Auth Module Hardening
- **Forgot Password**: Redesign UI with a professional enterprise SaaS look. Implement full reset flow (request token -> email -> reset form).
- **Backend**: Ensure `PasswordResetToken` entity is used correctly and `EmailService` is functional for sending reset links.

### 2. Trip Details Screen
- **Export Manifest**: Implement action to export trip details, itinerary, and budget summary to a downloadable format (PDF/Excel).
- **Manage All**: Implement a centralized trip management modal or page for quick actions.
- **Trip Assurance**: Add a validation/review workflow with indicators for incomplete trip sections.

### 3. Schedule Screen
- **Timeline Graph**: Refactor to be compact and responsive. Add "View More" for expandable visibility.
- **Share Project**: Implement a sharing modal with collaborator invites and permission settings.
- **Export PDF**: Implement schedule-to-PDF export.
- **Gallery Zoom**: Add image modal with zoom, fullscreen preview, and download options.
- **Fix API Error**: Resolve 400 error in Planning Checklist task saving (ensure `Description` is sent).
- **Fix Runtime Error**: Resolve `TypeError: t.map is not a function` in Group Expenses.

### 4. Logistics & Budget Screen
- **Calendar Sync**: Implement `.ics` file generation and download.
- **Logistics UI**: Redesign dropdowns for Accommodation/Flight cards with "Add Document", "Archive", and "Delete" actions.
- **Budget Audit**: Implement downloadable audit reports.
- **Empty States**: Replace static "No active fiscal accounts" with dynamic, actionable onboarding guidance.

### 5. Collaboration & Vault Screen
- **Discussion Fix**: Resolve message rendering issues where only icons/time are visible.
- **Task Creation**: Implement a full modal for creating tasks with assignees, due dates, and status.
- **Vault Improvements**: 
  - Implement Document upload with progress and preview.
  - Implement Contact CRUD flow.
  - Implement Local Info Note CRUD flow.

### 6. Profile & RBAC
- **Profile Enhancements**:
  - Fix Passport Details form and document upload.
  - Implement Change Password modal.
  - Implement Privacy Preferences and Travel Preferences configuration.
  - Implement Contact Support form.
- **RBAC**:
  - Add `Role` to `User` entity.
  - Implement route protection and feature flags based on roles (Admin vs. User).
  - Create Admin-only management views for user oversight and trip moderation.

---

## Component Breakdown

### [Backend] [MODIFY] [User.cs](file:///c:/Users/user/Desktop/Zeeshan/Vibe%20Coding/Assessment/TravelItineraryPlanner/backend/Domain/Entities/User.cs)
- Add `Role` property (Enum: User, Admin).

### [Backend] [MODIFY] [AuthService.cs](file:///c:/Users/user/Desktop/Zeeshan/Vibe%20Coding/Assessment/TravelItineraryPlanner/backend/Infrastructure/Services/AuthService.cs)
- Update registration to default to `User` role.
- Implement `ForgotPassword` and `ResetPassword` logic.

### [Frontend] [MODIFY] [ForgotPassword.tsx](file:///c:/Users/user/Desktop/Zeeshan/Vibe%20Coding/Assessment/TravelItineraryPlanner/frontend/src/pages/ForgotPassword.tsx)
- Apply "Horizon Glass" aesthetic.
- Improve validation and feedback states.

### [Frontend] [MODIFY] [ItineraryDetail.tsx](file:///c:/Users/user/Desktop/Zeeshan/Vibe%20Coding/Assessment/TravelItineraryPlanner/frontend/src/pages/ItineraryDetail.tsx)
- Implement Export Manifest, Manage All, and Trip Assurance.

### [Frontend] [MODIFY] [Itinerary.tsx](file:///c:/Users/user/Desktop/Zeeshan/Vibe%20Coding/Assessment/TravelItineraryPlanner/frontend/src/pages/Itinerary.tsx)
- Compact timeline fix.
- Implement PDF export and sharing.

---

## Verification Plan

### Automated Tests
- Run `npm test` in frontend.
- Run `dotnet test` in backend.
- Verify API endpoints via `test-api.js` or Swagger.

### Manual Verification
- Test "Forgot Password" flow with a mock email or by checking the database/logs.
- Verify PDF generation and download for manifests and schedules.
- Test responsive behavior on mobile and tablet breakpoints.
- Verify RBAC by logging in with different roles and checking access restrictions.
