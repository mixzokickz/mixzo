# MIXZO EXECUTION PLAN — Botskii

## Client: Troy (Denver, CO)
- Online sneaker seller (new + preowned) + sneaker cleaning service
- Instagram: @mixzo.Kickz
- Phone: 720-720-5015
- Email: Mixzo.kickz@gmail.com
- All sales final, shipping only, card payments via Stripe (keys later)

## NEW FEATURE: Sneaker Cleaning Service
- Customers create account → submit cleaning request
- Upload photos of dirty sneakers
- Select service tier (Basic Clean / Deep Clean / Full Restoration)
- Get quote, approve, ship sneakers to Troy
- Troy cleans, sends before/after photos
- Ships back to customer
- Requires: cleaning_requests table in Supabase

## SQL NEEDED (for Aidan to run):
New tables for features not yet in DB:
- cleaning_requests (id, user_id, status, service_tier, price, photos, before_photos, after_photos, notes, shipping_address, tracking_in, tracking_out, created_at)
- wishlists (id, user_id, product_id, created_at)
- reviews (id, user_id, product_id, rating, text, status, created_at)
- contact_messages (already exists)
- gift_cards (already exists)
- notification_subscribers (already exists)
- carts (already exists per schema check)

## Execution Order (5 parallel agents)

### Agent 1: Design System + Core UI Components
- Rewrite globals.css with premium design tokens
- Rewrite button.tsx — solid pink primary, NO gradient
- Rewrite card.tsx — glass option, better borders
- Rewrite input.tsx — cleaner focus states
- Rewrite badge.tsx — refined condition badges
- Rewrite skeleton.tsx — shimmer loading
- Rewrite modal.tsx — slide-up sheet style
- Add proper Inter font loading in layout.tsx
- Premium design: rounded-2xl, subtle shadows, hover-lift

### Agent 2: Storefront Pages (Customer-Facing)
- Homepage — bold hero, trust signals, product grid
- Shop page — filters, search, sort, empty state
- Product detail — gallery, add to cart, related
- Cart — quantities, discount codes
- Checkout — form, summary, Stripe placeholder
- Confirmation — order success
- Login/Signup — premium auth pages
- About page (NEW) — Troy's story, Denver, cleaning service pitch

### Agent 3: Admin Panel Overhaul
- Dashboard — proper stat cards, chart, recent orders
- Sidebar — clean sections, active indicators, mobile collapse
- All admin pages polished with consistent design
- Cleaning service admin (NEW) — manage cleaning requests

### Agent 4: New Features
- Sneaker Cleaning Service pages:
  - /cleaning — service landing page (tiers, pricing, how it works)
  - /cleaning/request — submit cleaning request (auth required)
  - /account/cleaning — view cleaning request status
  - /admin/cleaning — manage requests, upload before/after photos
  - API routes for cleaning CRUD
- SEO: metadata exports, JSON-LD, sitemap, robots.txt
- Custom 404 page
- Contact page polish

### Agent 5: Dead-End Audit + Final Polish
- Check every link, every button, every navigation path
- Verify all pages render without errors
- Mobile responsive check on all pages
- Loading states on every page
- Empty states on every page
- Error handling everywhere
