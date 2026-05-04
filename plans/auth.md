# User Management Module Plan

## Overview
This plan outlines the implementation of the User Management module for the Travel Itinerary Planner application. The module covers user registration, login, profile management, password reset, and session management as per the KPIs defined in the project contract.

## KPIs Covered
1. **User Registration** – Users can create accounts with email and password
2. **User Login** – Registered users can log in securely
3. **Profile Management** – Users can update travel preferences and passport details
4. **Password Reset** – Users can reset forgotten passwords via email
5. **Session Management** – User sessions are properly maintained and secured

## Acceptance Criteria & Edge Cases

### User Registration
**Acceptance Criteria:**
- User provides email, password, and full name
- Email must be unique and valid format
- Password meets complexity requirements (min 8 chars, uppercase, lowercase, number, special char)
- Upon successful registration, user receives confirmation and can log in
- Email verification optional (can be added later)

**Edge Cases:**
- Duplicate email → return 409 Conflict
- Invalid email format → return 400 Bad Request
- Weak password → return 400 with validation errors
- Network failure → retry mechanism
- Server error → proper error logging and 500 response

### User Login
**Acceptance Criteria:**
- Registered user can log in with email/password
- Returns JWT access token and refresh token stored in httpOnly cookies
- User can access protected routes with valid token
- Failed login attempts are logged and limited (rate limiting)

**Edge Cases:**
- Invalid credentials → return 401 Unauthorized
- Account locked after 5 failed attempts → temporary lockout
- Expired token → auto-refresh via refresh token
- Missing token → redirect to login
- Brute force protection → IP-based throttling

### Profile Management
**Acceptance Criteria:**
- Authenticated user can view their profile
- User can update profile details (full name, travel preferences, passport details)
- Changes persist immediately
- Travel preferences stored as JSON (e.g., preferred airlines, seat preference, dietary restrictions)
- Passport details include number, expiry, country

**Edge Cases:**
- Invalid data (e.g., passport number format) → validation error
- Unauthorized access → 403 Forbidden
- Concurrent updates → optimistic locking or last-write-wins
- Large file uploads (avatar) → size limit and virus scan

### Password Reset
**Acceptance Criteria:**
- User can request password reset via email
- Reset email contains unique token link valid for 1 hour
- User can set new password via token
- Token expires after use or time limit
- Password history prevents reuse of last 3 passwords

**Edge Cases:**
- Invalid/expired token → 400 Bad Request
- Reused token → invalidate previous tokens
- Email not found → still return 200 (security through obscurity)
- Rate limiting → max 3 requests per hour per email
- Email delivery failure → retry queue

### Session Management
**Acceptance Criteria:**
- JWT access token short-lived (15 minutes)
- Refresh token rotation with each use
- Secure httpOnly cookies for token storage
- Logout invalidates both tokens and clears cookies
- Multiple concurrent sessions allowed

**Edge Cases:**
- Token theft → refresh token rotation detects reuse and revokes all tokens
- Cross-site request forgery (CSRF) → anti‑forgery tokens for state‑changing operations
- Browser storage issues → fallback to memory storage
- Session timeout → automatic logout after 7 days of inactivity

## Database Schema

### Tables

#### `Users`
```sql
CREATE TABLE Users (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Email VARCHAR(255) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    TravelPreferences JSONB,
    PassportDetails JSONB,
    EmailVerified BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FailedLoginAttempts INT DEFAULT 0,
    LockedUntil TIMESTAMP WITH TIME ZONE
);
```

#### `RefreshTokens`
```sql
CREATE TABLE RefreshTokens (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId UUID NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    TokenHash VARCHAR(512) NOT NULL,
    ExpiresAt TIMESTAMP WITH TIME ZONE NOT NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    Revoked BOOLEAN DEFAULT FALSE,
    ReplacedByTokenHash VARCHAR(512)
);
```

