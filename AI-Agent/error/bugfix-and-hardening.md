# ENTERPRISE BUG FIX + FEATURE COMPLETION + UI/UX HARDENING PROMPT

Act as a world-class:

- Senior .NET 8 Clean Architecture Architect
- Senior React + TypeScript Engineer
- Enterprise SaaS UI/UX Engineer
- Microsoft SQL Server + Entity Framework Core + Database Engineer
- QA Automation Lead
- RBAC/Security Engineer
- Enterprise Product Engineer

Your task is to thoroughly analyze, fix, enhance, stabilize, and complete my Travel Itinerary Planner application WITHOUT breaking existing working functionality.

---

# CORE OBJECTIVE

Implementation is mostly completed successfully.

However:
- several features/buttons are broken
- some APIs are failing
- some UI/UX areas are incomplete
- some modals/forms are missing
- some enterprise-grade functionality is incomplete
- some pages feel static or non-interactive
- some screens lack premium SaaS UX polish

Your task is to:
1. Deeply analyze ALL mentioned screens/features
2. Fix ALL broken features
3. Fix ALL backend/frontend integration issues
4. Add missing enterprise-grade functionality
5. Improve UI/UX consistency
6. Add premium responsive interactions
7. Preserve ALL existing working functionality
8. Avoid regressions
9. Keep architecture maintainable
10. Ensure KPI alignment

---

# TECH STACK

Frontend:
- React + TypeScript

Backend:
- .NET 8 Clean Architecture
- Service + Repository Pattern

Database:
- Microsoft SQL Server + EF Core

Authentication:
- JWT + bcrypt

Architecture Rules:
- DO NOT use CQRS
- DO NOT use MediatR
- DO NOT overengineer
- Keep architecture modular and maintainable

---

# UI/UX REFERENCE

Reference UI:
Stitch MCP Project ID:
14983955198841973475

Reference products:
- Agoda
- MakeMyTrip
- Thomas Cook

Design Requirements:
- Enterprise-grade SaaS UI
- Premium responsive layouts
- Modern spacing system
- Soft shadows
- Smooth transitions
- Professional modal system
- Elegant dropdowns
- Responsive cards/tables
- Premium forms
- Mobile-friendly interactions

Animations:
- subtle hover effects
- smooth modal transitions
- skeleton loading
- smooth sidebar transitions
- smooth dropdown animations

Avoid:
- flashy animation
- inconsistent spacing
- broken layouts
- laggy transitions

---

# CRITICAL RULES

1. DO NOT break existing working functionality
2. DO NOT remove existing KPIs
3. DO NOT add random unrelated features
4. DO NOT redesign entire application unnecessarily
5. DO NOT generate placeholder implementations
6. Ensure backend/frontend consistency
7. Ensure proper API error handling
8. Ensure responsive behavior
9. Ensure enterprise-grade UX polish
10. Ensure ALL mentioned features fully work

---

# IMPLEMENTATION TASKS

---

# 1. AUTH MODULE

## SIGNIN SCREEN

Add:
- "Forgot Password" feature

Requirements:
- proper forgot password form
- email validation
- token/reset flow
- success/error states
- enterprise-grade UX
- responsive UI

---

# FORGOT PASSWORD SCREEN

Screen:
http://localhost/forgot-password

Requirements:
- redesign UI professionally
- premium enterprise SaaS design
- responsive layout
- proper validation states
- loading states
- success/error feedback
- smooth animations

---

# 2. TRIP DETAILS SCREEN

Screen:
http://localhost/trip/{tripId}

Fix:

## EXPORT MANIFEST
Currently:
- button performs no action

Implement:
- enterprise-grade export functionality
- export trip details
- export itinerary summary
- export logistics/budget summary
- proper download handling
- loading states
- error handling

## MANAGE ALL
Currently:
- no action

Implement:
- proper trip management modal/page
- centralized management UI
- quick actions
- enterprise dashboard interaction

## REVIEW TRIP ASSURANCE
Currently:
- no action

Implement:
- trip validation/review workflow
- checklist review
- readiness indicators
- warnings for incomplete sections
- enterprise-grade assurance UI

---

# 3. SCHEDULE SCREEN

Screen:
http://localhost/trip/{tripId}/schedule

---

## TIMELINE GRAPH TOO LARGE

Fix:
- make graph compact
- responsive timeline
- cleaner layout
- show limited visible activities
- add:
  - "View More"
  - expandable timeline
- preserve enterprise look and feel

---

## SHARE PROJECT BUTTON

Currently:
- no action

Implement:
- trip sharing modal
- collaborator invite flow
- copy/share link
- permission selection
- loading/error states

---

## EXPORT PDF BUTTON

Currently:
- no action

Implement:
- export schedule as PDF
- proper formatting
- enterprise report layout
- include activities/timeline
- proper loading states

---

## GALLERY PHOTO ZOOM

Current:
- photo visible only

Implement:
- image modal preview
- zoom support
- fullscreen preview
- image download option
- responsive modal
- smooth transitions

---

## NETWORK → PLANNING CHECKLIST → SAVE TASK

Current API Error:
400 Validation Failed:
Description required

Fix:
- frontend validation
- backend validation consistency
- ensure Description sent correctly
- proper DTO mapping
- proper form handling
- proper error feedback

