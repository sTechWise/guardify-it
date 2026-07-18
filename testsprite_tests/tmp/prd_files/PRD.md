# Guardify IT - Product Specification Document

**Version:** 1.0  
**Last Updated:** February 7, 2026  
**Status:** Active Development

---

## 1. Executive Summary

**Guardify IT** is a digital subscription e-commerce platform tailored for the Bangladesh market. It enables users to purchase premium digital subscriptions, automation scripts, AI tools, and security solutions through a streamlined, mobile-first experience with local payment integration (bKash, Nagad, Rocket).

### Key Value Propositions

- **Instant Delivery** — Subscriptions activated within minutes
- **Local Payment Methods** — bKash, Nagad, Rocket mobile banking
- **Guest Checkout** — No account required for purchases
- **Bilingual Experience** — Full English (en) and Bengali (bn) support
- **30-Day Warranty** — All products include replacement guarantee

---

## 2. Product Overview

### 2.1 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16.1.3, React 19.2.3 |
| **Backend** | Supabase (PostgreSQL, Auth, Storage) |
| **Styling** | CSS Modules, Lucide React icons |
| **i18n** | Custom locale system (en/bn) |
| **Deployment** | Vercel |

### 2.2 Product Categories

1. **Digital Subscriptions** — Streaming, productivity, cloud services
2. **Automation Scripts** — Task automation, workflow tools
3. **AI Bots** — Chatbots, AI assistants, automation bots
4. **Security Tools** — Antivirus, VPN, privacy tools

---

## 3. Core Features

### 3.1 Customer-Facing Features

| Feature | Description |
|---------|-------------|
| **Product Catalog** | Browse products with filtering by category |
| **Product Details** | Detailed product pages with pricing, descriptions, warranty info |
| **Shopping Cart** | Add/remove items, view subtotal, proceed to checkout |
| **Wishlist** | Save products for later purchase |
| **Guest Checkout** | Complete purchases without creating an account |
| **User Authentication** | Sign up, login, password reset via Supabase Auth |
| **My Orders** | Track order status and payment verification |
| **Payment Proof Upload** | Upload mobile banking transaction screenshots |
| **Language Switcher** | Toggle between English and Bengali |

### 3.2 Admin Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Overview of orders, revenue, and metrics |
| **Product Management** | Create, edit, delete products |
| **Category Management** | Manage product categories |
| **Order Management** | View and update order statuses |
| **Payment Verification** | Review and approve/reject payment proofs |

---

## 4. User Flows

### 4.1 Guest Purchase Flow

```
Browse Products → Add to Cart → Checkout (email only)
    → Payment Instructions (bKash/Nagad/Rocket)
    → Upload Payment Proof → Admin Verification
    → Order Completed (email notification)
```

### 4.2 Registered User Flow

```
Login/Sign Up → Browse Products → Add to Cart
    → Checkout → Payment → Upload Proof
    → Track in "My Orders" → Receive Product
```

### 4.3 Admin Verification Flow

```
New Payment Proof → Review Screenshot & Transaction ID
    → Verify/Reject → Update Order Status
    → Customer Notified
```

---

## 5. Database Schema

### 5.1 Core Tables

#### `products`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Product name |
| `description` | TEXT | Product description |
| `price` | NUMERIC | Product price |
| `image_url` | TEXT | Product image URL |
| `category` | TEXT | Product category |
| `created_at` | TIMESTAMP | Creation timestamp |

#### `orders`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_email` | TEXT | Customer email |
| `total_amount` | NUMERIC | Order total |
| `status` | TEXT | pending, verifying_payment, verified, rejected, completed |
| `user_id` | UUID | FK to auth.users (optional, for linking guest orders) |
| `created_at` | TIMESTAMP | Order timestamp |

#### `payment_proofs`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `order_id` | UUID | FK to orders |
| `user_email` | TEXT | Customer email |
| `transaction_id` | TEXT | Mobile banking transaction ID |
| `screenshot_url` | TEXT | Screenshot of payment proof |
| `status` | TEXT | pending, verified, rejected |
| `created_at` | TIMESTAMP | Submission timestamp |

#### `user_roles`

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | FK to auth.users |
| `role` | TEXT | admin, user |

---

## 6. Security & RLS Policies

### Row Level Security (RLS)

| Table | Policy | Description |
|-------|--------|-------------|
| **products** | Public read | Anyone can view products |
| **products** | Admin manage | Only admins can CRUD products |
| **orders** | Users view own | Users see only their orders |
| **orders** | Admins view all | Admins see all orders |
| **payment_proofs** | Users view/upload own | Users manage their proofs |
| **payment_proofs** | Admins manage all | Full admin access |

---

## 7. Payment Integration

### Supported Payment Methods

