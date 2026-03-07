# AuraMart -- Healthcare Marketplace

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2451?logo=razorpay&logoColor=white)
![Port](https://img.shields.io/badge/Port-3004-green)
![License](https://img.shields.io/badge/License-Private-red)

**AuraMart** is the healthcare marketplace module of the **AuraSutra** platform. It provides a full-featured e-commerce experience for purchasing medicines online, complete with real-time catalog browsing, shopping cart management, secure Razorpay payments, order tracking, and role-based delivery management. Built with Next.js 16.1.6 (App Router) and React 19, it runs on port **3004** with the React Compiler enabled.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Authentication](#authentication)
- [Payment Flow](#payment-flow)
- [Order Lifecycle](#order-lifecycle)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Fonts and Theming](#fonts-and-theming)
- [Image Hosting](#image-hosting)

---

## Architecture Overview

```
+------------------------------------------------------------------+
|                        CLIENT (Browser)                          |
|                                                                  |
|  +------------------+  +---------------+  +-------------------+  |
|  | Marketplace Page |  | Cart / Orders |  | Checkout + Pay    |  |
|  | (Server Render)  |  | (Client)      |  | (Razorpay Popup)  |  |
|  +--------+---------+  +-------+-------+  +---------+---------+  |
|           |                    |                     |            |
+-----------+--------------------+---------------------+------------+
            |                    |                     |
            v                    v                     v
+------------------------------------------------------------------+
|                    NEXT.JS APP ROUTER (Port 3004)                |
|                                                                  |
|  +------------------+  +------------------+  +-----------------+ |
|  | /api/medicines   |  | /api/cart (CRUD) |  | /api/payments/* | |
|  | /api/orders      |  | /api/checkout    |  | /api/upload     | |
|  | /api/patient/*   |  | /api/sync-user   |  | /api/admin/*    | |
|  +--------+---------+  +--------+---------+  +--------+--------+ |
|           |                     |                      |          |
+-----------+---------------------+----------------------+----------+
            |                     |                      |
            v                     v                      v
+-------------------+  +-------------------+  +-------------------+
|   PostgreSQL      |  |   Kinde Auth      |  |   Razorpay API    |
|   (Neon Cloud)    |  |   (Google OAuth)  |  |   (INR Payments)  |
+-------------------+  +-------------------+  +-------------------+
                                              +-------------------+
                                              |   Nhost Storage   |
                                              |   (File Uploads)  |
                                              +-------------------+
```

---

## Tech Stack

| Layer          | Technology                                        |
|----------------|---------------------------------------------------|
| Framework      | Next.js 16.1.6 (App Router, Webpack -- Turbopack disabled) |
| UI Library     | React 19.2.3 with React Compiler enabled          |
| Language       | TypeScript 5.x (strict mode)                      |
| Styling        | Tailwind CSS v4, `tailwind-merge`, `clsx`         |
| Icons          | Lucide React                                      |
| Notifications  | react-hot-toast                                   |
| Database       | PostgreSQL via Neon (serverless), `postgres` npm   |
| Authentication | Kinde Auth (`@kinde-oss/kinde-auth-nextjs`)       |
| Payments       | Razorpay (`razorpay` SDK + client-side checkout)  |
| File Storage   | Nhost (`@nhost/nhost-js`)                         |
| Validation     | Zod v4                                            |
| Fonts          | Poppins, Noto Sans Devanagari, Alatsi (Google Fonts) |
| Linting        | ESLint 9 with `eslint-config-next`                |
| Build          | PostCSS 8 + `@tailwindcss/postcss`                |

---

## Project Structure

```
MarketPlace/
|
|-- middleware.ts                    # Kinde auth middleware (route protection)
|-- next.config.ts                  # React Compiler, image remote patterns
|-- setup.sql                       # Database schema + seed data + RLS policies
|-- package.json                    # Dependencies and scripts
|-- tsconfig.json                   # TypeScript config (strict, path aliases)
|-- postcss.config.mjs              # PostCSS with Tailwind plugin
|-- eslint.config.mjs               # ESLint 9 flat config
|
|-- public/                         # Static assets (logos, backgrounds)
|
|-- src/
    |
    |-- app/
    |   |-- layout.tsx              # Root layout (Poppins + Devanagari fonts)
    |   |-- page.tsx                # Landing / redirect page
    |   |-- globals.css             # Global styles and Tailwind directives
    |   |
    |   |-- auth-callback/
    |   |   +-- page.tsx            # Post-login user sync handler
    |   |
    |   |-- login/
    |   |   +-- page.tsx            # Login redirect page
    |   |
    |   |-- unauthorized/
    |   |   +-- page.tsx            # Access denied (delivery boys blocked)
    |   |
    |   |-- marketplace/
    |   |   |-- layout.tsx          # Marketplace layout (Navbar wrapper)
    |   |   |-- page.tsx            # Main medicine catalog (server-rendered)
    |   |   |-- [id]/
    |   |   |   +-- page.tsx        # Medicine detail page
    |   |   |-- cart/
    |   |   |   +-- page.tsx        # Shopping cart view
    |   |   |-- checkout/
    |   |   |   +-- page.tsx        # Checkout with Razorpay integration
    |   |   |-- orders/
    |   |   |   +-- page.tsx        # Order history and tracking
    |   |   +-- profile/
    |   |       +-- page.tsx        # User profile management
    |   |
    |   +-- api/
    |       |-- auth/[kindeAuth]/
    |       |   +-- route.ts        # Kinde auth handler (login/logout/callback)
    |       |-- sync-user/
    |       |   +-- route.ts        # Sync Google user data to DB
    |       |-- medicines/
    |       |   +-- route.ts        # GET: catalog search with filters
    |       |-- cart/
    |       |   +-- route.ts        # GET/POST/PUT/DELETE: full cart CRUD
    |       |-- checkout/
    |       |   +-- route.ts        # POST: simple checkout flow
    |       |-- payments/
    |       |   |-- create-order/
    |       |   |   +-- route.ts    # POST: Razorpay order + DB order creation
    |       |   +-- verify/
    |       |       +-- route.ts    # POST: Razorpay signature verification
    |       |-- orders/
    |       |   +-- route.ts        # GET: user order history with line items
    |       |-- patient/profile/
    |       |   +-- route.ts        # GET/PATCH: role-aware profile management
    |       |-- upload/
    |       |   +-- route.ts        # POST: Nhost image upload
    |       +-- admin/
    |           |-- delivery-boys/available/
    |           |   +-- route.ts    # GET: available delivery agents
    |           +-- orders/
    |               |-- pending-delivery/
    |               |   +-- route.ts # GET: orders awaiting delivery assignment
    |               +-- [orderId]/assign/
    |                   +-- route.ts # POST: assign delivery agent to order
    |
    |-- components/
    |   |-- Navbar.tsx              # Sticky glassmorphism navbar with cart badge
    |   |-- MarketplaceLayoutClient.tsx  # Client layout with live profile state
    |   |-- MedicineCard.tsx        # Product card (image, price, stock status)
    |   |-- AddToCartButton.tsx     # Detail page add-to-cart with auth check
    |   |-- CartList.tsx            # Cart items with quantity +/- controls
    |   |-- CheckoutForm.tsx        # Address form + Razorpay payment trigger
    |   |-- SearchBar.tsx           # Search input with URL search params sync
    |   |-- RealtimeMedicines.tsx   # 5-second polling for catalog refresh
    |   |-- RefreshButton.tsx       # Manual page refresh button
    |   +-- ProfileEditModal.tsx    # Modal for editing profile + address fields
    |
    |-- lib/
    |   |-- db.ts                   # PostgreSQL connection (Neon, SSL, pool=10)
    |   |-- upload.ts               # Nhost upload helper
    |   |-- auth/
    |   |   +-- sync-user.ts        # User sync logic (Kinde -> DB)
    |   +-- payment/
    |       +-- razorpay.ts         # Razorpay server-side client instance
    |
    |-- types/
    |   +-- index.ts                # TypeScript interfaces (Medicine, Cart, Order)
    |
    +-- utils/
        |-- auth.ts                 # Cookie-based session reader (user_session)
        +-- cart.ts                 # Cart item count utility
```

---

## Key Features

### Medicine Catalog
- Server-rendered medicine listing at `/marketplace`
- Full-text search using PostgreSQL `ILIKE` pattern matching
- Category filtering (Pain Relief, Antibiotics, Allergy, Vitamins, etc.)
- Price range filtering (min/max)
- In-stock filtering toggle
- 5-second automatic polling refresh via `RealtimeMedicines` component
- Individual medicine detail pages at `/marketplace/[id]` with stock status

### Shopping Cart
- Full CRUD operations (add, update quantity, remove items)
- Quantity increment/decrement controls with minimum/maximum bounds
- Optimistic UI updates for responsive user experience
- Cart badge count displayed live in the navbar
- Automatic cart creation on first item addition

### Checkout and Payments
- Address pre-fill from saved user profile
- Razorpay payment gateway integration (INR currency)
- Client-side Razorpay SDK dynamic loading
- Server-side order creation with Razorpay order ID
- HMAC-SHA256 signature verification for payment authenticity
- Automatic cart clearing upon successful payment
- Finance transaction recording and receipt generation

### Order Management
- Complete order history with line item details
- Real-time status tracking through the delivery lifecycle
- Medicine details embedded in order items via JSON aggregation

### User Profile
- Role-aware profile management (patient, doctor, admin)
- Address storage routed to the correct table based on user role:
  - Doctors: address stored in the `doctors` table
  - Patients/others: address stored in the `patients` table
- Profile image upload via Nhost storage
- Phone number and name editing

### Role-Based Access Control
- `delivery_boy` users are blocked from making purchases (HTTP 403)
- Unauthorized page displayed for restricted roles
- Public access: marketplace browsing (no login required)
- Protected access: cart, checkout, orders, profile (login required)

### Admin / Delivery Management
- List available delivery agents with active delivery counts
- View orders pending delivery assignment
- Assign delivery agents to orders (status transitions to `ASSIGNED`)

---

## Authentication

AuraMart uses a **dual authentication** strategy:

```
+-------------------------------------------------------+
|                   AUTHENTICATION FLOW                  |
+-------------------------------------------------------+
|                                                       |
|  1. PRIMARY: Kinde Auth (Server-Side)                 |
|     +---> Google OAuth login                          |
|     +---> Server session via getKindeServerSession()  |
|     +---> Middleware-protected routes                  |
|     +---> User sync to PostgreSQL on first login      |
|                                                       |
|  2. SECONDARY: Cookie-Based Session                   |
|     +---> "user_session" cookie                       |
|     +---> Used by checkout and orders APIs             |
|     +---> Parsed via utils/auth.ts getCurrentUser()   |
|                                                       |
+-------------------------------------------------------+
```

### Middleware Configuration

The Kinde middleware protects all routes by default, with the following public paths:

| Path                  | Access  | Description                          |
|-----------------------|---------|--------------------------------------|
| `/`                   | Public  | Landing page                         |
| `/marketplace`        | Public  | Browse medicines without login       |
| `/api/auth/*`         | Public  | Authentication endpoints             |
| `/auth-callback`      | Public  | Post-login callback handler          |
| `/_next/*`            | Public  | Static assets and framework files    |
| `/favicon.ico`        | Public  | Favicon                              |
| `/logo_transparent.png` | Public | Logo asset                          |
| Everything else       | Protected | Requires Kinde session             |

### User Sync Flow

On first login, the `auth-callback` page triggers user synchronization:

```
Google OAuth --> Kinde --> auth-callback --> /api/sync-user --> PostgreSQL (users table)
```

This ensures every authenticated user has a corresponding row in the `users` table with their Kinde `auth_id`, name, email, and profile image.

---

## Payment Flow

```
+--------+     +-----------+     +-----------------+     +----------+
| Client |     | Next.js   |     | Razorpay API    |     | Database |
+---+----+     +-----+-----+     +--------+--------+     +----+-----+
    |                |                     |                    |
    |  1. Click Pay  |                     |                    |
    +--------------->|                     |                    |
    |                |                     |                    |
    |                | 2. POST /api/payments/create-order       |
    |                +-------------------->|                    |
    |                |                     |                    |
    |                | 3. Razorpay order_id |                   |
    |                |<--------------------+                    |
    |                |                     |                    |
    |                | 4. INSERT order +                        |
    |                |    order_items +                         |
    |                |    finance_transaction                   |
    |                +---------------------------------------->|
    |                |                     |                    |
    | 5. Open Razorpay Popup              |                    |
    |<---------------+                     |                    |
    |                |                     |                    |
    | 6. User pays in popup               |                    |
    +-------------------->                 |                    |
    |                     |                |                    |
    | 7. Payment callback |                |                    |
    |<--------------------+                |                    |
    |                |                     |                    |
    | 8. POST /api/payments/verify         |                    |
    +--------------->|                     |                    |
    |                |                     |                    |
    |                | 9. HMAC-SHA256 signature verification    |
    |                | 10. UPDATE order -> PENDING_DELIVERY     |
    |                | 11. UPDATE finance_transaction -> paid   |
    |                | 12. DELETE cart_items (clear cart)       |
    |                | 13. INSERT receipt                       |
    |                +---------------------------------------->|
    |                |                     |                    |
    | 14. Redirect to /marketplace/orders  |                   |
    |<---------------+                     |                    |
    |                |                     |                    |
```

### Payment Verification

Razorpay signature verification uses HMAC-SHA256:

```
signature = HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET)
```

If the computed signature matches the signature received from Razorpay, the payment is authentic.

---

## Order Lifecycle

```
                                +-------------------+
                                |     pending       |
                                | (order created,   |
                                |  awaiting payment)|
                                +---------+---------+
                                          |
                              Razorpay payment verified
                                          |
                                          v
                                +-------------------+
                                | PENDING_DELIVERY  |
                                | (paid, awaiting   |
                                |  agent assignment) |
                                +---------+---------+
                                          |
                              Admin assigns delivery agent
                                          |
                                          v
                                +-------------------+
                                |     ASSIGNED      |
                                | (agent notified)  |
                                +---------+---------+
                                          |
                              Agent accepts the delivery
                                          |
                                          v
                             +------------------------+
                             | ACCEPTED_FOR_DELIVERY  |
                             | (agent confirmed)      |
                             +-----------+------------+
                                         |
                              Agent picks up the order
                                         |
                                         v
                             +------------------------+
                             |  OUT_FOR_DELIVERY      |
                             |  (in transit)          |
                             +-----------+------------+
                                         |
                        +----------------+----------------+
                        |                                 |
                        v                                 v
              +-------------------+             +-------------------+
              |    DELIVERED      |             |    CANCELLED      |
              |  (completed)      |             |  (cancelled)      |
              +-------------------+             +-------------------+
```

---

## API Reference

### Authentication

| Method | Endpoint                  | Auth     | Description                              |
|--------|---------------------------|----------|------------------------------------------|
| `*`    | `/api/auth/[kindeAuth]`   | Public   | Kinde auth handler (login/logout/callback) |
| `POST` | `/api/sync-user`          | Kinde    | Sync authenticated user to database      |

### Medicines

| Method | Endpoint          | Auth   | Query Parameters                                  | Description                   |
|--------|-------------------|--------|----------------------------------------------------|-------------------------------|
| `GET`  | `/api/medicines`  | Public | `q`, `category`, `stock`, `minPrice`, `maxPrice`  | Search and filter medicines   |

**Query parameter details:**

| Parameter   | Type     | Example          | Description                            |
|-------------|----------|------------------|----------------------------------------|
| `q`         | `string` | `?q=paracetamol` | Case-insensitive name search (ILIKE)   |
| `category`  | `string` | `?category=Pain Relief` | Exact category match (or `All`) |
| `stock`     | `string` | `?stock=true`    | Filter to in-stock items only          |
| `minPrice`  | `string` | `?minPrice=5`    | Minimum price filter                   |
| `maxPrice`  | `string` | `?maxPrice=50`   | Maximum price filter                   |

### Cart

| Method   | Endpoint     | Auth   | Body / Params                              | Description               |
|----------|-------------|--------|---------------------------------------------|---------------------------|
| `GET`    | `/api/cart` | Kinde  | --                                          | Get current user's cart   |
| `POST`   | `/api/cart` | Kinde  | `{ medicineId, quantity }`                  | Add item to cart          |
| `PUT`    | `/api/cart` | Kinde  | `{ itemId, quantity }`                      | Update item quantity      |
| `DELETE` | `/api/cart` | Kinde  | `?id={cartItemId}`                          | Remove item from cart     |

### Checkout and Payments

| Method | Endpoint                     | Auth   | Body                                                                 | Description                          |
|--------|------------------------------|--------|----------------------------------------------------------------------|--------------------------------------|
| `POST` | `/api/checkout`              | Cookie | Simple checkout body                                                 | Direct checkout (simple flow)        |
| `POST` | `/api/payments/create-order` | Kinde  | `{ shipping_address }`                                               | Create Razorpay order + DB order     |
| `POST` | `/api/payments/verify`       | Public | `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id }` | Verify Razorpay payment signature    |

### Orders

| Method | Endpoint       | Auth   | Description                                |
|--------|---------------|--------|--------------------------------------------|
| `GET`  | `/api/orders` | Cookie | Get authenticated user's order history     |

### Profile

| Method  | Endpoint                | Auth   | Body / Params                                                    | Description                          |
|---------|------------------------|--------|-------------------------------------------------------------------|--------------------------------------|
| `GET`   | `/api/patient/profile` | Public | `?uid={userId}`                                                  | Fetch user + patient/doctor profile  |
| `PATCH` | `/api/patient/profile` | Public | `{ uid, user: { name, phone, profile_image_url }, patient: { address_line1, ... } }` | Update profile (role-aware)          |

### File Upload

| Method | Endpoint       | Auth | Description                    |
|--------|---------------|------|--------------------------------|
| `POST` | `/api/upload` | --   | Upload image to Nhost storage  |

### Admin -- Delivery Management

| Method | Endpoint                                     | Auth  | Body                      | Description                           |
|--------|----------------------------------------------|-------|---------------------------|---------------------------------------|
| `GET`  | `/api/admin/delivery-boys/available`         | Admin | --                        | List active delivery agents + stats   |
| `GET`  | `/api/admin/orders/pending-delivery`         | Admin | --                        | Orders with status PENDING_DELIVERY   |
| `POST` | `/api/admin/orders/{orderId}/assign`         | Admin | `{ deliveryBoyId }`       | Assign agent, set status to ASSIGNED  |

---

## Database Schema

```
+------------------+       +------------------+       +-------------------+
|     users        |       |    patients      |       |     doctors       |
+------------------+       +------------------+       +-------------------+
| uid (PK)         |<---+  | pid (PK)         |       | did (PK)          |
| auth_id          |    |  | uid (FK->users)  |       | uid (FK->users)   |
| name             |    |  | address_line1    |       | address_line1     |
| email            |    |  | address_line2    |       | address_line2     |
| phone            |    |  | city             |       | city              |
| role             |    |  | state            |       | state             |
| profile_image_url|    |  | postal_code      |       | postal_code       |
+------------------+    |  +------------------+       +-------------------+
       |                |
       |   +------------+-------------------------------------------+
       |   |                                                        |
       v   v                                                        |
+------------------+       +------------------+                     |
|    medicines     |       |     carts        |                     |
+------------------+       +------------------+                     |
| id (PK, UUID)    |       | id (PK, UUID)    |                     |
| name             |       | user_id (FK)     |---> users.uid       |
| description      |       | created_at       |                     |
| category         |       | updated_at       |                     |
| price            |       +--------+---------+                     |
| stock_quantity   |                |                               |
| manufacturer     |                v                               |
| dosage           |       +------------------+                     |
| image_url        |       |   cart_items     |                     |
| created_at       |       +------------------+                     |
+--------+---------+       | id (PK, UUID)    |                     |
         |                 | cart_id (FK)     |---> carts.id        |
         |                 | medicine_id (FK) |---> medicines.id    |
         |                 | quantity         |                     |
         |                 | created_at       |                     |
         |                 +------------------+                     |
         |                                                          |
         |                 +------------------+                     |
         |                 |     orders       |                     |
         |                 +------------------+                     |
         |                 | id (PK, UUID)    |                     |
         |                 | order_number     |                     |
         |                 | user_id (FK)     |---> users.uid       |
         |                 | status           |                     |
         |                 | total_amount     |                     |
         |                 | shipping_address |  (JSONB)            |
         |                 | customer_name    |                     |
         |                 | customer_phone   |                     |
         |                 | assigned_to_     |                     |
         |                 |  delivery_boy_id |---> delivery_agents |
         |                 | assigned_at      |                     |
         |                 | created_at       |                     |
         |                 | updated_at       |                     |
         |                 +--------+---------+                     |
         |                          |                               |
         |                          v                               |
         |                 +------------------+                     |
         +---------------->|   order_items    |                     |
                           +------------------+                     |
                           | id (PK, UUID)    |                     |
                           | order_id (FK)    |---> orders.id       |
                           | medicine_id (FK) |---> medicines.id    |
                           | quantity         |                     |
                           | price_at_purchase|                     |
                           | created_at       |                     |
                           +------------------+                     |
                                                                    |
+---------------------------+    +---------------------------+      |
|   finance_transactions    |    |        receipts           |      |
+---------------------------+    +---------------------------+      |
| transaction_id (PK)       |    | receipt_id (PK)           |      |
| pid (FK->patients)        |    | transaction_id (FK)       |      |
| transaction_type           |    | pid (FK->patients)        |      |
| amount                    |    | did                       |      |
| currency                  |    | patient_name              |      |
| status                    |    | doctor_name               |      |
| razorpay_order_id         |    | consultation_fee          |      |
| razorpay_payment_id       |    | total_amount              |      |
| razorpay_signature        |    | payment_method            |      |
| payment_method            |    | razorpay_payment_id       |      |
| description               |    +---------------------------+      |
| paid_at                   |                                       |
+---------------------------+    +---------------------------+      |
                                 |   delivery_agents         |      |
                                 +---------------------------+      |
                                 | id (PK)                   |      |
                                 | name                      |      |
                                 | email                     |      |
                                 | phone                     |      |
                                 | is_available              |      |
                                 | is_active                 |      |
                                 | total_deliveries_completed|      |
                                 | average_rating            |      |
                                 +---------------------------+      |
```

### Row-Level Security (RLS)

The `setup.sql` file enables RLS on core tables:

- **medicines**: Publicly readable by everyone
- **carts**: Users can only view/insert/update their own cart
- **cart_items**: Users can only CRUD items in their own cart
- **orders**: Users can only view/insert their own orders
- **order_items**: Users can only view items for their own orders

### Indexes

| Index                      | Table      | Column     |
|----------------------------|------------|------------|
| `medicines_name_idx`       | medicines  | name       |
| `medicines_category_idx`   | medicines  | category   |

### Seed Data

The `setup.sql` includes sample medicines:

| Name         | Category     | Price   | Dosage  | Stock |
|--------------|-------------|---------|---------|-------|
| Paracetamol  | Pain Relief | 5.00    | 500mg   | 100   |
| Amoxicillin  | Antibiotics | 12.50   | 250mg   | 50    |
| Ibuprofen    | Pain Relief | 8.75    | 200mg   | 75    |
| Cetirizine   | Allergy     | 6.00    | 10mg    | 120   |
| Vitamin C    | Vitamins    | 15.00   | 1000mg  | 200   |

---

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

### Database

| Variable       | Description                          | Example                                       |
|----------------|--------------------------------------|-----------------------------------------------|
| `DATABASE_URL` | Neon PostgreSQL connection string    | `postgres://user:pass@host.neon.tech/dbname`  |

### Kinde Authentication

| Variable                              | Description                          |
|---------------------------------------|--------------------------------------|
| `KINDE_CLIENT_ID`                     | Kinde application client ID          |
| `KINDE_CLIENT_SECRET`                 | Kinde application client secret      |
| `KINDE_ISSUER_URL`                    | Kinde issuer domain URL              |
| `KINDE_SITE_URL`                      | Application base URL (http://localhost:3004) |
| `KINDE_POST_LOGOUT_REDIRECT_URL`     | Redirect URL after logout            |
| `KINDE_POST_LOGIN_REDIRECT_URL`      | Redirect URL after login (/auth-callback) |

### Razorpay Payment Gateway

| Variable                        | Description                          |
|---------------------------------|--------------------------------------|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`   | Razorpay public key (client-side)    |
| `RAZORPAY_KEY_SECRET`           | Razorpay secret key (server-side)    |

### Nhost File Storage

| Variable                              | Description                          |
|---------------------------------------|--------------------------------------|
| `NEXT_PUBLIC_NHOST_SUBDOMAIN`         | Nhost project subdomain              |
| `NEXT_PUBLIC_NHOST_REGION`            | Nhost project region                 |

### Example `.env.local`

```env
# Database
DATABASE_URL=postgres://username:password@ep-xxx.us-east-2.aws.neon.tech/aurasutra

# Kinde Auth
KINDE_CLIENT_ID=your_client_id
KINDE_CLIENT_SECRET=your_client_secret
KINDE_ISSUER_URL=https://your-app.kinde.com
KINDE_SITE_URL=http://localhost:3004
KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3004
KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3004/auth-callback

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Nhost
NEXT_PUBLIC_NHOST_SUBDOMAIN=your_subdomain
NEXT_PUBLIC_NHOST_REGION=ap-south-1
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** (comes with Node.js)
- **PostgreSQL** database (Neon recommended)
- **Kinde** account with Google OAuth configured
- **Razorpay** account (test or live keys)
- **Nhost** project for file storage

### Installation

1. **Clone the repository** and navigate to the marketplace module:

   ```bash
   cd marketPlace_view/MarketPlace
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Copy the example above into a `.env.local` file in the `MarketPlace/` root directory.

4. **Initialize the database:**

   Run the SQL setup script against your PostgreSQL instance:

   ```bash
   psql $DATABASE_URL -f setup.sql
   ```

   This will:
   - Enable the `uuid-ossp` extension
   - Create tables: `medicines`, `carts`, `cart_items`, `orders`, `order_items`
   - Create indexes on `medicines.name` and `medicines.category`
   - Enable Row-Level Security policies
   - Insert seed medicine data

5. **Start the development server:**

   ```bash
   npm run dev
   ```

   The application will start on **http://localhost:3004** (Turbopack disabled, using Webpack).

6. **Open in browser:**

   Navigate to `http://localhost:3004/marketplace` to browse the medicine catalog.

---

## Available Scripts

| Command             | Description                                           |
|---------------------|-------------------------------------------------------|
| `npm run dev`       | Start dev server on port 3004 (Turbopack disabled)    |
| `npm run dev:webpack` | Start dev server with Webpack (HTTPS disabled)      |
| `npm run build`     | Create production build                               |
| `npm run start`     | Start production server                               |
| `npm run lint`      | Run ESLint checks                                     |

---

## Fonts and Theming

AuraMart uses three Google Fonts loaded via `next/font/google`:

| Font                   | CSS Variable                    | Usage                          |
|------------------------|---------------------------------|--------------------------------|
| Poppins                | `--font-poppins`                | Primary UI font (all weights)  |
| Noto Sans Devanagari   | `--font-noto-sans-devanagari`   | Hindi/Devanagari script support|
| Alatsi                 | `--font-alatsi`                 | Display/accent font            |

### Design System

- **Primary color**: Emerald/Teal gradient (`emerald-600` to `teal-600`)
- **Glassmorphism**: `bg-white/80 backdrop-blur-md` on navbar and cards
- **Cards**: Rounded corners (`rounded-2xl`), subtle shadows, glass effect
- **Animations**: `animate-fadeIn`, `animate-pulse-primary`, slide-in transitions
- **Responsive**: Mobile-first with hamburger menu for smaller screens

---

## Image Hosting

The `next.config.ts` allows remote images from the following domains:

| Domain                                              | Purpose                     |
|-----------------------------------------------------|-----------------------------|
| `placehold.co`                                      | Placeholder/seed images     |
| `images.unsplash.com`                               | Stock photography           |
| `ynwkhelqhehjlxlhhjfj.storage.ap-south-1.nhost.run`| Nhost file storage (uploads)|

SVG rendering is enabled via `dangerouslyAllowSVG: true`.

---

## Database Connection

The PostgreSQL connection is configured in `src/lib/db.ts` with the following pool settings:

| Setting            | Value | Description                          |
|--------------------|-------|--------------------------------------|
| `ssl`              | `true`| TLS enabled (rejectUnauthorized: false) |
| `max`              | `10`  | Maximum connections in pool          |
| `idle_timeout`     | `20`  | Seconds before idle connection closes|
| `connect_timeout`  | `10`  | Seconds before connection attempt fails|

The connection URL is parsed from the `DATABASE_URL` environment variable, with the password URL-decoded to handle special characters.

---

## Component Reference

| Component                    | Type    | Description                                           |
|------------------------------|---------|-------------------------------------------------------|
| `Navbar`                     | Client  | Sticky glassmorphism header with cart badge, user menu, mobile hamburger |
| `MarketplaceLayoutClient`    | Client  | Wraps marketplace pages with live profile state and navbar |
| `MedicineCard`               | Client  | Product card with image, name, price, category, stock badge |
| `AddToCartButton`            | Client  | Add-to-cart with authentication check and loading state |
| `CartList`                   | Client  | Full cart display with quantity +/- controls and item removal |
| `CheckoutForm`               | Client  | Two-column checkout: shipping address + Razorpay payment |
| `SearchBar`                  | Client  | Search input that syncs with URL search parameters |
| `RealtimeMedicines`          | Client  | Wraps medicine list with 5-second polling refresh |
| `RefreshButton`              | Client  | Manual page refresh trigger button |
| `ProfileEditModal`           | Client  | Modal overlay for editing name, phone, image, and address |

---

*Part of the AuraSutra Healthcare Platform*
