'use client'

import { useState, useEffect, useRef } from 'react'
import { Camera, Keyboard, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import ScanForm from '@/components/admin/scan-form'
import StockXSearchModal from '@/components/admin/stockx-search-modal'

const TABS = [
  { id: 'camera', label: 'Camera Scan', icon: Camera },
  { id: 'type', label: 'Type / Scan Gun', icon: Keyboard },
  { id: 'manual', label: 'Manual Lookup', icon: Search },
] as const

type Tab = typeof TABS[number]['id']

export default function ScanPage() {
  const [tab, setTab] = useState<Tab>('type')
  const [barcode, setBarcode] = useState('')
  const [prefill, setPrefill] = useState<any>(null)
  const [stockxOpen, setStockxOpen] = useState(false)
  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrRef = useRef<any>(null)

  // Camera scanner
  useEffect(() => {
    if (tab !== 'camera' || !scannerRef.current) return
    let scanner: any = null
    const init = async () => {
      const { Html5Qrcode } = await import('html5-qrcode')
      scanner = new Html5Qrcode('scanner-region')
      html5QrRef.current = scanner
      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (text: string) => {
            setBarcode(text)
            setPrefill({ styleId: text })
            scanner.stop().catch(() => {})
            setTab('type')
          },
          () => {}
        )
      } catch {}
    }
    init()
    return () => { scanner?.stop().catch(() => {}) }
  }, [tab])

  const handleBarcodeSubmit = () => {
    if (!barcode.trim()) return
    setPrefill({ name: '', styleId: barcode.trim() })
  }

  const handleStockXSelect = (p: any) => {
    setPrefill({
      name: p.name,
      brand: p.brand,
      styleId: p.styleId,
      image: p.image,
      retailPrice: p.retailPrice,
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Scan / Add Product</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              tab === t.id
                ? 'btn-gradient text-white glow-gradient'
                : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-white'
            )}
          >
            <t.icon size={18} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Camera tab */}
      {tab === 'camera' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--text-secondary)] mb-3">Point camera at barcode</p>
          <div id="scanner-region" ref={scannerRef} className="w-full max-w-sm mx-auto rounded-lg overflow-hidden" />
        </div>
      )}

      {/* Type / Scan Gun tab */}
      {tab === 'type' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 mb-6">
          <label className="text-sm text-[var(--text-secondary)] mb-2 block">Barcode / Style ID</label>
          <div className="flex gap-2">
            <input
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleBarcodeSubmit()}
              placeholder="Scan or type barcode..."
              className="flex-1 text-lg py-3"
              autoFocus
            />
            <button onClick={handleBarcodeSubmit} className="btn-gradient text-white px-6 rounded-xl text-lg font-semibold">
              Go
            </button>
          </div>
        </div>
      )}

      {/* Manual Lookup tab */}
      {tab === 'manual' && (
        <div className="mb-6">
          <button
            onClick={() => setStockxOpen(true)}
            className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 text-center card-hover"
          >
            <Search size={32} className="mx-auto mb-2 text-[var(--blue)]" />
            <p className="font-semibold">Search StockX</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Find sneaker by name, style, or brand</p>
          </button>
        </div>
      )}

      {/* Product form */}
      {prefill && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 mt-4">
          <h2 className="font-semibold mb-4">Product Details</h2>
          <ScanForm prefill={prefill} onSuccess={() => setPrefill(null)} />
        </div>
      )}

      <StockXSearchModal open={stockxOpen} onClose={() => setStockxOpen(false)} onSelect={handleStockXSelect} />
    </div>
  )
}
