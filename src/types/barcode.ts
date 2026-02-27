// GOAT / Market product detail
export interface ProductDetail {
  id: string
  title: string
  brand: string
  colorway: string
  styleId: string
  retailPrice: number
  imageUrl: string
  imageUrls: string[]
  variants: ProductVariant[]
}

export interface ProductVariant {
  id: string
  size: string
  gtins: string[]
}

export interface MarketData {
  lastSale: number | null
  lowestAsk: number | null
  highestBid: number | null
}

export type ScanResultSource = 'cache' | 'goat' | 'upc' | 'manual'

export interface ScanResult {
  source: ScanResultSource
  barcode: string
  productName: string
  brand: string | null
  colorway: string | null
  styleId: string | null
  size: string | null
  retailPrice: number | null
  imageUrl: string | null
  imageUrls: string[]
  goatProductId: string | null
  variants: ProductVariant[]
  marketData: MarketData | null
}

export interface ScanFormData {
  barcode: string
  productName: string
  brand: string | null
  colorway: string | null
  styleId: string | null
  size: string | null
  goatProductId: string | null
  condition: 'new' | 'preowned'
  hasBox: boolean
  cost: number
  price: number
  images: string[]
}

export type ScanState = 'idle' | 'scanning' | 'looking_up' | 'found' | 'not_found' | 'adding' | 'added'

// Session scan history entry
export interface ScanHistoryEntry {
  id: string
  time: string
  barcode: string
  productName: string
  size: string | null
  condition: 'new' | 'preowned'
  price: number
  status: 'added' | 'failed'
}

// A scanned item before pricing (Phase 1 queue)
export interface ScannedItem {
  id: string
  barcode: string
  productName: string
  brand: string | null
  colorway: string | null
  styleId: string | null
  imageUrl: string | null
  imageUrls: string[]
  goatProductId: string | null
  retailPrice: number | null
  // User will set these in Phase 2 (Pricing)
  size: string | null
  condition: 'new' | 'preowned'
  hasBox: boolean
  price: number | null
  cost: number | null
  // Status
  status: 'pending' | 'priced' | 'added' | 'failed'
}
