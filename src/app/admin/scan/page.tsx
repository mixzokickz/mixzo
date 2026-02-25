'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, Keyboard, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import ScanForm from '@/components/admin/scan-form'
import StockXSearchModal from '@/components/admin/stockx-search-modal'
import { toast } from 'sonner'

type Tab = 'camera' | 'type' | 'lookup'

export default function ScanPage() {
  const [tab, setTab] = useState<Tab>('type')
  const [barcode, setBarcode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [prefill, setPrefill] = useState<{
    name?: string; brand?: string; styleId?: string; image?: string; retailPrice?: number
  } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (tab === 'type') {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
    if (tab === 'camera') {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [tab])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setScanning(true)
    } catch {
      toast.error('Camera access denied')
      setTab('type')
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setScanning(false)
  }

  async function lookupBarcode(code: string) {
    if (!code.trim()) return
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
        toast.success('Product found')
      } else {
        toast.error('Product not found. Try StockX lookup.')
      }
    } catch {
      toast.error('Lookup failed')
    }
  }

  function handleBarcodeSubmit(e: React.FormEvent) {
    e.preventDefault()
    lookupBarcode(barcode)
  }

  const tabs = [
    { id: 'camera' as Tab, label: 'Camera', icon: Camera },
    { id: 'type' as Tab, label: 'Type / Scan Gun', icon: Keyboard },
    { id: 'lookup' as Tab, label: 'StockX Lookup', icon: Search },
  ]

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-white">Scan Product</h1>
        <p className="text-sm text-[var(--text-muted)]">Add products by scanning, typing, or searching StockX</p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setPrefill(null) }}
            className={cn(
              'flex flex-col items-center gap-2 py-4 px-3 rounded-xl border text-sm font-medium transition-all',
              tab === id
                ? 'bg-[#FF2E88] hover:opacity-90 text-white border-transparent'
                : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--pink)]/30'
            )}
          >
            <Icon size={24} />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>

      {/* Camera tab */}
      {tab === 'camera' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="relative aspect-[4/3] bg-black">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-[var(--pink)] rounded-xl opacity-50" />
              </div>
            )}
          </div>
          <div className="p-4">
            <p className="text-sm text-[var(--text-secondary)] text-center">
              Point camera at barcode. For best results, use the Type/Scan Gun tab.
            </p>
          </div>
        </div>
      )}

      {/* Type / Scan Gun tab */}
      {tab === 'type' && !prefill && (
        <form onSubmit={handleBarcodeSubmit} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
          <label className="block text-sm text-[var(--text-secondary)] mb-2 font-medium">UPC / Barcode / Style ID</label>
          <div className="flex gap-3">
            <input
              ref={inputRef}
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
              placeholder="Scan or type barcode..."
              className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-4 text-lg text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none transition-colors font-mono"
              autoFocus
            />
            <button
              type="submit"
              className="bg-[#FF2E88] hover:opacity-90 text-white px-6 rounded-xl font-semibold text-sm"
            >
              Look Up
            </button>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-3">
            Use a scan gun or type the barcode manually. Press Enter to search.
          </p>
        </form>
      )}

      {/* StockX Lookup tab */}
      {tab === 'lookup' && !prefill && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-[#FF2E88] hover:opacity-90 text-white py-5 rounded-xl font-semibold text-lg flex items-center justify-center gap-3"
          >
            <Search size={22} />
            Search StockX
          </button>
          <p className="text-xs text-[var(--text-muted)] mt-3 text-center">
            Search by name, style ID, or colorway
          </p>
        </div>
      )}

      {/* Product form after finding */}
      {prefill && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Add Product</h2>
            <button onClick={() => setPrefill(null)} className="text-[var(--text-muted)] hover:text-white">
              <X size={18} />
            </button>
          </div>
          <ScanForm prefill={prefill} onSuccess={() => { setPrefill(null); setBarcode('') }} />
        </div>
      )}

      <StockXSearchModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSelect={(product) => {
          setPrefill({
            name: product.name,
            brand: product.brand,
            styleId: product.styleId,
            image: product.image,
            retailPrice: product.retailPrice,
          })
          setShowModal(false)
        }}
      />
    </div>
  )
}
