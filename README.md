# Guardify IT

**Premium Digital Subscription Marketplace for Bangladesh**

A full-stack e-commerce platform for purchasing digital subscriptions, AI tools, automation scripts, and security solutions — with local mobile banking payment integration (bKash, Nagad, Rocket).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16.1.3 (App Router) |
| **UI** | React 19.2.3, CSS Modules, Lucide React |
| **Backend** | Supabase (PostgreSQL, Auth, Storage) |
| **i18n** | Custom route-based (English + Bengali) |
| **Deployment** | Vercel |

## Features

### Customer-Facing
- 🛒 Product catalog with category filtering and search
- 💳 Guest checkout + registered user checkout
- 📱 bKash/Nagad/Rocket payment proof upload
- ❤️ Wishlist (synced via Supabase)
- 📦 Order tracking with status updates
- 🌐 Bilingual UI (English / বাংলা)
- 🌙 Dark/Light theme toggle
- 💬 WhatsApp support button

### Admin Panel
- 📊 Dashboard with order/revenue metrics
- 📦 Product CRUD (with image upload)
- 📂 Category management
- 📋 Order management
- ✅ Payment verification (approve/reject)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase project ([supabase.com](https://supabase.com))

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/sTechWise/guardify-it.git
   cd guardify-it
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create `.env.local` with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Set up database**
   Run `schema.sql` in the Supabase SQL Editor to create all tables, policies, functions, and storage buckets.

5. **Seed data (optional)**
   Run `seed.sql` in the Supabase SQL Editor to populate sample categories and products.

6. **Start development server**
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── actions/          # Server actions (createOrder)
├── app/
│   ├── api/          # API routes (contact, guest-checkout)
│   ├── auth/         # Auth callback
│   └── [lang]/       # i18n routes
│       ├── admin/    # Admin panel (dashboard, products, orders, payments, categories)
│       ├── products/ # Product catalog + detail pages
│       ├── cart/     # Shopping cart
│       ├── checkout/ # Checkout flow
│       └── ...       # About, FAQ, Contact, Terms, Privacy, etc.
├── components/       # 22 React components with CSS Modules
├── context/          # Auth, Cart, Theme, Toast, Wishlist providers
├── hooks/            # Custom hooks (useClientDictionary)
├── lib/              # Database queries, dictionary loader, Supabase client
├── locales/          # en/bn translation JSON files
├── types/            # TypeScript type definitions
└── utils/            # Supabase client/server/middleware utilities
```

## Database

See [`schema.sql`](./schema.sql) for the complete database schema including:
- 6 tables: `categories`, `products`, `orders`, `payment_proofs`, `user_roles`, `wishlists`
- Row Level Security (RLS) policies
- 8 PostgreSQL functions (admin checks, payment processing, guest order linking)
- 2 storage buckets (`product-images`, `payment-proofs`)

## Order Lifecycle

```
pending_payment → payment_submitted → paid → completed
                                    → payment_failed
                                    → cancelled
```

## License

Private — © sTechWise
