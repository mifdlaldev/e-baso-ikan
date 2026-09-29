# E-Baso — E-commerce for a Food Business

An e-commerce web application for a fish-ball (bakso ikan) food business.
Customers order online; the owner manages products and orders from an admin
dashboard.

## Features

- **Product catalog** — menu with categories and product details
- **Cart & checkout** — add to cart, review, and place an order
- **Order tracking** — customers view their own orders ("Pesanan Saya")
- **Admin dashboard** — manage products, orders, and sales reports with charts
- **Authentication** — customer accounts with protected routes
- **Sales analytics** — visual reporting with Recharts

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Database & auth | Supabase |
| Charts | Recharts |
| Styling | Tailwind CSS |
| Icons | Lucide |

## Project structure

```
src/
├── app/
│   ├── menu/          # product catalog
│   ├── cart/          # shopping cart
│   ├── checkout/      # order checkout
│   ├── orders/        # order list
│   ├── pesanan-saya/  # customer's own orders
│   ├── admin/         # admin dashboard
│   ├── auth/          # login / register
│   └── api/           # route handlers
├── components/        # UI components
├── context/           # app state
├── hooks/             # custom hooks
└── lib/               # Supabase client and helpers
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and add your Supabase keys.
3. Apply the schema in `supabase/`.
4. Start the dev server:
   ```bash
   npm run dev
   ```

## Notes

Vocational competency (ujikom) project — a complete e-commerce flow from
catalog to checkout to admin reporting.
