# Implementation Plan: Backend Quality & Architectural Refactoring

## Overview
This plan addresses the critical technical debt and code smells identified in the "Pedantic Review." The goal is to transition the Voyager Pro backend from a "Service-itis" architecture to a robust, Domain-Driven Design (DDD) approach with standardized error handling and mapping.

## User Review Required

> [!IMPORTANT]
> **Breaking Changes**: Switching to the **Result Pattern** will change the method signatures of all service methods. This will require updates across the entire Application and API layers.
> **Dependency Injection**: We will introduce `Mapster` for mapping and `FluentValidation` for request integrity.

## Proposed Changes

### 1. Core Architecture Abstractions
Standardize how the application handles results, errors, and identity.

- [NEW] `Application/Common/Models/Result.cs`: Generic wrapper for success/failure.
- [NEW] `Application/Common/Interfaces/ICurrentUserService.cs`: Abstraction for user identity.
- [MODIFY] `API/Middleware/ExceptionMiddleware.cs`: Update to handle standard result failures.

---

### 2. Domain Layer Refinement (Rich Domain Model)
Move logic out of services and into entities.

- [MODIFY] `Domain/Common/BaseEntity.cs`: Add `CreatedAt`, `UpdatedAt`, and `CreatedBy`.
- [MODIFY] `Domain/Entities/Trip.cs`: Add behavior methods (e.g., `UpdateDetails`, `Archive`) to handle internal state and timestamps.

---

### 3. Application Layer Optimization
Eliminate manual mapping and implement strict validation.

- [NEW] `Application/Common/Mappings/MappingConfig.cs`: Global Mapster configuration.
- [NEW] `Application/Common/Behaviors/ValidationBehavior.cs`: Automatic validation pipe for all requests.
- [MODIFY] `Application/Services/TripService.cs`: 
    - Replace `try-catch` and exceptions with `Result<T>`.
    - Replace manual mapping with `.Adapt<T>()`.
    - Remove manual timestamp management.

---

### 4. API Layer Cleanup
- [MODIFY] `API/Controllers/TripsController.cs`: Remove `GetUserId()` helper; use injected `ICurrentUserService`.

## Post-Implementation Documentation Requirements

After these changes are completed, the following documentation MUST be updated or created to ensure the team follows the new standards:

### 1. New Architecture Decision Records (ADRs)
- `docs/architecture/adr-002-result-pattern.md`: Rationale for avoiding exceptions for control flow.
- `docs/architecture/adr-003-rich-domain-model.md`: Guidelines for placing business logic in entities.

### 2. Coding Standards Updates
- **[CONTRIBUTING.md](file:///c:/learning/Dotnet/Itinerary/TravelItineraryPlanner/CONTRIBUTING.md)**:
    - Add a section on "Using the Result Pattern."
    - Define rules for when to use Mapster vs. manual projection.
- **[DEVELOPMENT.md](file:///c:/learning/Dotnet/Itinerary/TravelItineraryPlanner/DEVELOPMENT.md)**:
    - Document how to add new FluentValidation rules.

### 3. Feature Documentation
- Update **[docs/features/trip-management.md](file:///c:/learning/Dotnet/Itinerary/TravelItineraryPlanner/docs/features/trip-management.md)** to reflect the new API response structures (wrapped in Result objects).

## Verification Plan

### Automated Tests
- `dotnet test`: Ensure all existing tests pass after refactoring.
- New unit tests for the `Result` pattern wrapper and `ValidationBehavior`.

### Manual Verification
- Use Swagger/Postman to verify that 404s are returned as clean JSON responses instead of stack traces.
- Verify that `UpdatedAt` timestamps change automatically on the DB level.
