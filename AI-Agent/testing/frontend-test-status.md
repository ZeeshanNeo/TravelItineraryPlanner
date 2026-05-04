# Frontend Test Status - Auth Module

This document tracks the execution and status of the frontend UI test cases for the User Management module.

## 1. User Registration KPI

| Test ID | Category | Description | Expected Result | Status |
|---|---|---|---|---|
| AUTH-REG-F01 | Positive | Submit registration form with valid input | Redirect to dashboard, token stored | [ ] Pass / [ ] Fail |
| AUTH-REG-F02 | Negative | Network error during registration | Graceful error message displayed | [ ] Pass / [ ] Fail |
| AUTH-REG-F03 | Validation | Submit without password / invalid email format | Frontend validation messages shown, submit blocked | [ ] Pass / [ ] Fail |
| AUTH-REG-F04 | Edge Case | Rapid double-clicking of the submit button | Only one API request fired (button disabled) | [ ] Pass / [ ] Fail |
| AUTH-REG-F05 | Responsive | View and submit form on Mobile (320px) | Elements stack correctly, inputs are touch-friendly | [ ] Pass / [ ] Fail |

## 2. User Login KPI

| Test ID | Category | Description | Expected Result | Status |
|---|---|---|---|---|
| AUTH-LOG-F01 | Positive | Submit login form with valid credentials | Token saved in localStorage, redirected to dashboard | [ ] Pass / [ ] Fail |
| AUTH-LOG-F02 | Validation | Submit empty fields | Required field hints displayed natively | [ ] Pass / [ ] Fail |
| AUTH-LOG-F03 | Security | Password input field visibility | Characters masked (`type="password"`) | [ ] Pass / [ ] Fail |
| AUTH-LOG-F04 | Responsive | View split-screen login layout on Desktop | Left form, right showcase image renders properly | [ ] Pass / [ ] Fail |
| AUTH-LOG-F05 | Responsive | View layout on Tablet (768px) / Mobile | Showcase image hides or stacks smoothly | [ ] Pass / [ ] Fail |

## 3. Profile Management KPI

| Test ID | Category | Description | Expected Result | Status |
|---|---|---|---|---|
| AUTH-PRO-F01 | Positive | Load profile page | User data populates the forms correctly | [ ] Pass / [ ] Fail |
| AUTH-PRO-F02 | Positive | Save profile changes | Success toast/message displayed, updated in UI | [ ] Pass / [ ] Fail |
| AUTH-PRO-F03 | Validation | Submit invalid phone number format | Inline validation error displayed | [ ] Pass / [ ] Fail |
| AUTH-PRO-F04 | Edge Case | User navigates away with unsaved changes | Warning prompt shown (optional but good) | [ ] Pass / [ ] Fail |
| AUTH-PRO-F05 | Responsive | View profile grid on Mobile (320px) | Layout shifts from grid to single-column | [ ] Pass / [ ] Fail |

## 4. Password Reset KPI

| Test ID | Category | Description | Expected Result | Status |
|---|---|---|---|---|
| AUTH-RST-F01 | Positive | Submit forgot password form | Success message instructing to check email | [ ] Pass / [ ] Fail |
| AUTH-RST-F02 | Validation | Reset password form without matching passwords | "Passwords do not match" error displayed | [ ] Pass / [ ] Fail |
| AUTH-RST-F03 | Responsive | Interact with reset password form on tablet | Button touch targets are large enough (min 44px) | [ ] Pass / [ ] Fail |

## 5. Session Management KPI

| Test ID | Category | Description | Expected Result | Status |
|---|---|---|---|---|
| AUTH-SES-F01 | Positive | Logout action | Token cleared, redirected to login page | [ ] Pass / [ ] Fail |
| AUTH-SES-F02 | Edge Case | Access protected route (`/dashboard`) while unauthenticated | Redirected to `/login` immediately | [ ] Pass / [ ] Fail |
| AUTH-SES-F03 | Edge Case | Access `/login` while already authenticated | Redirected silently to `/dashboard` | [ ] Pass / [ ] Fail |
| AUTH-SES-F04 | Security | Silent token refresh mechanism | Axios interceptor successfully refreshes 401 errors | [ ] Pass / [ ] Fail |
