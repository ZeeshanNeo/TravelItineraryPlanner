# Contributing to Voyager Pro

Thank you for your interest in contributing! This guide outlines the standards and processes for working on the Voyager Pro codebase.

## 🛠️ Development Setup

Please refer to the **[Development Guide](DEVELOPMENT.md)** for detailed instructions on setting up your local environment.

## 📜 Coding Standards

### Backend (.NET)
- **Clean Architecture**: Respect the boundaries between Domain, Application, Infrastructure, and API layers.
- **Naming**: Use PascalCase for classes, methods, and properties. Use camelCase for private fields (prefixed with `_`).
- **Validation**: Use FluentValidation for all API request DTOs.
- **Error Handling**: Use the **Result Pattern** for service responses (avoid throwing exceptions for expected business logic outcomes).

### Frontend (React)
- **Functional Components**: Use functional components with hooks.
- **Types**: Always define types/interfaces for props and state. Avoid `any`.
- **CSS**: Use Tailwind CSS utility classes. Avoid custom CSS files unless absolutely necessary.
- **State**: Use React Query for server state and Context/Zustand for global client state.

## 🌿 Branching Strategy

- **`main`**: Production-ready code.
- **`develop`**: Integration branch for features.
- **`feature/name`**: Individual feature branches.

## 🧪 Testing Requirements

- All new backend logic must be covered by xUnit tests.
- Critical frontend components should have Vitest tests.
- Run `dotnet test` and `npm run test` before submitting a Pull Request.

## 🏗️ Architectural Standards (May 2026 Refactor)

The project recently underwent a major architectural refactor to improve maintainability. All new code must follow these patterns:

### 1. The Result Pattern
Service methods must return a `Result<T>` or `Result`. Never throw exceptions for non-exceptional outcomes (e.g., "Not Found").
- **Success**: `return Result<T>.Success(value);`
- **Failure**: `return Result<T>.Failure("Error message");`

### 2. Rich Domain Entities
Business logic belongs in the `Domain` project entities, not the service layer.
- **Invariants**: Enforce logic (like date boundaries) in constructors.
- **State Changes**: Use encapsulated methods like `UpdateDetails()` instead of public setters.

### 3. Automated Mapping
Do not write manual mapping code. Use **Mapster**.
- Register new mappings in `Application/Common/Mappings/MappingConfig.cs`.

---

## 💬 Communication

If you have questions, please open an Issue or start a discussion in the project repository.
