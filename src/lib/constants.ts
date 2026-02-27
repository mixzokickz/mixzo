export const SITE_NAME = 'MixzoKickz'
export const SITE_URL = 'https://mixzokickz.com'
export const SITE_DESCRIPTION = 'New & Preowned Sneakers — Denver, CO'
export const BUSINESS_PHONE = '720-720-5015'
export const BUSINESS_EMAIL = 'Mixzo.kickz@gmail.com'
export const BUSINESS_INSTAGRAM = '@mixzo.kickz'
export const BUSINESS_LOCATION = 'Denver, CO'

export const FREE_SHIPPING_THRESHOLD = 200

export const SIZES = [
  '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5',
  '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5',
  '12', '12.5', '13', '13.5', '14', '14.5', '15', '16'
]

export const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Preowned' },
  { value: 'used_like_new', label: 'Preowned - Like New' },
] as const

export const CONDITION_LABELS: Record<string, string> = {
  new: 'New',
  used: 'Preowned',
  used_like_new: 'Preowned - Like New',
}

export const ORDER_STATUSES = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
] as const

// Brand Colors
export const THEME = {
  pink: '#FF2E88',
  pinkLight: '#FF5C9A',
  pinkDark: '#CC2570',
  cyan: '#00C2D6',
  cyanLight: '#33D1E0',
  cyanDark: '#009BAB',
  bgPrimary: '#0C0C0C',
  bgCard: '#141418',
  bgElevated: '#1A1A22',
  border: '#1E1E26',
  borderLight: '#2A2A36',
  textPrimary: '#F4F4F4',
  textSecondary: '#A0A0B8',
  textMuted: '#6A6A80',
  gradient: 'linear-gradient(135deg, #FF2E88, #00C2D6)',
}

// StockX OAuth
export const STOCKX_AUTH_URL = 'https://accounts.stockx.com/authorize'
export const STOCKX_TOKEN_URL = 'https://accounts.stockx.com/oauth/token'
export const STOCKX_API_BASE = 'https://api.stockx.com'
export const STOCKX_AUDIENCE = 'gateway.stockx.com'
export const STOCKX_REDIRECT_URI = 'https://mixzokickz.com/stockx/callback'

export const CLEANING_TIERS = [
  { value: 'cleaning', label: 'Sneaker Cleaning', price: 20 },
  { value: 'cleaning_icing', label: 'Cleaning + Icing', price: 30 },
]

export const SNEAKER_BRANDS = [
  'nike', 'jordan', 'air jordan', 'adidas', 'yeezy', 'new balance',
  'puma', 'reebok', 'asics', 'converse', 'vans', 'saucony',
  'under armour', 'brooks', 'hoka', 'on running', 'salomon',
  'timberland', 'dr martens', 'ugg', 'crocs', 'birkenstock',
  'balenciaga', 'gucci', 'louis vuitton', 'dior', 'off-white',
  'travis scott', 'fear of god', 'essentials', 'supreme',
]
