# ADR 003: Transition to Rich Domain Model

## Status
Accepted (May 2026 Refactor)

## Context
Initial implementation followed the "Anemic Domain Model" anti-pattern, where entities were simple data bags and all logic resided in the `Infrastructure/Services` layer. This led to "Service-itis," where services became bloated and business rules were often duplicated or bypassed.

## Decision
We will shift business logic and invariant enforcement into the `Domain` entities.

## Rationale
- **Encapsulation**: Entities are responsible for their own valid state.
- **Maintainability**: Centralizes business rules (e.g., date logic, status transitions).
- **Testability**: Logic can be unit tested without mocking repositories or DB contexts.

## Consequences
- Private setters for entity properties.
- Use of constructors and behavior methods (e.g., `UpdateDetails`) for state changes.
- `BaseEntity` used for automatic audit tracking.