| Provider | Type | Number Format |
|----------|------|---------------|
| **bKash** | Send Money | 019XXXXXXXX |
| **Nagad** | Send Money | 019XXXXXXXX |
| **Rocket** | Send Money | 019XXXXXXXX |

### Payment Flow

1. Customer places order → sees payment instructions
2. Customer sends money via mobile banking app
3. Customer uploads screenshot + transaction ID
4. Admin reviews and verifies payment
5. Order marked as completed, customer notified

---

## 8. Internationalization (i18n)

### Supported Locales

- **English (en)** — Default
- **Bengali (bn)** — বাংলা

### Implementation

- Route-based: `/{lang}/products`, `/{lang}/cart`
- Dictionary-based translations in `/src/locales/{lang}/common.json`
- 220+ translation keys covering all UI elements

---

## 9. Page Structure

### Public Pages

| Route | Purpose |
|-------|---------|
| `/[lang]` | Homepage with hero, categories, flash deals |
| `/[lang]/products` | Product catalog |
| `/[lang]/products/[id]` | Product detail page |
| `/[lang]/cart` | Shopping cart |
| `/[lang]/checkout` | Checkout page |
| `/[lang]/payment-instructions` | Mobile banking instructions |
| `/[lang]/upload-proof` | Payment proof upload |
| `/[lang]/my-orders` | User's order history |
| `/[lang]/wishlist` | Saved products |
| `/[lang]/login` | Authentication |
| `/[lang]/forgot-password` | Password reset request |
| `/[lang]/reset-password` | Set new password |
| `/[lang]/contact` | Contact form |
| `/[lang]/about` | About us |
| `/[lang]/faq` | FAQs |
| `/[lang]/terms` | Terms of service |
| `/[lang]/privacy` | Privacy policy |

### Admin Pages

| Route | Purpose |
|-------|---------|
| `/[lang]/admin` | Dashboard overview |
| `/[lang]/admin/products` | Product management |
| `/[lang]/admin/orders` | Order management |
| `/[lang]/admin/payments` | Payment verification |
| `/[lang]/admin/categories` | Category management |

---

## 10. Components Architecture

### Core Components

| Component | Purpose |
|-----------|---------|
| `Navbar` | Navigation, search, cart, language toggle |
| `Hero` | Homepage hero section |
| `CategoryGrid` | Product category display |
| `FlashDeal` | Limited-time offers with countdown |
| `ProductCard` | Product listing card |
| `CartModal` | Shopping cart overlay |
| `AuthForm` | Login/signup forms |
| `ProductForm` | Admin product editor |
| `AdminLayout` | Admin panel layout wrapper |
| `Footer` | Site footer with links |

### UI Components

| Component | Purpose |
|-----------|---------|
| `Toast` | Notification messages |
| `LanguageSwitcher` | en/bn toggle |
| `ThemeToggle` | Dark/light mode |
| `WhatsAppButton` | Floating support button |
| `AddToCartButton` | Product add-to-cart action |

---

## 11. API Endpoints

### Supabase RPC Functions

| Function | Purpose |
|----------|---------|
| `get_order_summary(order_id)` | Get order details for proof upload |
| `submit_payment_proof(...)` | Submit payment proof with validation |

### Auth Endpoints (Supabase Auth)

- Sign up with email/password
- Sign in with email/password
- Password reset flow
- Session management

---

## 12. Non-Functional Requirements

### Performance

- Server-side rendering (SSR) with Next.js
- Optimized images with Next.js Image
- Lazy loading for off-screen content

### Accessibility

- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support

### Mobile Responsiveness

- Mobile-first design approach
- Responsive layouts for all screen sizes
- Touch-friendly interactions

### SEO

- Meta tags and descriptions
- Semantic HTML elements
- Proper heading hierarchy

---

## 13. Future Roadmap

| Priority | Feature | Description |
|----------|---------|-------------|
| P1 | Email Notifications | Automated order/payment emails |
| P1 | Product Variants | Duration/tier options for subscriptions |
| P2 | Search & Filtering | Advanced product search |
| P2 | Reviews & Ratings | Customer product reviews |
| P2 | Coupon System | Discount codes and promotions |
| P3 | Analytics Dashboard | Admin sales analytics |
| P3 | Multi-currency | USD/BDT support |
| P3 | Mobile App | React Native companion app |

---

## 14. Success Metrics

| Metric | Target |
|--------|--------|
| **Conversion Rate** | > 3% |
| **Cart Abandonment** | < 60% |
| **Payment Proof Submission** | 90% within 24h |
| **Order Completion** | > 95% |
| **Page Load Time** | < 3 seconds |
| **Customer Satisfaction** | > 4.5/5 |

---

## 15. Contact & Support

- **WhatsApp:** 24/7 customer support integration
- **Email:** Supabase Auth-linked communications
- **Admin Panel:** Order/payment management

---

> **Note:** This PRD is a living document and should be updated as the product evolves. All stakeholders should review changes before implementation.