#### `PasswordResetTokens`
```sql
CREATE TABLE PasswordResetTokens (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserId UUID NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    TokenHash VARCHAR(512) NOT NULL,
    ExpiresAt TIMESTAMP WITH TIME ZONE NOT NULL,
    Used BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Indexes
- `IX_Users_Email` on `Users(Email)`
- `IX_RefreshTokens_UserId` on `RefreshTokens(UserId)`
- `IX_PasswordResetTokens_UserId` on `PasswordResetTokens(UserId)`

## Backend Architecture (Clean Architecture)

### Layer Structure
```
src/
├── Domain/
│   ├── Entities/
│   │   ├── User.cs
│   │   ├── RefreshToken.cs
│   │   └── PasswordResetToken.cs
│   ├── ValueObjects/
│   │   ├── Email.cs
│   │   └── PasswordHash.cs
│   └── Interfaces/
│       ├── IUserRepository.cs
│       ├── IRefreshTokenRepository.cs
│       └── IPasswordResetTokenRepository.cs
├── Application/
│   ├── Features/
│   │   ├── Auth/
│   │   │   ├── Register/
│   │   │   │   ├── RegisterCommand.cs
│   │   │   │   ├── RegisterHandler.cs
│   │   │   │   └── RegisterValidator.cs
│   │   │   ├── Login/
│   │   │   ├── RefreshToken/
│   │   │   ├── Logout/
│   │   │   ├── ForgotPassword/
│   │   │   └── ResetPassword/
│   │   └── Profile/
│   │       ├── GetProfile/
│   │       └── UpdateProfile/
│   ├── Common/
│   │   ├── Interfaces/
│   │   │   ├── ITokenService.cs
│   │   │   └── IEmailService.cs
│   │   └── Behaviors/
│   │       └── ValidationBehavior.cs
│   └── DTOs/
│       ├── Auth/
│       └── Profile/
├── Infrastructure/
│   ├── Data/
│   │   ├── ApplicationDbContext.cs
│   │   ├── Repositories/
│   │   │   ├── UserRepository.cs
│   │   │   ├── RefreshTokenRepository.cs
│   │   │   └── PasswordResetTokenRepository.cs
│   │   └── Migrations/
│   ├── Services/
│   │   ├── TokenService.cs
│   │   ├── EmailService.cs
│   │   └── PasswordHasher.cs
│   └── Configuration/
│       └── JwtSettings.cs
└── API/
    ├── Controllers/
    │   ├── AuthController.cs
    │   └── ProfileController.cs
    ├── Middleware/
    │   ├── ExceptionMiddleware.cs
    │   └── JwtMiddleware.cs
    └── Program.cs
```

### Key Design Decisions
- **Service + Repository pattern** – No CQRS, no MediatR
- **FluentValidation** for request validation
- **Centralized exception handling** via middleware
- **JWT with refresh token rotation** stored in httpOnly cookies
- **bcrypt** for password hashing
- **EF Core** with Microsoft SQL Server provider

## Frontend Architecture (React + TypeScript)

### Folder Structure
```
src/
├── features/
│   └── auth/
│       ├── components/
│       │   ├── LoginForm.tsx
│       │   ├── RegisterForm.tsx
│       │   ├── ForgotPasswordForm.tsx
│       │   └── ResetPasswordForm.tsx
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   └── useProfile.ts
│       ├── services/
│       │   └── authApi.ts
│       └── types/
│           └── auth.types.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ProfilePage.tsx
│   ├── ForgotPasswordPage.tsx
│   └── ResetPasswordPage.tsx
├── components/
│   └── shared/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       └── Toast.tsx
├── services/
│   ├── apiClient.ts
│   └── tokenService.ts
├── hooks/
│   ├── useLocalStorage.ts
│   └── useToast.ts
├── layouts/
│   ├── AuthLayout.tsx
│   └── MainLayout.tsx
├── routes/
│   ├── ProtectedRoute.tsx
│   └── PublicRoute.tsx
└── App.tsx
```

### Technology Stack
- **React 18** with TypeScript
- **React Query** for API calls and caching
- **React Router v6** for routing
- **Tailwind CSS** for styling
- **Axios** for HTTP client
- **Zod** for form validation (optional)

## API Endpoints

### Auth Controller (`/api/auth`)
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/register` | Register new user | `{ email, password, fullName }` | `201 Created` |
| POST | `/login` | Authenticate user | `{ email, password }` | `200 OK` with tokens in cookies |
| POST | `/refresh` | Refresh access token | – | `200 OK` with new tokens |
| POST | `/logout` | Invalidate tokens | – | `200 OK` |
| POST | `/forgot-password` | Request password reset | `{ email }` | `200 OK` |
| POST | `/reset-password` | Reset password with token | `{ token, newPassword }` | `200 OK` |

