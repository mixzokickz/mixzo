'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Ticket, Calendar, DollarSign, Users, Hash, Star, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function NewRafflePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [entryPrice, setEntryPrice] = useState('')
  const [maxEntries, setMaxEntries] = useState('')
  const [entriesPerPerson, setEntriesPerPerson] = useState('1')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState('active')
  const [productName, setProductName] = useState('')
  const [productImage, setProductImage] = useState('')
  const [productSize, setProductSize] = useState('')
  const [productRetailPrice, setProductRetailPrice] = useState('')
  const [featured, setFeatured] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !entryPrice || !endDate) {
      toast.error('Title, entry price, and end date are required')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/raffles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || null,
          entry_price: entryPrice,
          max_entries: maxEntries || null,
          entries_per_person: entriesPerPerson || '1',
          start_date: startDate || new Date().toISOString(),
          end_date: new Date(endDate).toISOString(),
          status,
          product_name: productName || null,
          product_image: productImage || null,
          product_size: productSize || null,
          product_retail_price: productRetailPrice || null,
          featured,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create raffle')
      }

      toast.success('Raffle created')
      router.push('/admin/raffles')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create raffle')
    }
    setSaving(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/raffles">
          <button className="p-2 rounded-xl bg-[#141418] border border-[#1E1E26] text-[#6A6A80] hover:text-white transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Create Raffle</h1>
          <p className="text-sm text-[#6A6A80] mt-0.5">Set up a new raffle campaign</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-[1fr_320px] gap-6">
        {/* Main Form */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="rounded-2xl bg-[#141418] border border-[#1E1E26] p-6 space-y-4">
            <h2 className="text-sm font-bold text-[#F4F4F4] flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#FF2E88]" />
              Raffle Details
            </h2>

            <div>
              <label className="block text-xs font-medium text-[#6A6A80] mb-1.5">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Win a pair of Travis Scott Jordan 1s"
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F13] border border-[#1E1E26] text-sm text-[#F4F4F4] placeholder:text-[#6A6A80] focus:outline-none focus:border-[#FF2E88]/40"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6A6A80] mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Raffle details, rules, etc."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F13] border border-[#1E1E26] text-sm text-[#F4F4F4] placeholder:text-[#6A6A80] focus:outline-none focus:border-[#FF2E88]/40 resize-none"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="rounded-2xl bg-[#141418] border border-[#1E1E26] p-6 space-y-4">
            <h2 className="text-sm font-bold text-[#F4F4F4] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#00C2D6]" />
              Product Info
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#6A6A80] mb-1.5">Product Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Air Jordan 1 Retro High"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F13] border border-[#1E1E26] text-sm text-[#F4F4F4] placeholder:text-[#6A6A80] focus:outline-none focus:border-[#FF2E88]/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6A6A80] mb-1.5">Size</label>
                <input
                  type="text"
                  value={productSize}
                  onChange={(e) => setProductSize(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F13] border border-[#1E1E26] text-sm text-[#F4F4F4] placeholder:text-[#6A6A80] focus:outline-none focus:border-[#FF2E88]/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6A6A80] mb-1.5">Product Image URL</label>
              <input
                type="text"
                value={productImage}
                onChange={(e) => setProductImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F13] border border-[#1E1E26] text-sm text-[#F4F4F4] placeholder:text-[#6A6A80] focus:outline-none focus:border-[#FF2E88]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6A6A80] mb-1.5">Retail Price</label>
              <input
                type="number"
                step="0.01"
                value={productRetailPrice}
                onChange={(e) => setProductRetailPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F13] border border-[#1E1E26] text-sm text-[#F4F4F4] placeholder:text-[#6A6A80] focus:outline-none focus:border-[#FF2E88]/40"
              />
            </div>
          </div>

          {/* Entry Settings */}
          <div className="rounded-2xl bg-[#141418] border border-[#1E1E26] p-6 space-y-4">
            <h2 className="text-sm font-bold text-[#F4F4F4] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#22C55E]" />
              Entry Settings
            </h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#6A6A80] mb-1.5">Entry Price *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.50"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  placeholder="5.00"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F13] border border-[#1E1E26] text-sm text-[#F4F4F4] placeholder:text-[#6A6A80] focus:outline-none focus:border-[#FF2E88]/40"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6A6A80] mb-1.5">Max Entries</label>
                <input
                  type="number"
                  min="1"
                  value={maxEntries}
                  onChange={(e) => setMaxEntries(e.target.value)}
                  placeholder="Unlimited"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F13] border border-[#1E1E26] text-sm text-[#F4F4F4] placeholder:text-[#6A6A80] focus:outline-none focus:border-[#FF2E88]/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6A6A80] mb-1.5">Per Person</label>
                <input
                  type="number"
                  min="1"
                  value={entriesPerPerson}
                  onChange={(e) => setEntriesPerPerson(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F13] border border-[#1E1E26] text-sm text-[#F4F4F4] placeholder:text-[#6A6A80] focus:outline-none focus:border-[#FF2E88]/40"
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="rounded-2xl bg-[#141418] border border-[#1E1E26] p-6 space-y-4">
            <h2 className="text-sm font-bold text-[#F4F4F4] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#A855F7]" />
              Schedule
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#6A6A80] mb-1.5">Start Date</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F13] border border-[#1E1E26] text-sm text-[#F4F4F4] focus:outline-none focus:border-[#FF2E88]/40 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6A6A80] mb-1.5">End Date *</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F13] border border-[#1E1E26] text-sm text-[#F4F4F4] focus:outline-none focus:border-[#FF2E88]/40 [color-scheme:dark]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6A6A80] mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F0F13] border border-[#1E1E26] text-sm text-[#F4F4F4] focus:outline-none focus:border-[#FF2E88]/40 cursor-pointer"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFeatured(!featured)}
                className={cn(
                  'w-10 h-6 rounded-full transition-colors cursor-pointer relative',
                  featured ? 'bg-[#FF2E88]' : 'bg-[#1E1E26]'
                )}
              >
                <span className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  featured ? 'left-5' : 'left-1'
                )} />
              </button>
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-[#FF2E88]" />
                <span className="text-sm text-[#A0A0B8]">Featured on landing page</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-[#FF2E88] hover:bg-[#FF2E88]/90 text-white font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Raffle'}
          </button>
        </div>

        {/* Preview Card */}
        <div className="hidden md:block">
          <div className="sticky top-24 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-[#6A6A80]">Preview</p>
            <div className="rounded-2xl bg-[#141418] border border-[#1E1E26] overflow-hidden">
              <div className="aspect-square bg-[#0F0F13] relative">
                {productImage ? (
                  <Image src={productImage} alt="" fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Ticket className="w-16 h-16 text-[#1E1E26]" />
                  </div>
                )}
                {featured && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 rounded-full bg-[#FF2E88]/20 text-[#FF2E88] text-[10px] font-bold">
                      Featured
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-[#F4F4F4] text-sm mb-1">{title || 'Raffle Title'}</h3>
                {productSize && (
                  <p className="text-xs text-[#6A6A80] mb-3">Size {productSize}</p>
                )}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#A0A0B8]">
                    <Users className="w-3.5 h-3.5" />
                    <span>0 entries</span>
                  </div>
                  <span className="text-sm font-bold text-[#FF2E88]">
                    ${entryPrice || '0'}
                  </span>
                </div>
                <div className="py-2.5 rounded-xl bg-[#FF2E88] text-center text-white text-sm font-semibold">
                  Enter Now - ${entryPrice || '0'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
