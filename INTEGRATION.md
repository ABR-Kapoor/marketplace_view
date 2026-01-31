# Medicine Marketplace Module Integration Guide

This module is designed to be a self-contained marketplace for your Health Web Application.

## 1. Database Setup

Run the SQL commands found in `setup.sql` in your Supabase SQL Editor.
This will create the necessary tables:
- `medicines`
- `carts` / `cart_items`
- `orders` / `order_items`

It also sets up RLS policies to ensure users can only access their own data.

## 2. Environment Variables

Ensure your main application's `.env.local` has the Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 3. Folder Integration

1. Copy the `src/app/marketplace` folder to your main app's `app` directory.
   - Result: `your-app/app/marketplace/page.tsx`, etc.

2. Copy accessibility components/hooks if needed:
   - `src/components/MedicineCard.tsx`
   - `src/components/AddToCartButton.tsx`
   - `src/components/CartList.tsx`
   - `src/components/CheckoutForm.tsx`
   - `src/components/Navbar.tsx` (You might want to merge this with your main app's navbar instead)
   - `src/utils/supabase` (If you don't already have one)
   - `src/types/index.ts` (Merge with your types)

3. API Routes:
   - Copy `src/app/api/medicines`, `src/app/api/cart`, `src/app/api/checkout`, `src/app/api/orders` to your main app's `app/api/` folder.

## 4. Dependencies

Ensure your main `package.json` includes:

```bash
npm install @supabase/supabase-js @supabase/ssr lucide-react clsx tailwind-merge zod
```

## 5. Authentication

The module assumes Supabase Auth is present.
- `src/middleware.ts` (standard Supabase middleware) is recommended to refresh sessions.
- The API routes and Pages check for `supabase.auth.getUser()`. If the user is not logged in, they may be redirected or APIs will return 401.

## 6. Customization

- **Payment Gateway**: The checkout logic in `/api/checkout` and `CheckoutForm.tsx` is a **dummy implementation**. Replace the logic in `/api/checkout` with Stripe/Razorpay/etc. SDKs for real payments.
- **Styling**: The module uses Tailwind CSS. Colors are primarily `teal` to match a medical aesthetic. Search/Replace `teal` with your brand color if needed.

## 7. Testing

1. Go to `/marketplace`.
2. Browse medicines (seeded from `setup.sql`).
3. Add to cart.
4. Proceed to checkout -> enter any address -> Pay.
5. Check `/marketplace/orders` to see the new order.
