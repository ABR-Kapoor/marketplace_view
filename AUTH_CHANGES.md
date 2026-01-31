# Authentication System Changes

## Overview
This document outlines the changes made to replace Supabase Auth with a custom email-based authentication system that validates users against the `users` table in the database.

## Changes Made

### 1. **Removed Landing Page**
- **File**: `src/app/page.tsx`
- **Change**: Replaced the marketing landing page with a redirect logic that sends authenticated users to `/marketplace` and unauthenticated users to `/login`

### 2. **Created Login Page**
- **File**: `src/app/login/page.tsx`
- **Features**:
  - Modern, beautiful UI with gradient backgrounds and animations
  - Email-only authentication
  - Validates user exists in the `users` table
  - Checks if user account is active
  - Redirects based on user role (patient, doctor, admin)
  - Comprehensive error handling and user feedback

### 3. **Authentication API Routes**

#### Login Route
- **File**: `src/app/api/auth/login/route.ts`
- **Functionality**:
  - Validates email format
  - Checks if user exists in `users` table
  - Verifies account is active (`is_active = true`)
  - Updates `last_login` timestamp
  - Creates secure HTTP-only session cookie
  - Returns user information (uid, email, role, name)

#### Logout Route
- **File**: `src/app/api/auth/logout/route.ts`
- **Functionality**:
  - Clears the session cookie
  - Returns success response

#### Session Route
- **File**: `src/app/api/auth/session/route.ts`
- **Functionality**:
  - Checks current authentication status
  - Returns user information if authenticated

### 4. **Authentication Utilities**
- **File**: `src/utils/auth.ts`
- **Functions**:
  - `getCurrentUser()`: Get current user session from cookies
  - `isAuthenticated()`: Check if user is authenticated
  - `hasRole(role)`: Check if user has specific role
  - `requireAuth()`: Require authentication (throws error if not authenticated)
  - `requireRole(role)`: Require specific role (throws error if user doesn't have role)

### 5. **Updated API Routes**
All existing API routes have been updated to use the custom authentication system:

- **Cart API** (`src/app/api/cart/route.ts`):
  - GET, POST, PUT, DELETE methods now use `getCurrentUser()` instead of `supabase.auth.getUser()`
  - Uses `user.uid` instead of `user.id`

- **Checkout API** (`src/app/api/checkout/route.ts`):
  - Uses custom authentication
  - Creates orders with `user.uid`

- **Orders API** (`src/app/api/orders/route.ts`):
  - Fetches orders using `user.uid`

### 6. **Updated Pages**
All marketplace pages now use custom authentication and redirect to `/login` if not authenticated:

- **Marketplace Page** (`src/app/marketplace/page.tsx`)
- **Cart Page** (`src/app/marketplace/cart/page.tsx`)
- **Checkout Page** (`src/app/marketplace/checkout/page.tsx`)
- **Orders Page** (`src/app/marketplace/orders/page.tsx`)

### 7. **Updated Utilities**
- **Cart Utility** (`src/utils/cart.ts`):
  - `getCartCount()` now uses custom authentication

### 8. **Enhanced Navbar**
- **File**: `src/components/Navbar.tsx`
- **Changes**:
  - Converted to client component
  - Added user name display
  - Added logout button with loading state
  - Improved UI with user avatar icon

### 9. **Updated Layout**
- **File**: `src/app/marketplace/layout.tsx`
- **Changes**:
  - Fetches current user
  - Passes user name to Navbar component

## Session Management

### Cookie Structure
The session is stored in an HTTP-only cookie named `user_session` with the following structure:
```typescript
{
  uid: string,        // User's unique ID from users table
  email: string,      // User's email
  role: string,       // User's role (patient, doctor, admin)
  name: string,       // User's name
  timestamp: number   // Session creation timestamp
}
```

### Cookie Settings
- **Name**: `user_session`
- **HTTP Only**: `true` (prevents JavaScript access)
- **Secure**: `true` in production (HTTPS only)
- **SameSite**: `lax`
- **Max Age**: 7 days (604800 seconds)
- **Path**: `/`

## Authentication Flow

### Login Flow
1. User enters email on login page
2. Frontend sends POST request to `/api/auth/login`
3. Backend validates email format
4. Backend checks if user exists in `users` table
5. Backend verifies account is active
6. Backend updates `last_login` timestamp
7. Backend creates session cookie
8. Frontend redirects based on user role

### Protected Routes
All marketplace routes are protected and require authentication:
- If user is not authenticated, they are redirected to `/login`
- Session is validated on each page load
- Session cookie is checked for validity

### Logout Flow
1. User clicks logout button
2. Frontend sends POST request to `/api/auth/logout`
3. Backend clears session cookie
4. Frontend redirects to `/login`

## Database Schema

The authentication system uses the `users` table with the following structure:

```sql
create table public.users (
  uid uuid not null default extensions.uuid_generate_v4(),
  email character varying(255) not null,
  phone character varying(20) null,
  password_hash text null,
  role character varying(20) not null,
  name character varying(255) not null,
  profile_image_url text null,
  is_verified boolean null default false,
  is_active boolean null default true,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  last_login timestamp with time zone null,
  auth_id text null,
  constraint users_pkey primary key (uid),
  constraint users_email_key unique (email),
  constraint users_role_check check (
    role in ('patient', 'doctor', 'admin')
  )
)
```

## Key Changes from Supabase Auth

| Aspect | Supabase Auth | Custom Auth |
|--------|---------------|-------------|
| User ID | `user.id` | `user.uid` |
| Authentication Method | `supabase.auth.getUser()` | `getCurrentUser()` from `@/utils/auth` |
| Session Storage | Supabase managed | HTTP-only cookie |
| User Table | `auth.users` | `public.users` |
| Login Method | Email + Password or Magic Link | Email only (checks existence) |

## Security Considerations

1. **HTTP-Only Cookies**: Session cookies are HTTP-only to prevent XSS attacks
2. **Secure Flag**: Cookies are marked secure in production (HTTPS only)
3. **Email Validation**: Email format is validated before database lookup
4. **Account Status Check**: Only active accounts can login
5. **Session Validation**: Session is validated on each protected route access

## Testing the System

### To test the login:
1. Ensure you have a user in the `users` table with `is_active = true`
2. Navigate to `http://localhost:3000`
3. You should be redirected to `/login`
4. Enter the email of an existing user
5. You should be logged in and redirected to `/marketplace`

### To test logout:
1. While logged in, click the "Logout" button in the navbar
2. You should be redirected to `/login`
3. Session cookie should be cleared

## Future Enhancements

Potential improvements for the authentication system:
1. Add password verification (currently only checks email existence)
2. Implement password reset functionality
3. Add email verification flow
4. Implement remember me functionality
5. Add session expiration and refresh logic
6. Implement rate limiting for login attempts
7. Add multi-factor authentication (MFA)
8. Add OAuth providers (Google, Facebook, etc.)

## Migration Notes

If you're migrating existing users from Supabase Auth:
1. Ensure all users have entries in the `public.users` table
2. Map Supabase Auth IDs to the `auth_id` field in the users table
3. Update any existing cart, order, or other user-related data to use `uid` instead of Supabase auth ID