---

## GROUP EXPENSES WHITE SCREEN

Current Error:
TypeError: t.map is not a function

Fix:
- analyze API response
- fix data mapping
- add defensive rendering
- prevent runtime crashes
- add proper empty states
- improve error handling

---

# 4. LOGISTICS SCREEN

Screen:
http://localhost/trip/{tripId}/logistics

---

## CALENDAR SYNC BUTTON

Currently:
- no action

Implement:
- enterprise-grade calendar sync workflow
- downloadable calendar event support
- proper modal/action flow
- success/error handling

---

## ACCOMMODATION/FLIGHT CARD DROPDOWN

Current:
- poor UI dropdown

Fix:
- redesign dropdown UI
- premium contextual menu
- proper animations
- responsive interactions
- improve spacing/icons
- improve usability

Actions:
- Add Document
- Archive
- Delete

---

# 5. BUDGET SCREEN

Screen:
http://localhost/trip/{tripId}/budget

---

## DOWNLOAD TRIP AUDIT

Currently:
- no action

Implement:
- downloadable audit report
- budget summary export
- expense analytics export
- enterprise-grade PDF/report

---

## STATIC EMPTY STATE

Current:
"No active fiscal accounts..."

Fix:
- dynamic empty state
- actionable CTA
- onboarding guidance
- responsive enterprise design
- contextual budget suggestions

---

# 6. COLLABORATION SCREEN

Screen:
http://localhost/trip/{tripId}/collaboration

---

## DISCUSSION MESSAGE NOT SHOWING

Current:
Only user icon/time visible

Fix:
- fix message rendering
- fix frontend mapping
- fix API binding if needed
- proper chat UI rendering
- preserve timestamps/user info

---

## TASKS → NEW TASK BUTTON

Currently:
- no action

Implement:
- task creation modal
- validations
- assignee selection
- due date
- status tracking
- proper save flow
- responsive UX

---

# 7. VAULT SCREEN

Screen:
http://localhost/trip/{tripId}/vault

---

## DOCUMENTS → UPLOAD DOC

Currently:
- no action

Implement:
- document upload workflow
- file validation
- upload progress
- document preview
- download/delete support
- proper backend integration

---

## CONTACTS → ADD CONTACT

Currently:
- no action

Implement:
- contact modal form
- CRUD flow
- validation
- responsive UI

---

## LOCAL INFO → ADD NOTE

Currently:
- no action

Implement:
- note modal
- add/edit/delete note flow
- validation
- proper storage
- responsive interactions

---

# 8. PROFILE SCREEN

Screen:
http://localhost/profile

---

## ADD PASSPORT DETAILS

Currently:
- broken

Implement:
- passport modal form
- add/update workflow
- upload passport document
- validation
- responsive modal

---

## CHANGE PASSWORD

Currently:
- no action

Implement:
- secure change password modal/form
- validation
- JWT/session handling
- success/error states

---

## PRIVACY BUTTON

Currently:
- broken

Implement:
- privacy preferences modal/page
- configurable user privacy settings
- enterprise-grade UX

---

## CONFIGURE/SET PREFERENCES

Currently:
- no action

Implement:
- travel preferences configuration
- categories/preferences
- save/update workflow
- responsive UX

---

## CONTACT SUPPORT

Currently:
- no action

Implement:
- support modal/form
- support request submission
- validation
- success/error states

---

# 9. RBAC + ADMIN IMPLEMENTATION

Implement enterprise-grade RBAC.

Add:
- Admin role
- proper permission handling
- route protection
- feature protection
- admin preferences/settings

Admin Features:
- user oversight
- trip moderation capabilities
- access management
- system preference controls
- role assignment
- KPI-safe administration tools only

Requirements:
- responsive admin UI
- premium SaaS dashboard feel
- secure authorization
- maintainable architecture

DO NOT:
- add bloated admin panel
- add unrelated analytics
- add unnecessary complexity

---

# BACKEND REQUIREMENTS

Fix and improve:
- API validation
- DTO mapping
- Exception handling
- Authorization
- File upload handling
- Response consistency
- Swagger documentation
- Database integrity
- Logging
- Error handling

Ensure:
- Clean Architecture maintained
- Service + Repository maintained
- no duplicate logic
- no dead code

---

# FRONTEND REQUIREMENTS

Fix and improve:
- API integration issues
- broken buttons
- modal systems
- dropdowns
- responsive layouts
- runtime crashes
- validation handling
- empty states
- loading states
- accessibility

Ensure:
- reusable components
- reusable modals
- reusable form handling
- reusable dropdown system

---

# TESTING REQUIREMENTS

After ALL fixes:

Run:
- frontend tests
- backend tests
- integration tests
- responsive tests
- validation tests
- RBAC tests

Verify:
- all buttons functional
- all modals functional
- all API integrations functional
- no console runtime errors
- no white screens
- no broken forms

---

# FINAL OUTPUT

Generate:

1. Fixed Issues Summary
2. Newly Implemented Features
3. UI/UX Improvements
4. Backend Improvements
5. Frontend Improvements
6. RBAC Improvements
7. Responsive Improvements
8. Remaining Risks
9. Updated Test Results

Ensure:
- enterprise-grade quality
- KPI compliance
- responsive UX
- maintainable architecture
- production-ready behavior