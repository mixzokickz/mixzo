'use client'

import { useState } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StockXProduct {
  id: string
  name: string
  brand: string
  colorway: string
  retailPrice: number
  styleId: string
  image: string
  thumb: string
}

interface StockXSearchModalProps {
  open: boolean
  onClose: () => void
  onSelect: (product: StockXProduct) => void
}

export default function StockXSearchModal({ open, onClose, onSelect }: StockXSearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StockXProduct[]>([])
  const [loading, setLoading] = useState(false)

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/stockx/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.products || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[85vh] bg-[var(--bg-card)] border border-[var(--border)] rounded-t-2xl lg:rounded-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-lg">StockX Lookup</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-4 flex gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Search sneakers..."
            className="flex-1"
            autoFocus
          />
          <button onClick={search} disabled={loading} className="btn-gradient text-white px-4 py-2 rounded-lg flex items-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-0">
          {results.length === 0 && !loading && (
            <p className="text-center text-[var(--text-muted)] py-8 text-sm">Search for a sneaker by name or style ID</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {results.map(p => (
              <button
                key={p.id}
                onClick={() => { onSelect(p); onClose() }}
                className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-3 text-left hover:border-[var(--pink)] transition-colors card-hover"
              >
                {p.image && <img src={p.image} alt="" className="w-full h-24 object-contain mb-2" />}
                <p className="text-xs font-medium line-clamp-2 leading-tight">{p.name}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">{p.brand}</p>
                {p.retailPrice && <p className="text-xs text-[var(--pink)] font-semibold mt-1">${p.retailPrice}</p>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
