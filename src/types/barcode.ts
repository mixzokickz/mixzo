// StockX product detail
export interface StockXProductDetail {
  id: string
  title: string
  brand: string
  colorway: string
  styleId: string
  retailPrice: number
  imageUrl: string
  imageUrls: string[]
  variants: StockXVariant[]
}

export interface StockXVariant {
  id: string
  size: string
  gtins: string[]
}

export interface StockXMarketData {
  lastSale: number | null
  lowestAsk: number | null
  highestBid: number | null
}

export type ScanResultSource = 'stockx' | 'goat' | 'upcdb' | 'manual'

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
  stockxProductId: string | null
  variants: StockXVariant[]
  marketData: StockXMarketData | null
}

export interface ScanFormData {
  barcode: string
  productName: string
  brand: string | null
  colorway: string | null
  styleId: string | null
  size: string | null
  stockxProductId: string | null
  condition: 'new' | 'used_like_new' | 'used_good' | 'used_fair'
  hasBox: boolean
  cost: number
  price: number
  images: string[]
}

export type ScanState = 'idle' | 'scanning' | 'looking_up' | 'found' | 'not_found' | 'adding' | 'added'
