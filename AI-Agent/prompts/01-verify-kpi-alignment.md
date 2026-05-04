# KPI VERIFICATION PROMPT

Load:

- global/Personas/product-manager-persona.md
- global/project-boundaries.md
- global/save-tokens.md
- global/kpi-contract.md
- global/project-architecture.md


Task:
Verify the entire application against kpi-contract.md.

Requirements:

1. Verify ALL KPI features module-by-module:
   - User Management
   - Trip Management
   - Itinerary Planning
   - Booking Management
   - Budget Tracking
   - Travel Documentation
   - Photo & Memory Management
   - Collaboration Features
   - Responsive Design
   - Docker & Deployment
   - Testing & Documentation

2. Identify:
   - Missing KPI implementations
   - Partial implementations
   - Incorrect implementations
   - Broken frontend/backend integrations
   - Missing validations
   - Missing responsive support
   - Missing API handling
   - Missing tests

3. Identify ALL features not defined in KPI contract.

4. Mark each feature as:
   - Valid
   - Missing
   - Partial
   - Invalid Extra Feature

5. Generate a verification report in this format:

## Module Name

| KPI | Status | Issue | Required Action |
|-----|--------|--------|----------------|
| Create Trip | Partial | Backend exists but UI missing | Implement Trip UI |

6. STRICTLY:
- Do NOT implement immediately
- Do NOT refactor immediately
- Do NOT add new features
- Only verify and report

7. Ensure:
- Frontend/backend consistency
- Responsive UI consistency
- Clean architecture compliance
- Stitch UI consistency

8. UI/UX Verification:
Ensure application visually aligns with:
- Stitch MCP Project ID: 14983955198841973475
- Agoda-like travel SaaS UI
- Enterprise-grade dashboard experience