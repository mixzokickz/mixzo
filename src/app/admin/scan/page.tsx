'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, X, Search } from 'lucide-react'
import ScanForm from '@/components/admin/scan-form'
import StockXResults from '@/components/admin/stockx-results'
import { toast } from 'sonner'

interface ProductPrefill {
  name?: string
  brand?: string
  styleId?: string
  image?: string
  retailPrice?: number
}

export default function ScanPage() {
  const [query, setQuery] = useState('')
  const [prefill, setPrefill] = useState<ProductPrefill | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [searchType, setSearchType] = useState<'idle' | 'upc' | 'stockx'>('idle')
  const [upcLoading, setUpcLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-detect search type as user types
  const detectType = useCallback((val: string) => {
    if (!val.trim()) return 'idle' as const
    // If mostly digits or looks like UPC/EAN
    if (/^\d{6,}$/.test(val.trim())) return 'upc' as const
    return 'stockx' as const
  }, [])

  useEffect(() => {
    const type = detectType(query)
    setSearchType(type)

    if (type === 'upc' && query.trim().length >= 10) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => lookupUPC(query.trim()), 500)
    }

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, detectType])

  useEffect(() => {
    if (!prefill) setTimeout(() => inputRef.current?.focus(), 100)
  }, [prefill])

  async function lookupUPC(code: string) {
    setUpcLoading(true)
    try {
      const res = await fetch(`/api/upc-lookup?upc=${encodeURIComponent(code)}`)
      const data = await res.json()
      if (data.product) {
        setPrefill({
          name: data.product.name,
          brand: data.product.brand,
          styleId: data.product.styleId,
          image: data.product.image,
          retailPrice: data.product.retailPrice,
        })
        toast.success('Product found via barcode')
      }
    } catch { /* silent */ }
    finally { setUpcLoading(false) }
  }

  async function openCamera() {
    setShowCamera(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      toast.error('Camera access denied')
      setShowCamera(false)
    }
  }

  const saveToCache = (barcodeVal: string, product: ProductResult) => {
    fetch('/api/admin/barcode-cache', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        barcode: barcodeVal,
        productName: product.name,
        brand: product.brand,
        colorway: product.colorway,
        styleId: product.styleId,
        size: product.size,
        retailPrice: product.retailPrice,
        imageUrl: product.imageUrl,
        imageUrls: product.imageUrls,
        goatProductId: product.goatProductId || product.id,
      }),
    }).catch(() => {})
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setShowCamera(false)
  }

  function handleSuccess() {
    setPrefill(null)
    setQuery('')
    setSearchType('idle')
    toast.success('Product added to inventory!')
    setTimeout(() => inputRef.current?.focus(), 200)
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Scan In</h1>
        <p className="text-sm text-[var(--text-muted)]">Search, scan, or look up products to add to inventory</p>
      </div>

      {/* Search bar */}
      {!prefill && (
        <div className="relative">
          <div className="relative flex items-center">
            <Search size={22} className="absolute left-5 text-[var(--text-muted)]" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by barcode, name, or style ID..."
              className="w-full bg-[var(--bg-card)] border-2 border-[var(--border)] rounded-2xl pl-14 pr-16 py-5 text-lg text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none transition-colors"
              autoFocus
            />
            <button
              onClick={() => showCamera ? closeCamera() : openCamera()}
              className="absolute right-4 w-10 h-10 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:border-[var(--pink)]/30 transition-all"
              title="Use Camera"
            >
              {showCamera ? <X size={18} /> : <Camera size={18} />}
            </button>
          </div>
          {upcLoading && (
            <div className="absolute right-20 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-[var(--pink)]/30 border-t-[var(--pink)] rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Camera */}
      {showCamera && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="relative aspect-[4/3] bg-black">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-[var(--pink)] rounded-2xl opacity-50" />
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)] text-center py-3">Point camera at barcode</p>
        </div>
      )}

      {/* StockX results (inline) */}
      {searchType === 'stockx' && query.trim().length >= 2 && !prefill && (
        <StockXResults
          query={query}
          onSelect={(product) => {
            setPrefill({
              name: product.name,
              brand: product.brand,
              styleId: product.styleId,
              image: product.image,
              retailPrice: product.retailPrice,
            })
          }}
        />
      )}

      {/* Product form */}
      {prefill && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 lg:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">Add Product</h2>
            <button onClick={() => setPrefill(null)} className="text-[var(--text-muted)] hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <ScanForm prefill={prefill} onSuccess={handleSuccess} />
        </div>
      )}
    </div>
  )
}
