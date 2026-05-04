# UI/UX + Maintainability Review Report

## UI Issues
- **Inconsistent Icon Libraries**: The application uses both `lucide-react` (Itinerary, Memories, Collaboration) and `Material Symbols` (Layout/Navbar). This breaks visual consistency.
- **Glassmorphism Variance**: Glass effect opacity and blur values vary across components. The sidebar uses high opacity (`white/80`), while content cards use low opacity (`white/5`), leading to a disjointed dark mode experience.
- **Rounding Inconsistency**: Border-radius values are not standardized. Components use a mix of `rounded-xl`, `rounded-2xl`, `rounded-[2rem]`, and `rounded-[3rem]`, which prevents a cohesive "enterprise-grade" feel.
- **Color Token Divergence**: Ad-hoc color classes (e.g., `text-blue-700`, `text-indigo-600`, `text-amber-400`) are used instead of referencing a central theme configuration.

## UX Issues
- **Suboptimal Error Feedback**: Most service failures (API errors) are only logged to the console. The user does not receive visual feedback or toast notifications when an action fails (e.g., photo upload or debt settlement).
- **Form Validation Gaps**: While `required` fields are present, there is no logic to prevent logical errors like end dates being before start dates until the API returns an error.
- **Empty State Consistency**: While some modules have good empty states (Tasks), others show blank sections or generic "Not found" messages that don't guide the user.
- **Loading State Flash**: Some components flash a "Loading..." text instead of using consistent skeletons or shimmering glass effects defined in the design system.

## Architecture Issues
- **Hardcoded API URLs**: Components like `PhotoGallery.tsx` have hardcoded `http://localhost:5282/` strings for asset loading instead of using environment variables or a shared utility.
- **Component Overload**: `ItineraryDetail.tsx` has grown to over 250 lines, handling too much UI orchestration logic that could be delegated to sub-layout components.
- **Service Import Inconsistency**: `authService` is exported as a named instance, while `itineraryService` and others are default exports. This leads to confusing import patterns across the codebase.
- **Prop Drilling**: Navigation state is being passed through several layers in collaboration modules instead of using a lightweight context or state manager.

## Scalability Risks
- **Image Storage Pathing**: The reliance on local filesystem relative paths (`photo.filePath`) will break if the application scales beyond a single server without an abstraction layer for cloud storage (S3/Azure Blob).
- **Large State Re-renders**: The monolithic `ItineraryDetail` state causes full-page re-renders when switching between tabs or updating a single task.
- **CSS Utility Bloat**: Extensive use of ad-hoc Tailwind arbitrary values (e.g., `rounded-[2rem]`) makes it difficult to maintain a consistent theme or implement a global "shape" change.

## Recommended Fixes
1.  **Standardize Icons**: Migrate all `Material Symbols` in `Layout.tsx` to `lucide-react` for a unified visual language.
2.  **Centralize Constants**: Move the API Base URL to a `.env` file and create a `getAssetUrl` utility to avoid hardcoding.
3.  **Refactor ItineraryDetail**: Extract the "Hero" and "Tab Navigation" into separate components to reduce main page complexity.
4.  **Implement a Toast System**: Add a global notification provider to surface API errors to the user.
5.  **Unify Design Tokens**: Define a set of standard `border-radius` and `backdrop-blur` utilities in `tailwind.config.js` to ensure consistency.
6.  **Normalize Service Exports**: Standardize all services to use the same export pattern (preferably named instances).
