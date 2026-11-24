# LalBazar 🛒

> **LalBazar (লালবাজার)** — A complete, production-ready e-commerce platform for Bangladesh, inspired by the layout and shopping experience of Ghorer Bazar.

[![Built with Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Demo Credentials](#demo-credentials)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Payment & Delivery](#payment--delivery)
- [Admin Dashboard](#admin-dashboard)
- [Deployment](#deployment)
- [License](#license)

---

## Overview

LalBazar is a full-stack e-commerce web application built for the Bangladesh market. It supports **Bangladeshi Taka (৳ BDT)**, **Bengali + English** bilingual content, and Bangladesh-specific payment methods (Cash on Delivery, bKash, Nagad, SSLCommerz).

The platform includes a complete customer shopping experience and a full-featured admin dashboard for managing products, orders, customers, banners, coupons, and store settings.

### Brand Identity

| Property | Value |
|----------|-------|
| **Brand Name** | LalBazar (লালবাজার) |
| **Brand Type** | E-commerce / Online Shopping |
| **Target Market** | Bangladesh |
| **Currency** | Bangladeshi Taka (৳ BDT) |
| **Languages** | Bengali & English |
| **Primary Color** | `#E11D48` (Rose/Red) |
| **Font** | Hind Siliguri (Bengali) + Geist (Latin) |

---

## Features

### 🏠 Storefront

- **Homepage**: Hero banner carousel, flash sale countdown, category grid, featured products, best sellers, new arrivals, special offers, promo banners
- **Shop Page**: Sidebar filters (category tree, price range, brands, availability), sort (popularity, price, newest, rating), pagination, mobile filter sheet
- **Product Detail**: Image gallery with thumbnails, price with discount %, quantity selector, stock status, ratings & reviews, review submission, related products, shipping info
- **Search**: Live product search across name, description, tags, brand
- **Shopping Cart**: Add/remove/update quantities, coupon application, free-delivery progress bar, automatic totals
- **Checkout**: Customer info, district/area selection (all 64 districts), address management, 4 payment methods, order notes, live order summary
- **Order Confirmation**: Success page with order number, estimated delivery, order summary
- **Order Tracking**: Track by order number + phone, visual status timeline
- **Wishlist**: Save products, move all to cart
- **Customer Dashboard**: Profile, addresses (CRUD), order history, order tracking, wishlist, change password

### 🔐 Authentication

- Customer registration & login (bcrypt hashed passwords, signed session cookies)
- Admin authentication with role-based access
- Guest checkout supported
- Session persistence (7 days)

### 🛠️ Admin Dashboard

- **Dashboard**: Total revenue, orders, customers, products; 6-month revenue chart; order status distribution; recent orders; top selling products
- **Products**: Full CRUD, image URLs, categories, brands, pricing, stock, featured/bestseller/new arrival/special offer flags
- **Orders**: View all orders, filter by status, update status (Pending → Confirmed → Processing → Shipped → Delivered → Cancelled), auto tracking number generation
- **Customers**: List all customers with order history and total spent
- **Categories**: Add categories & subcategories with icons
- **Banners**: Add promotional banners (hero, middle, sidebar)
- **Coupons**: Create percentage/fixed discount coupons with min order, usage limits, expiry
- **Settings**: Store info, social links, delivery charges (inside/outside Dhaka, free delivery threshold), bKash/Nagad numbers

### 📱 Responsive Design

- Mobile-first design
- Desktop: Full sidebar navigation, mega-menu category dropdowns
- Mobile: Bottom navigation bar, slide-out filter sheet, hamburger menu
- Tablet: Optimized grid layouts

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | shadcn/ui (New York) + Lucide icons |
| **Database** | Prisma ORM + SQLite |
| **State Management** | Zustand (client) |
| **Authentication** | Custom session (bcrypt + signed cookies) |
| **Notifications** | Sonner toasts |
| **Fonts** | Geist (Latin) + Hind Siliguri (Bengali) |

---

## Demo Credentials

### Admin Account
```
Email: admin@lalbazar.com
Password: admin123
```

### Customer Account
```
Email: demo@lalbazar.com
Password: demo123
```

### Coupon Codes
| Code | Discount | Min Order |
|------|----------|-----------|
| `WELCOME10` | 10% off (max ৳200) | ৳500 |
| `LALBAZAR50` | ৳50 off | ৳500 |
| `MEGA100` | ৳100 off | ৳1000 |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ or **Bun** runtime
- **npm**, **yarn**, or **bun** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anisur2004r-bot/lalbazar-ecommerce.git
   cd lalbazar-ecommerce
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your `DATABASE_URL` and `SESSION_SECRET`.

4. **Set up the database**
   ```bash
   bun run db:push
   # or
   npx prisma db push
   ```

5. **Seed the database**
   ```bash
   bun run scripts/seed.ts
   # or
   npx tsx scripts/seed.ts
   ```
   This creates:
   - Admin & demo customer accounts
   - 9 categories + 30 subcategories
   - 41 sample products
   - 4 hero banners
   - 3 discount coupons
   - Default store settings

6. **Start the development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

7. **Open the app**
   Navigate to `http://localhost:3000`

---

## Database Schema

12 Prisma models:

| Model | Description |
|-------|-------------|
| `User` | Customers & admins (role-based) |
| `Category` | Parent-child category tree |
| `Product` | Products with images, pricing, stock, flags |
| `Review` | Product reviews & ratings |
| `Address` | Customer delivery addresses |
| `Cart` / `CartItem` | Shopping cart |
| `Wishlist` | Saved products |
| `Order` / `OrderItem` | Orders with status tracking |
| `Coupon` | Discount coupons |
| `Banner` | Promotional banners |
| `Settings` | Store configuration |
| `Notification` | User notifications |

---

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (filters, sort, pagination) |
| POST | `/api/products` | Create product (admin) |
| GET | `/api/products/[slug]` | Get product detail + related |
| PUT | `/api/products/[slug]` | Update product (admin) |
| DELETE | `/api/products/[slug]` | Delete product (admin) |
| GET | `/api/categories` | List category tree |
| POST | `/api/categories` | Create category (admin) |
| GET | `/api/banners` | List active banners |
| POST | `/api/banners` | Create banner (admin) |
| GET | `/api/settings` | Get store settings |
| PUT | `/api/settings` | Update settings (admin) |
| POST | `/api/auth/register` | Register new customer |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/orders` | List own/admin orders |
| POST | `/api/orders` | Place order |
| GET | `/api/orders/[id]` | Get order detail |
| PUT | `/api/orders/[id]` | Update order status (admin) |
| GET | `/api/orders/track` | Track order by number |
| POST | `/api/coupons/validate` | Validate coupon code |
| GET | `/api/wishlist` | Get wishlist |
| POST | `/api/wishlist` | Toggle wishlist item |
| POST | `/api/reviews` | Submit product review |
| GET | `/api/addresses` | List addresses |
| POST | `/api/addresses` | Create address |
| GET | `/api/admin/dashboard` | Dashboard stats (admin) |
| GET | `/api/admin/customers` | List customers (admin) |
| GET/POST | `/api/admin/coupons` | List/create coupons (admin) |

---

## Payment & Delivery

### Payment Methods

| Method | Status | Notes |
|--------|--------|-------|
| 💵 Cash on Delivery (COD) | ✅ Fully working | Pay on delivery |
| 📱 bKash | ✅ Instructions shown | Send money to merchant number |
| 📲 Nagad | ✅ Instructions shown | Send money to merchant number |
| 💳 SSLCommerz | 🔧 Ready for integration | Add credentials in `.env` |

### Delivery

| Area | Charge | Time |
|------|--------|------|
| Inside Dhaka | ৳60 | 24-48 hours |
| Outside Dhaka | ৳120 | 3-7 business days |
| Free Delivery | ৳0 | Orders above ৳2,000 |

---

## Admin Dashboard

Access the admin dashboard by logging in with the admin credentials, then clicking "Admin Panel" in the header.

### Dashboard Sections

1. **Dashboard** — Revenue chart, stat cards, recent orders, top products
2. **Products** — Full CRUD with add/edit dialog
3. **Orders** — Filter, view detail, update status
4. **Customers** — List with order history
5. **Categories** — Add categories/subcategories
6. **Banners** — Add promotional banners
7. **Coupons** — Create discount coupons
8. **Settings** — Store info, delivery charges, payment numbers

---

## Deployment

### Deploy to Vercel (recommended)

1. Push to GitHub
2. Import the repo at [vercel.com](https://vercel.com/new)
3. Add environment variables:
   - `DATABASE_URL` — PostgreSQL connection string (use [Supabase](https://supabase.com/) or [Neon](https://neon.tech/))
   - `SESSION_SECRET` — Random string
4. Deploy

### Switch to PostgreSQL

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Run `npx prisma db push`
3. Run seed script

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Credits

- **Brand**: LalBazar (লালবাজার)
- **Built with**: Next.js, TypeScript, Tailwind CSS, Prisma, shadcn/ui
- **Inspired by**: [Ghorer Bazar](https://ghorerbazar.com/) layout and shopping experience
- **Made in**: Bangladesh 🇧🇩

---

<p align="center">
  <strong>LalBazar</strong> — Your Daily Shopping Companion<br>
  লালবাজার — আপনার দৈনন্দিন কেনাকাটার সঙ্গী
</p>
