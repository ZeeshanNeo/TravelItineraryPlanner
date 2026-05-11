# Module: User Management (Auth & Profile)

## Overview
The User Management module provides the foundational security and identity services for Voyager Pro. It handles registration, secure login, profile customization, and session persistence.

## Key Performance Indicators (KPIs)
- **User Registration**: Create accounts with email/password.
- **User Login**: Secure authentication with JWT.
- **Profile Management**: Update preferences and passport details.
- **Password Reset**: Email-based recovery flow.
- **Session Management**: Secure token rotation and persistence.

## 🗄️ Database Schema

### Tables
- **`Users`**: Core user data including hashed passwords and JSONB preferences.
- **`RefreshTokens`**: Tracks active sessions and rotation hashes.
- **`PasswordResetTokens`**: Manages recovery tokens and expiry.

```sql
CREATE TABLE Users (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Email VARCHAR(255) UNIQUE NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    TravelPreferences JSONB,
    PassportDetails JSONB,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FailedLoginAttempts INT DEFAULT 0,
    LockedUntil TIMESTAMP WITH TIME ZONE
);
```

## 🏗️ Architecture (Clean Architecture)

### Layer Structure
- **Domain**: Entities (`User`, `RefreshToken`) and Repository Interfaces.
- **Application**: Features (Register, Login, UpdateProfile) and DTOs.
- **Infrastructure**: Data access (EF Core), Token services, and Password hashing.
- **API**: Controllers and Middleware (Exception handling, JWT).

### Design Decisions
- **Service + Repository Pattern**: Standardized data access without the complexity of CQRS.
- **JWT with Rotation**: Access tokens are short-lived (15m); refresh tokens rotate on every use.
- **Security**: httpOnly cookies for token storage to mitigate XSS.

## 🌐 Frontend (React + TypeScript)
- **State Management**: React Query for API synchronization.
- **Components**: Modular forms for Login, Register, and Profile.
- **Responsive**: Mobile-first design with touch-friendly targets (44px min).

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Authenticate and receive tokens |
| `POST` | `/api/auth/refresh` | Rotate access/refresh tokens |
| `GET` | `/api/profile` | Retrieve current user profile |
| `PUT` | `/api/profile` | Update user metadata |

## 🛡️ Security Considerations
- **HTTPS Enforced**: Critical for token safety.
- **bcrypt Hashing**: Work factor 12 for password protection.
- **Rate Limiting**: Applied to sensitive endpoints (Login, Reset).
