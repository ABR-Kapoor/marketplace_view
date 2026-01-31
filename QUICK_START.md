# Quick Start Guide - Custom Authentication

## What Changed?

✅ **Removed**: Supabase Auth system  
✅ **Removed**: Marketing landing page  
✅ **Added**: Custom email-based login system  
✅ **Added**: Beautiful login page with modern UI  
✅ **Added**: Session management with secure cookies  
✅ **Updated**: All API routes and pages to use custom auth  

## How to Use

### 1. **Start the Development Server**
```bash
npm run dev
```

### 2. **Access the Application**
- Navigate to `http://localhost:3000`
- You'll be automatically redirected to `/login`

### 3. **Login**
- Enter an email address that exists in your `users` table
- The user must have `is_active = true` in the database
- Click "Sign In"
- You'll be redirected to `/marketplace` based on your role

### 4. **Logout**
- Click the "Logout" button in the top-right corner of the navbar
- You'll be redirected back to `/login`

## Database Requirements

### Ensure you have users in the `users` table:

```sql
-- Example: Insert a test user
INSERT INTO public.users (email, role, name, is_active, is_verified)
VALUES 
  ('patient@example.com', 'patient', 'John Doe', true, true),
  ('doctor@example.com', 'doctor', 'Dr. Smith', true, true),
  ('admin@example.com', 'admin', 'Admin User', true, true);
```

**Important Fields:**
- `email`: Must be unique and valid
- `role`: Must be 'patient', 'doctor', or 'admin'
- `name`: User's display name
- `is_active`: Must be `true` for login to work
- `is_verified`: Optional, for future email verification

## Authentication Flow

```
1. User visits http://localhost:3000
   ↓
2. Redirected to /login (if not authenticated)
   ↓
3. User enters email
   ↓
4. System checks if user exists in users table
   ↓
5. System verifies user is active
   ↓
6. Session cookie is created
   ↓
7. User is redirected to /marketplace
   ↓
8. User can access all protected routes
```

## Protected Routes

All routes under `/marketplace` are protected:
- `/marketplace` - Browse medicines
- `/marketplace/cart` - Shopping cart
- `/marketplace/checkout` - Checkout page
- `/marketplace/orders` - Order history

If you try to access any of these without being logged in, you'll be redirected to `/login`.

## API Endpoints

### Authentication APIs
- `POST /api/auth/login` - Login with email
- `POST /api/auth/logout` - Logout and clear session
- `GET /api/auth/session` - Get current session info

### Marketplace APIs (Protected)
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart` - Update cart item quantity
- `DELETE /api/cart` - Remove item from cart
- `POST /api/checkout` - Create order from cart
- `GET /api/orders` - Get user's orders

## Session Details

- **Cookie Name**: `user_session`
- **Duration**: 7 days
- **Storage**: HTTP-only cookie (secure in production)
- **Contains**: User ID, email, role, name, timestamp

## Troubleshooting

### "User not found" error
- Ensure the email exists in the `users` table
- Check that the email is spelled correctly

### "Account deactivated" error
- Check that `is_active = true` in the database
- Update the user: `UPDATE users SET is_active = true WHERE email = 'your@email.com'`

### Can't access marketplace
- Make sure you're logged in
- Check browser cookies (should have `user_session` cookie)
- Try logging out and logging in again

### Session expires immediately
- Check that cookies are enabled in your browser
- Verify the cookie settings in `src/app/api/auth/login/route.ts`

## Testing Different Roles

### Patient Role
```sql
INSERT INTO users (email, role, name, is_active)
VALUES ('patient@test.com', 'patient', 'Test Patient', true);
```
Login with `patient@test.com` → Access marketplace as patient

### Doctor Role
```sql
INSERT INTO users (email, role, name, is_active)
VALUES ('doctor@test.com', 'doctor', 'Test Doctor', true);
```
Login with `doctor@test.com` → Access marketplace as doctor

### Admin Role
```sql
INSERT INTO users (email, role, name, is_active)
VALUES ('admin@test.com', 'admin', 'Test Admin', true);
```
Login with `admin@test.com` → Access marketplace as admin

## Key Files

### Authentication
- `src/app/login/page.tsx` - Login page UI
- `src/app/api/auth/login/route.ts` - Login API
- `src/app/api/auth/logout/route.ts` - Logout API
- `src/utils/auth.ts` - Authentication utilities

### Protected Pages
- `src/app/marketplace/page.tsx` - Main marketplace
- `src/app/marketplace/cart/page.tsx` - Cart page
- `src/app/marketplace/checkout/page.tsx` - Checkout page
- `src/app/marketplace/orders/page.tsx` - Orders page

### Components
- `src/components/Navbar.tsx` - Navigation with logout

## Next Steps

1. **Add Password Authentication**: Currently only checks email existence
2. **Implement Email Verification**: Use the `is_verified` field
3. **Add Password Reset**: Allow users to reset forgotten passwords
4. **Enhance Security**: Add rate limiting, CSRF protection
5. **Add User Profile**: Allow users to update their information

## Support

For detailed technical documentation, see `AUTH_CHANGES.md`
