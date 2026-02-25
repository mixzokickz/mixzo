# MIXZO MASTER PLAN V2 — PRODUCTION OVERHAUL

## Brand Identity (FROM BRAND GUIDE — HARDCODED)
- **Primary Pink:** #FF2E88
- **Primary Cyan:** #00C2D6
- **Dark BG:** #0C0C0C
- **Light Text:** #F4F4F4
- **Secondary Text:** #A0A0B8
- **Muted Text:** #6A6A7A
- **Card BG:** #141418
- **Card Border:** #1E1E26
- **Elevated BG:** #1A1A22
- **Gradient:** linear-gradient(135deg, #FF2E88, #00C2D6)
- **Font:** Inter (clean, geometric, free) — similar to Neue Haas Grotesk
- **Tagline:** Original copy, NOT from brand guide
- **Logo:** Generated via Replicate — Aidan picks from 4 options
- **Dark mode ONLY** — no theme toggle

## Architecture — EVERY PAGE

### Public Pages (Customer-Facing)
1. **/ (Home)** — Split layout: top half = mini landing with brand, tagline, trust signals + "New" / "Preowned" tabs. Bottom half = full product grid. Scroll down = shop.
2. **/shop** — Full product catalog with filters, search, sort
3. **/product/[id]** — Product detail with gallery, sizing, market data, add to cart
4. **/cart** — Full cart with quantities, discount codes, shipping calc
5. **/checkout** — Shipping form, order summary, Stripe placeholder
6. **/checkout/confirmation** — Order confirmation with details
7. **/login** — Sign in page
8. **/signup** — Create account
9. **/auth/forgot-password** — Password reset
10. **/auth/reset-password** — Reset password form
11. **/account** — Customer account dashboard
12. **/account/orders** — Order history
13. **/account/orders/[id]** — Order detail with tracking
14. **/account/settings** — Profile, shipping address, password
15. **/returns** — "All Sales Are Final" + authenticity guarantee
16. **/faq** — Frequently asked questions
17. **/terms** — Terms of Service
18. **/privacy** — Privacy Policy
19. **/shipping** — Shipping info & policies
20. **/drops** — Daily deals / featured items
21. **/wishlist** — Customer wishlist
22. **/orders/lookup** — Order lookup by number (no auth needed)
23. **/contact** — Contact form
24. **/not-found** — Custom 404 page (NO dead ends)
25. **/error** — Custom error page

### Admin Pages
26. **/admin** — Dashboard with revenue, orders, products, customers stats + charts
27. **/admin/scan** — 3-tab scan system (Camera, Type/Scan Gun, Manual StockX Lookup)
28. **/admin/inventory** — Full inventory management with search, filters, bulk actions
29. **/admin/products** — Product list with edit/delete
30. **/admin/products/[id]/edit** — Edit product form
31. **/admin/products/new** — Add product manually (without scan)
32. **/admin/products/detail** — Product detail view
33. **/admin/orders** — All orders with status filters, search
34. **/admin/orders/[id]** — Order detail with fulfillment actions
35. **/admin/orders/[id]/packing-slip** — Printable packing slip
36. **/admin/orders/new** — Create manual order
37. **/admin/customers** — Customer list with search
38. **/admin/customers/[id]** — Customer detail with order history
39. **/admin/drops** — Daily deals management
40. **/admin/discounts** — Discount code management (CRUD)
41. **/admin/analytics** — Revenue charts, top products, inventory breakdown, conversion rates
42. **/admin/reports** — Downloadable reports (sales, inventory, customers)
43. **/admin/shipping** — Shipping management, create labels (placeholder for API)
44. **/admin/settings** — Store settings, StockX connection, account
45. **/admin/notifications** — Notification center
46. **/admin/reviews** — Product reviews management
47. **/admin/purchases** — Purchase/cost tracking
48. **/admin/price-sync** — StockX price sync
49. **/admin/help** — Admin help/docs
50. **/admin/monitoring** — Site health monitoring
51. **/admin/gift-cards** — Gift card management (upsell feature)
52. **/admin/payment-links** — Payment link generation
53. **/admin/staff** — Staff management
54. **/admin/reconciliation** — Inventory reconciliation

### API Routes
55. **/api/auth/role** — Auth role check
56. **/api/auth/signout** — Sign out
57. **/api/products** — Public product list
58. **/api/admin/products** — Admin product CRUD
59. **/api/admin/products/drop** — Product drops
60. **/api/admin/orders/[id]/edit** — Edit order
61. **/api/admin/analytics** — Analytics data
62. **/api/admin/discounts** — Discount CRUD
63. **/api/admin/drops** — Drops management
64. **/api/admin/inventory/adjust** — Inventory adjustment
65. **/api/admin/shipping/create-label** — Create shipping label (placeholder)
66. **/api/admin/shipping/rates** — Get shipping rates (placeholder)
67. **/api/admin/shipping/track** — Track shipment
68. **/api/admin/payment-links** — Payment links
69. **/api/admin/reconciliation** — Reconciliation data
70. **/api/admin/refunds** — Process refunds
71. **/api/admin/gift-cards** — Gift card CRUD
72. **/api/admin/price-sync** — StockX price sync
73. **/api/stockx/search** — StockX product search
74. **/api/stockx/lookup** — Barcode lookup
75. **/api/stockx/auth** — StockX OAuth
76. **/api/stockx/product/[id]** — StockX product detail
77. **/api/upc-lookup** — UPC barcode lookup
78. **/api/upload/image** — Image upload to Supabase Storage
79. **/api/checkout** — Process checkout
80. **/api/discounts/validate** — Validate discount code
81. **/api/gift-cards/balance** — Check gift card balance
82. **/api/gift-cards/validate** — Validate gift card
83. **/api/gift-cards/purchase** — Purchase gift card
84. **/api/contact** — Contact form submission
85. **/api/health** — Health check endpoint
86. **/api/send-confirmation** — Order confirmation email (placeholder)
87. **/api/notifications/send** — Send notification
88. **/api/notifications/subscribe** — Push notification subscribe
89. **/api/drops/subscribe** — Subscribe to drop alerts
90. **/api/products/upcoming-drops** — Get upcoming drops
91. **/api/webhooks/stripe** — Stripe webhook (placeholder)
92. **/api/cron/stock-alerts** — Stock alert cron
93. **/api/cron/drops-notify** — Drop notification cron
94. **/api/cron/abandoned-carts** — Abandoned cart recovery cron
95. **/auth/callback** — Auth callback
96. **/stockx/callback** — StockX OAuth callback
97. **/sitemap.ts** — Dynamic sitemap
98. **/robots.ts** — Robots.txt

### Components (Shared)
- **Layout:** ShopHeader, Footer, AdminSidebar, AdminLayout, MobileNav
- **Shop:** ProductCard, ProductGrid, FilterTabs, FilterPanel, SearchOverlay, CartDrawer, PriceTag, ConditionBadge, EmptyState, LoadingSkeletons
- **Admin:** ScanForm, StockXSearchModal, ImageUpload, StatsCard, OrderCard, ProductForm, DataTable, Charts
- **UI:** Button, Input, Select, Modal, Drawer, Tabs, Badge, Tooltip, Dropdown, Toast, Skeleton, Card, Avatar

## Design Standards (EVERY PAGE MUST MEET)

### Typography
- Headlines: Inter Bold/Semibold, sizes 24-48px
- Body: Inter Regular, 14-16px, line-height 1.5-1.6
- Captions: Inter Regular, 12-13px
- Letter spacing: -0.02em on headlines, normal on body

### Spacing
- Page padding: 16px mobile, 24px tablet, 32px desktop
- Card padding: 16-24px
- Section gaps: 48-80px
- Element gaps: 8-16px

### Cards
- Background: #141418
- Border: 1px solid #1E1E26
- Border radius: 12-16px
- Hover: border lightens to #2A2A3E, subtle glow
- Shadow: none (flat dark UI)

### Buttons
- Primary: gradient (#FF2E88 → #00C2D6), white text, 12px radius, 10-14px padding
- Secondary: transparent, border #1E1E26, white text
- Destructive: #EF4444 bg
- All: smooth hover transitions, disabled opacity 0.5

### Images
- Product images: object-contain on white/transparent bg with padding
- Aspect ratio: square (1:1) for product cards
- Loading: skeleton placeholders
- Fallback: shoe icon placeholder

### Mobile First
- Every page functional at 375px
- Touch targets: min 44x44px
- Bottom nav for mobile (Home, Shop, Cart, Account)
- Swipe gestures where appropriate
- No horizontal scrolling

### Empty States
- Custom illustrations/icons for empty pages
- Clear messaging about what to do next
- Action buttons to guide user

### Loading States
- Skeleton loaders for all data
- Shimmer animations
- No blank screens ever

### Error States
- Custom 404 page with navigation
- Error boundary with retry
- Form validation with inline errors

## Build Waves

### Wave 1: Foundation Reset (COMPLETE REWRITE)
- [ ] Rewrite globals.css with exact brand colors
- [ ] Rewrite layout.tsx with Inter font, proper metadata
- [ ] Create all UI components (Button, Input, Card, Modal, etc.)
- [ ] Create ShopHeader with brand logo, nav, search, cart, account
- [ ] Create Footer with full links, contact, social
- [ ] Create AdminSidebar with full nav
- [ ] Create AdminLayout with auth guard
- [ ] Create MobileBottomNav
- [ ] Custom 404, error, loading pages

### Wave 2: Home + Shop (THE MONEY PAGES)
- [ ] Home page: half landing / half shop, tabs for New/Preowned
- [ ] Shop page: full catalog, filters, search, sort, empty state
- [ ] Product detail: gallery, sizing, market data, add to cart, related
- [ ] Cart: quantities, discount codes, shipping calc, empty state
- [ ] Checkout flow: address, review, confirm
- [ ] Checkout confirmation page
- [ ] Cart drawer (slide-out)
- [ ] Wishlist system
- [ ] ProductCard component (premium)
- [ ] SearchOverlay

### Wave 3: Customer Account
- [ ] Login/Signup (clean, branded)
- [ ] Forgot/Reset password
- [ ] Account dashboard
- [ ] Order history + detail
- [ ] Account settings (profile, address, password)
- [ ] Order lookup (no auth)

### Wave 4: Admin System (FULL PRODUCTION)
- [ ] Admin dashboard with live stats + charts
- [ ] Scan system (3 tabs, StockX + GOAT fallback)
- [ ] Inventory management (search, filter, sort, bulk)
- [ ] Product CRUD (create, edit, delete, images)
- [ ] Order management (list, detail, packing slip, fulfillment)
- [ ] Create manual orders
- [ ] Customer management (list, detail, order history)
- [ ] Daily deals / drops management
- [ ] Discount code system
- [ ] Analytics (revenue, products, inventory, conversions)
- [ ] Reports (downloadable)
- [ ] Gift card system
- [ ] Staff management
- [ ] Settings (store, StockX, account)
- [ ] Shipping management (placeholder)
- [ ] Notifications center
- [ ] Price sync (StockX)
- [ ] Inventory reconciliation
- [ ] Purchases/cost tracking
- [ ] Payment links
- [ ] Monitoring
- [ ] Help docs

### Wave 5: API Layer
- [ ] All admin API routes with requireAdmin()
- [ ] Public product/shop APIs
- [ ] StockX integration (search, lookup, auth, product detail)
- [ ] UPC barcode lookup
- [ ] Image upload to Supabase Storage
- [ ] Checkout processing
- [ ] Discount validation
- [ ] Gift card APIs
- [ ] Contact form
- [ ] Health check
- [ ] Email sending (placeholder)
- [ ] Push notifications (placeholder)
- [ ] Stripe webhooks (placeholder)
- [ ] Cron endpoints (stock alerts, drops, abandoned carts)
- [ ] Sitemap + robots.txt

### Wave 6: Polish & Launch
- [ ] SEO metadata on every page
- [ ] OG image
- [ ] Favicon
- [ ] PWA manifest
- [ ] Performance audit
- [ ] Mobile testing
- [ ] All links verified (NO 404s)
- [ ] Form validation everywhere
- [ ] Error boundaries
- [ ] Loading states everywhere
- [ ] Empty states designed
- [ ] Accessibility pass

## Quality Checklist (EVERY PAGE)
- [ ] Matches brand colors exactly (#0C0C0C, #F4F4F4, #FF2E88, #00C2D6)
- [ ] No dead-end links
- [ ] Mobile responsive (375px+)
- [ ] Loading skeleton
- [ ] Empty state
- [ ] Error handling
- [ ] No emojis
- [ ] Lucide icons only
- [ ] Consistent spacing
- [ ] Professional copywriting
- [ ] Touch-friendly (44px targets)
- [ ] No hardcoded data
- [ ] Supabase connected

## Copywriting Guidelines
- Tone: Confident, clean, streetwear-native
- No exclamation marks in headlines
- Short, punchy sentences
- Industry language (heat, grails, deadstock, authenticated)
- Trust-building: "Every pair verified" not "We promise quality"
- Denver, CO mention for local SEO
- Action-oriented CTAs

## GOAT Image Fallback
- When StockX has no image, check GOAT CDN
- GOAT image URL pattern: cdn.goat.com/...
- Already configured in next.config.ts image domains

## Total Estimated Pages: 98 (54 pages + 44 API routes)
## Target: Production-ready, better than SecuredTampa, zero dead ends
