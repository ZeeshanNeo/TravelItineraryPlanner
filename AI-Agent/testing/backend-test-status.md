# Backend Test Status - Auth Module

This document tracks the execution and status of the backend API test cases for the User Management module.

## 1. User Registration KPI

| Test ID | Category | Description | Expected Result | Status |
|---|---|---|---|---|
| AUTH-REG-B01 | Positive | Register with valid details (First name, Last name, Email, Password) | 200 OK, User created in DB | [ ] Pass / [ ] Fail |
| AUTH-REG-B02 | Negative | Register with already existing email | 400 Bad Request, "Email already exists" | [ ] Pass / [ ] Fail |
| AUTH-REG-B03 | Validation | Register with missing required fields (e.g., empty email) | 400 Bad Request, validation errors | [ ] Pass / [ ] Fail |
| AUTH-REG-B04 | Edge Case | Register with extremely long name and email | 400 Bad Request, payload too large / schema failure | [ ] Pass / [ ] Fail |
| AUTH-REG-B05 | Security | SQL Injection / XSS payloads in name fields | Input sanitized/rejected, 400 Bad Request | [ ] Pass / [ ] Fail |

## 2. User Login KPI

| Test ID | Category | Description | Expected Result | Status |
|---|---|---|---|---|
| AUTH-LOG-B01 | Positive | Login with valid credentials | 200 OK, JWT access & refresh tokens returned | [ ] Pass / [ ] Fail |
| AUTH-LOG-B02 | Negative | Login with incorrect password | 401 Unauthorized, generic error message | [ ] Pass / [ ] Fail |
| AUTH-LOG-B03 | Negative | Login with non-existent email | 401 Unauthorized, generic error message | [ ] Pass / [ ] Fail |
| AUTH-LOG-B04 | Security | Brute force attempt (multiple failed logins) | Account lockout / 429 Too Many Requests | [ ] Pass / [ ] Fail |
| AUTH-LOG-B05 | Edge Case | Login with valid email but different casing | 200 OK (Email matching should be case-insensitive) | [ ] Pass / [ ] Fail |

## 3. Profile Management KPI

| Test ID | Category | Description | Expected Result | Status |
|---|---|---|---|---|
| AUTH-PRO-B01 | Positive | Get current user profile | 200 OK, returns user data without password hash | [ ] Pass / [ ] Fail |
| AUTH-PRO-B02 | Positive | Update travel preferences and passport details | 200 OK, DB updated, returns updated profile | [ ] Pass / [ ] Fail |
| AUTH-PRO-B03 | Negative | Access profile without Bearer token | 401 Unauthorized | [ ] Pass / [ ] Fail |
| AUTH-PRO-B04 | Security | Attempt to update another user's profile | 403 Forbidden / 401 Unauthorized | [ ] Pass / [ ] Fail |
| AUTH-PRO-B05 | Edge Case | Send malformed JSON in travel preferences | 400 Bad Request, proper validation failure | [ ] Pass / [ ] Fail |

## 4. Password Reset KPI

| Test ID | Category | Description | Expected Result | Status |
|---|---|---|---|---|
| AUTH-RST-B01 | Positive | Request password reset for valid email | 200 OK, Reset token generated | [ ] Pass / [ ] Fail |
| AUTH-RST-B02 | Positive | Execute password reset with valid token | 200 OK, Password successfully updated in DB | [ ] Pass / [ ] Fail |
| AUTH-RST-B03 | Negative | Request reset for non-existent email | 200 OK (Do not leak user existence) | [ ] Pass / [ ] Fail |
| AUTH-RST-B04 | Security | Execute reset with expired token | 400 Bad Request, "Token expired" | [ ] Pass / [ ] Fail |
| AUTH-RST-B05 | Edge Case | Execute reset with already used token | 400 Bad Request, "Token already used" | [ ] Pass / [ ] Fail |

## 5. Session Management KPI

| Test ID | Category | Description | Expected Result | Status |
|---|---|---|---|---|
| AUTH-SES-B01 | Positive | Request new access token using valid refresh token | 200 OK, new access token and refresh token returned | [ ] Pass / [ ] Fail |
| AUTH-SES-B02 | Negative | Use expired access token | 401 Unauthorized | [ ] Pass / [ ] Fail |
| AUTH-SES-B03 | Security | Revoke refresh token (Logout) | 204 No Content, token invalidated in DB | [ ] Pass / [ ] Fail |
| AUTH-SES-B04 | Security | Attempt to use revoked refresh token | 401 Unauthorized, possible session hijacking alert | [ ] Pass / [ ] Fail |