### Profile Controller (`/api/profile`)
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/` | Get user profile | – | `200 OK` with profile data |
| PUT | `/` | Update profile | `{ fullName, travelPreferences, passportDetails }` | `200 OK` |

### Validation Rules
- **Email**: Required, valid format, max 255 chars
- **Password**: Required, min 8 chars, at least one uppercase, one lowercase, one digit, one special character
- **FullName**: Required, max 100 chars
- **TravelPreferences**: Optional JSON object
- **PassportDetails**: Optional JSON object with `number`, `expiry`, `country`

## Responsive Design Requirements

### Breakpoints
- **Mobile**: 320px – 767px
- **Tablet**: 768px – 1023px
- **Desktop**: 1024px and above

### Implementation Guidelines
- **Mobile-first CSS** using Tailwind utility classes
- **Touch-friendly buttons** with min height of 44px
- **Form inputs** with appropriate font sizes and spacing
- **Flexible layouts** using CSS Grid/Flexbox
- **Hide/show elements** based on screen size (e.g., sidebar collapse on mobile)

### Component Examples
- Login/Register forms stack vertically on mobile, two‑column layout on desktop
- Profile page uses card‑based design with responsive tables
- Navigation bar collapses into hamburger menu on mobile

## Security Considerations
- **HTTPS** enforced in production
- **httpOnly cookies** for token storage (SameSite=Strict)
- **CSRF protection** via anti‑forgery tokens for state‑changing operations
- **Rate limiting** on login and password reset endpoints
- **Password hashing** with bcrypt (work factor 12)
- **JWT signing** with strong secret (min 256‑bit)
- **Input sanitization** to prevent XSS

## Testing Strategy

### Backend Tests
- **Unit tests**: Business logic in Application layer (xUnit/NUnit)
- **Integration tests**: API endpoints with in‑memory database
- **Security tests**: Token validation, password strength

### Frontend Tests
- **Component tests**: React Testing Library
- **E2E tests**: Cypress for critical user flows (login, registration)
- **Accessibility tests**: Axe-core integration

### Test Coverage Goals
- Core business logic: ≥90%
- API endpoints: ≥80%
- UI components: ≥70%

## Deployment & DevOps
- **Docker** container for backend API
- **Docker Compose** for local development (Microsoft SQL Server + API)
- **Environment variables** for configuration (JWT secret, DB connection, email settings)
- **Health check endpoint** `/health` for monitoring
- **Logging** structured JSON logs (Serilog)

## Scalability & Maintainability
- **Modular design** allows easy addition of new authentication providers (OAuth2, social login)
- **Repository pattern** enables switching database providers if needed
- **Feature‑based structure** keeps code organized as application grows
- **Clear separation of concerns** between layers simplifies testing and maintenance

## Next Steps
1. Implement database migrations
2. Create backend services and repositories
3. Develop frontend components and pages
4. Write comprehensive test suite
5. Integrate with existing trip management module

## References
- [Persona](AI-Agent/global/fullstacK_dev_persona.md)
- [Project Rules](AI-Agent/global/project-boundaries.md)
- [KPI Contract](AI-Agent/global/kpi-contract.md)
- [Project Architecture](AI-Agent/global/project-architecture.md)
- [Token Optimization](AI-Agent/global/save-tokens.md)