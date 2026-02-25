'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

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

interface StockXResultsProps {
  query: string
  onSelect: (product: StockXProduct) => void
}

export default function StockXResults({ query, onSelect }: StockXResultsProps) {
  const [results, setResults] = useState<StockXProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim() || query.trim().length < 2) {
      setResults([])
      setSearched(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setSearched(true)
      try {
        const res = await fetch(`/api/stockx/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.products || [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={28} className="animate-spin text-[var(--pink)]" />
      </div>
    )
  }

  if (searched && results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-muted)]">No results found</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">Try a different search term</p>
      </div>
    )
  }

  if (results.length === 0) return null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {results.map(p => (
        <button
          key={p.id}
          onClick={() => onSelect(p)}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 text-left hover:border-[var(--pink)]/50 transition-all duration-200 group"
        >
          {p.image && (
            <div className="aspect-square bg-[var(--bg-elevated)] rounded-lg mb-3 flex items-center justify-center overflow-hidden">
              <img src={p.image} alt="" className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200" />
            </div>
          )}
          <p className="text-sm font-medium text-white line-clamp-2 leading-snug">{p.name}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">{p.brand}</p>
          {p.retailPrice > 0 && <p className="text-sm text-[var(--pink)] font-semibold mt-2">${p.retailPrice}</p>}
        </button>
      ))}
    </div>
  )
}
