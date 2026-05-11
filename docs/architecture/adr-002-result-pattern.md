# ADR 002: Use of the Result Pattern for Service Responses

## Status
Accepted (May 2026 Refactor)

## Context
The application previously used `try-catch` blocks and standard exceptions (e.g., `KeyNotFoundException`) to handle business logic outcomes like missing resources. This resulted in:
1.  **Performance Overhead**: Exception throwing is expensive in .NET.
2.  **Brittle API**: The API layer had to know exactly which exceptions each service might throw to return correct HTTP codes.
3.  **Vague Errors**: Harder to return multiple validation errors or granular failure messages.

## Decision
We will use a generic `Result<T>` and non-generic `Result` wrapper for all service-level operations.

## Rationale
- **Explicitness**: Method signatures clearly indicate they can fail.
- **Performance**: Returns a simple object instead of unwinding the stack.
- **Uniformity**: The API can handle all service failures in a single middleware or base controller logic.

## Consequences
- Service methods are now wrapped in `Task<Result<T>>`.
- Controllers must check `result.IsSuccess` before returning data.
