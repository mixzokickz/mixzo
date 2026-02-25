'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

interface SearchOverlayProps {
  open: boolean
  onClose: () => void
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 100)
      document.body.style.overflow = 'hidden'
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`)
      onClose()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-bg/95 backdrop-blur-xl flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-4 pt-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-text">Search</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sneakers, brands, styles..."
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-card border border-border text-text text-lg placeholder:text-text-muted focus:outline-none focus:border-pink transition-colors"
          />
        </form>
        <div className="mt-8">
          <p className="text-sm text-text-muted mb-4">Popular searches</p>
          <div className="flex flex-wrap gap-2">
            {['Jordan 1', 'Yeezy', 'Nike Dunk', 'New Balance 550', 'Air Force 1'].map((term) => (
              <button
                key={term}
                onClick={() => { router.push(`/shop?q=${encodeURIComponent(term)}`); onClose() }}
                className="px-4 py-2 rounded-full bg-card border border-border text-sm text-text-secondary hover:border-pink hover:text-text transition-colors cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
