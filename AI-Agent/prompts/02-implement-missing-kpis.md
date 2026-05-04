# IMPLEMENT MISSING KPI FEATURES

Load:

- global/Personas/product-manager-persona.md
- global/project-boundaries.md
- global/save-tokens.md
- global/kpi-contract.md
- global/project-architecture.md
- verification-report.md

Task:
Implement ONLY missing or partial KPI features identified in verification-report.md.

STRICT RULES:

1. ONLY implement:
- Missing KPI features
- Broken KPI flows
- Missing validations
- Missing frontend/backend integrations
- Missing responsive behavior
- Missing tests

2. DO NOT:
- Add extra features
- Refactor unrelated modules
- Redesign entire app
- Add experimental functionality

3. If extra features exist:
- Remove safely
- Ensure no KPI breaks

4. Maintain:
- .NET 8 Clean Architecture
- Service + Repository pattern
- React + TypeScript modular frontend
- Reusable UI components
- Responsive SaaS UI

5. UI/UX Requirements:
Follow:
- Stitch MCP Project ID: 14983955198841973475
- Agoda-inspired layouts
- Modern SaaS dashboard
- Responsive enterprise UI

6. Ensure:
- Mobile responsive
- Tablet responsive
- Desktop responsive
- Accessibility support
- Proper loading/error states

7. Testing:
Update:
- backend-test-status.md
- frontend-test-status.md

8. After implementation:
Generate implementation summary:
- Fixed KPIs
- Removed extra features
- Updated tests
- Remaining risks/issues