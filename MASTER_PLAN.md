# MIXZO MASTER PLAN

## Overview
MixzoKickz.com — Online sneaker store (new + preowned) for Troy in Denver, CO.
Fork of Dave App (SecuredTampa) stripped to sneakers-only, Miami Vice themed.

## Theme: Miami Vice
- **Primary Pink:** #FF2D78 (hot pink / vice pink)
- **Primary Blue:** #00C2FF (electric blue / vice blue)
- **Dark BG:** #0A0A0F (near-black with blue tint)
- **Card BG:** #12121A
- **Border:** #1E1E2E
- **Text Primary:** #FFFFFF
- **Text Secondary:** #A0A0B0
- **Gradient:** linear-gradient(135deg, #FF2D78, #00C2FF)
- **Accent glow:** Pink/blue neon shadows
- **Vibe:** Dark mode, neon accents, clean streetwear, modern Miami Vice energy

## Tech Stack
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS v4
- Supabase (Auth + DB + Storage + Edge Functions)
- StockX API (product catalog)
- Stripe (future)
- Resend (future — transactional emails)
- Shipping API (future — GoShippo or similar)

## Architecture (from Dave App)
```
src/
  app/
    (auth)/login/page.tsx
    (auth)/signup/page.tsx
    admin/
      page.tsx (dashboard)
      scan/page.tsx (barcode + manual lookup)
      inventory/page.tsx
      products/page.tsx
      products/detail/page.tsx
      orders/page.tsx
      customers/page.tsx
      settings/page.tsx
      analytics/page.tsx
      daily-deals/page.tsx
    shop/page.tsx (customer storefront)
    product/[id]/page.tsx
    cart/page.tsx
    checkout/page.tsx
    returns/page.tsx
    api/
      auth/role/route.ts
      stockx/search/route.ts
      stockx/auth/route.ts
      admin/products/route.ts
      admin/orders/route.ts
    layout.tsx
  components/
    admin/ (sidebar, scan-form, image-upload, stockx-search-modal)
    shop/ (shop-page, filter-tabs, product-card)
    layout/ (header, footer)
    ui/ (shadcn components)
  lib/
    supabase.ts (client)
    supabase-server.ts (server client)
    stockx.ts (API wrapper)
    constants.ts
    utils.ts
  types/
    product.ts
    admin.ts
  actions/
    scan.ts
    barcode.ts
    inventory.ts
```

## Database Schema (Supabase)
Core tables (adapted from Dave App, no Pokemon):
- profiles (id, email, role, full_name, phone, created_at)
- products (id, name, barcode, sku, brand, category, condition, size, price, cost, quantity, images, tags, stockx_id, stockx_url, market_price, description, status, created_at)
- orders (id, user_id, items, total, subtotal, shipping_cost, status, shipping_address, tracking_number, notes, created_at)
- order_items (id, order_id, product_id, quantity, price)
- daily_deals (id, product_id, original_price, sale_price, active, created_at)
- discount_codes (id, code, type, value, min_order, max_uses, uses, active, expires_at)
- settings (id, key, value)

## Waves

### Wave 1: Foundation (Day 1-2)
- [x] Clone repo, scaffold Next.js project
- [ ] Supabase schema migration (all tables)
- [ ] Auth system (login/signup with role-based access)
- [ ] Admin layout + sidebar (Miami Vice themed)
- [ ] Shop layout + header/footer
- [ ] Supabase client/server setup
- [ ] Environment variables
- [ ] Basic routing

### Wave 2: Core Features (Day 3-5)
- [ ] Scan system (3 tabs: camera, type/scan gun, manual lookup)
- [ ] StockX integration (search, product lookup, auto-fill)
- [ ] Product management (CRUD, images, variants)
- [ ] Inventory page (filters, search, bulk actions)
- [ ] Shop storefront (product grid, filters, search)
- [ ] Product detail page
- [ ] Cart system
- [ ] Image upload for preowned shoes

### Wave 3: Orders & Polish (Day 6-8)
- [ ] Order system (create, track, fulfill)
- [ ] Customer management
- [ ] Daily deals system
- [ ] Discount codes
- [ ] Analytics dashboard
- [ ] Settings page
- [ ] Returns page ("All Sales Are Final")
- [ ] Mobile responsive everything

### Wave 4: Shipping & Payments (Day 9-10)
- [ ] Shipping integration placeholder (API routes ready)
- [ ] Stripe integration placeholder
- [ ] Order confirmation emails placeholder (Resend)
- [ ] SEO meta tags
- [ ] OG image
- [ ] Final polish + deploy

### Wave 5: Future / Upsells
- [ ] Whatnot API integration
- [ ] Stripe live payments
- [ ] Resend transactional emails
- [ ] GoShippo shipping labels
- [ ] Push notifications
- [ ] Advanced analytics

## Key Differences from Dave App
1. NO Pokemon (no cards, no grading, no Pokemon Hub)
2. NO in-store pickup (shipping only)
3. NO Clover POS
4. Miami Vice theme (not Broncos)
5. Different branding, logo, colors
6. Different StockX API keys
7. Simpler — just sneakers, new and preowned

## Deployment
- GitHub: AidanFromm/Mixzo → push triggers Vercel
- Vercel: Create project after initial push
- Domain: MixzoKickz.com → Vercel DNS
- Supabase: afmtwymcqprwaukkpfta

## Quality Standards
- Production-ready from day 1
- Mobile-first (Troy manages from phone)
- No emojis in UI
- Clean, professional, Miami Vice energy
- Fast — no bloat
- Every page must look premium
