# Voyager Pro: KPI Compliance Test Suite

This document outlines the comprehensive test cases derived from the [KPI Contract](file:///c:/Users/user/Desktop/Zeeshan/Vibe%20Coding/Assessment/TravelItineraryPlanner/AI-Agent/global/kpi-contract.md). These test cases ensure that the application meets all enterprise standards for travel itinerary planning, budget tracking, and secure deployment.

## 1. User Management (Security & Identity)

| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| USER-01 | Register with a new, unique email and strong password. | Account created, redirected to dashboard, verification token generated. |
| USER-02 | Attempt to register with an already existing email. | Error message: "Email already in use". Registration fails. |
| USER-03 | Log in with valid credentials. | JWT token received, stored in SecureCookie/LocalStorage, redirected to dashboard. |
| USER-04 | Log in with incorrect password. | Access denied, error message displayed. |
| USER-05 | Update Passport details in Profile. | Data persists in DB, visible after refresh, high-contrast UI in modals. |
| USER-06 | Reset password via "Forgot Password" flow. | Email dispatched (mocked/actual), token allows secure update. |
| USER-07 | Session expiry/Logout. | JWT token cleared, all protected routes redirect to /login. |

## 2. Trip Management (Mission Orchestration)

| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| TRIP-01 | Create a new trip (Destination: London, Business, July 2024). | Trip card appears on dashboard with correct metadata. |
| TRIP-02 | Create overlapping trips. | System allows multiple concurrent trips without data collision. |
| TRIP-03 | Edit existing trip dates and companions. | Changes persist and reflect in the Trip Manifest immediately. |
| TRIP-04 | Archive a completed trip. | Trip moves to 'Archived' status, hidden from active view but accessible via filters. |
| TRIP-05 | Delete a trip. | Trip removed from UI and database (soft/hard delete as per policy). |

## 3. Itinerary Planning (Tactical Scheduling)

| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| PLAN-01 | Add a multi-day schedule with at least 5 activities per day. | Daily cards render correctly with time-ordered list. |
| PLAN-02 | Drag and Drop activity from 10:00 AM to 02:00 PM. | Activity reorders, time-allocation graph updates in real-time. |
| PLAN-03 | View Full 24h Grid vs. Compact View. | Toggle works seamlessly, grid aligns with hourly increments. |
| PLAN-04 | Overlap two activities in the same time slot. | Visual warning or collision marker shown in the timeline. |
| PLAN-05 | Activity with travel time calculation (e.g., "30 min transit"). | Transit time correctly rendered and accounted for in the daily block. |

## 4. Booking Management (Logistics Vault)

| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| BOOK-01 | Upload a PDF flight confirmation. | File stored in `/uploads`, accessible via "View Document" button. |
| BOOK-02 | Add Accommodation (Hotel) with check-in/out times. | Dates validate (Check-in < Check-out), appears in Logistics module. |
| BOOK-03 | Edit Booking status to "Confirmed". | Visual indicator (Green badge) appears on the booking card. |
| BOOK-04 | Archive a single ticket/booking. | Ticket remains in vault but is hidden from the main Logistics timeline. |

## 5. Budget Tracking (Financial Intelligence)

| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| BUDG-01 | Initialize fiscal account for a new trip. | "No active fiscal accounts" warning disappears, budget UI active. |
| BUDG-02 | Log expense with currency conversion (USD to EUR). | System applies conversion rate, updates "Actual Spending" vs "Budget". |
| BUDG-03 | Set category budgets (Food: $500, Travel: $2000). | Visual progress bars show % of budget consumed. |
| BUDG-04 | Download Trip Audit Report. | CSV/PDF generated containing all line items and category summaries. |

## 6. Travel Documentation (Secure Vault)

| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| VAULT-01 | Add emergency contact (Local Police/Consulate). | Contact appears in "Local Info" with quick-call/copy functionality. |
| VAULT-02 | Create a packing checklist. | Interactive checkboxes persist state on refresh. |
| VAULT-03 | Upload high-resolution passport scan. | Image displays in Secure Vault with high-contrast visibility. |

## 7. Photo & Memory Management (Gallery)

| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| MEMO-01 | Upload 10+ photos for a specific day. | Grid layout adapts, lazy loading implemented for performance. |
| MEMO-02 | Write a daily journal entry. | Markdown support works, entry pinned to the specific itinerary day. |
| MEMO-03 | View Memory Timeline. | Chronological flow of photos and notes presented in a premium aesthetic. |

## 8. Collaboration Features (Shared Ops)

| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| COLL-01 | Invite a collaborator via email. | Collaborator receives invite, gains "View-only" or "Editor" access. |
| COLL-02 | Post a message in the Discussion thread. | Message appears with "User" name and timestamp (Fix: Message body visible). |
| COLL-03 | Assign a task to a collaborator. | Task appears in "TASKS" submenu, collaborator notified (if implemented). |

## 9. Responsive Design (Agnostic Access)

| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| RESP-01 | View Dashboard on iPhone SE (320px). | Layout stacks, sidebar collapses into a functional hamburger menu. |
| RESP-02 | View Itinerary on iPad (768px). | Two-column layout maintained where appropriate, touch targets ≥ 44px. |
| RESP-03 | Desktop Fullscreen (1920px+). | Layout expands to "Max-width [1600px]" as per `Layout.tsx` constraint. |
| RESP-04 | Offline Mode: View Itinerary without network. | Service Worker/Cache renders previously viewed data. |

## 10. Docker & Deployment (Infrastructure)

| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| DOCK-01 | Run `docker-compose up --build`. | All containers (Frontend, Backend, DB) start and interconnect. |
| DOCK-02 | Restart DB container. | Data persists; trip info remains intact (SQL Volume check). |
| DOCK-03 | Environment Variable Injection. | Backend picks up `ConnectionStrings` from environment variables. |

## 11. Testing & Documentation (Quality Assurance)

| Test Case ID | Description | Expected Result |
|--------------|-------------|-----------------|
| QA-01 | Run `npm run test` (Frontend). | Unit tests for components pass with 80%+ coverage. |
| QA-02 | Access `/swagger` endpoint on backend. | OpenAPI documentation renders correctly for all endpoints. |
| QA-03 | Code Review for Comments. | Core business logic in `Services` and `Controllers` contains XML documentation. |
