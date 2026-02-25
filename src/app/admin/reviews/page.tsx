'use client'

import { useState } from 'react'
import { Star, Search, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react'

export default function ReviewsPage() {
  const [search, setSearch] = useState('')

  return (
    <div className="space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-white">Reviews</h1>
        <p className="text-sm text-[var(--text-muted)]">Manage product reviews</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reviews..." className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none" />
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-12 text-center">
        <MessageSquare size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-white mb-1">No reviews yet</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">Product reviews will appear here for moderation</p>
        <div className="flex items-center justify-center gap-1">
          {[1,2,3,4,5].map(i => <Star key={i} size={16} className="text-[var(--text-muted)]" />)}
        </div>
      </div>
    </div>
  )
}
