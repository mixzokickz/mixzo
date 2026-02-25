# MIXZO UI OVERHAUL — Apple-Quality Standard

## What's Wrong (Audit)
1. **Navigation wrong** — Has "Drops" link, should just be Shop + About
2. **No animations** — Static, lifeless, feels 2015
3. **Admin sidebar squished** — Left column too narrow, text cramped
4. **No visual framework** — Hand-rolled components instead of using shadcn/ui properly
5. **StockX connect button broken** — Needs real OAuth flow
6. **Scan system too complex** — 3 tabs confusing, should be ONE clean system
7. **Home page generic** — Gradient orbs look cheap, needs real design
8. **Product cards basic** — No animations, no polish
9. **Mobile layout broken** — Elements overlap, spacing wrong
10. **No page transitions** — Jarring navigation
11. **Forms look dated** — No inline validation, basic inputs
12. **Empty states weak** — Just text, no visual appeal

## Design Principles (Apple Standard)
- **60% negative space** — Let the UI breathe
- **Micro-interactions** — Every click/hover has feedback
- **Fluid animations** — Framer Motion on everything
- **Type hierarchy** — Clear visual hierarchy with size/weight
- **Consistent rhythm** — 8px grid, consistent spacing
- **Glass morphism** — Subtle blur effects on cards/headers
- **Gradient accents** — Pink→Cyan gradient used sparingly
- **Large touch targets** — 48px minimum for mobile

## Navigation Structure

### Customer Nav (ShopHeader)
- Logo (MIXZO gradient)
- Shop
- About (replaces Drops/FAQ/etc)
- Search icon
- Cart icon (with count)
- Account icon

### Admin Sidebar (WIDER — 280px not 240px)
- Logo + "Admin" label
- Dashboard
- Scan In (ONE system)
- Inventory
- Orders
- Customers
- Deals & Discounts
- Analytics
- Settings (includes StockX connect)
- Sign Out

## StockX OAuth (MUST WORK)
- Auth URL: https://accounts.stockx.com/authorize
- Token URL: https://accounts.stockx.com/oauth/token
- Audience: gateway.stockx.com
- Client ID: ZMGLMVVsrD6CCJcCCl9IqneTulbgYQiw
- Client Secret: 4FIgqrNP2ZEBs_xZzPjUhGM2u5JEHoN_HKcrvNN4yCTl6O3nfg_neu1RLm6G7if6
- Redirect URI: https://mixzokickz.com/stockx/callback
- Scopes: offline_access openid
- Flow: User clicks "Connect StockX" → redirected to StockX login → callback with code → exchange for tokens → save to settings table

## Scan System (ONE CLEAN PAGE)
- Single search bar at top — type barcode OR product name
- Auto-detect: if number → barcode lookup, if text → StockX search
- Results show below as cards
- Pick a result → fills the form
- Form: name, brand, size (big dropdown), condition (New/Preowned toggle), price, cost, quantity, images
- BIG submit button
- Camera scan as secondary option (small icon button)
- Everything oversized for phone use

## Animations (Framer Motion)
- Page transitions (fade + slide)
- Card hover (scale 1.02 + shadow)
- Button press (scale 0.98)
- List items (stagger entrance)
- Modal (slide up + fade)
- Sidebar (slide in)
- Counter animations (numbers counting up)
- Skeleton shimmer
- Success confetti/checkmark

## Color System (EXACT from brand guide)
- Pink: #FF2E88
- Cyan: #00C2D6
- BG: #0C0C0C
- Card: #141418
- Border: #1E1E26
- Text: #F4F4F4
- Text Secondary: #A0A0B8
- Text Muted: #6A6A80
