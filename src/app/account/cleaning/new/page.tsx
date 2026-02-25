'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CLEANING_TIERS } from '@/lib/constants'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { Upload, X, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const CONDITIONS = [
  { value: 'good', label: 'Good — Light wear' },
  { value: 'fair', label: 'Fair — Moderate wear' },
  { value: 'beat', label: 'Beat — Heavy wear' },
  { value: 'heavily_worn', label: 'Heavily Worn — Needs serious work' },
]

export default function NewCleaningRequest() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tierParam = searchParams.get('tier') || 'cleaning'
  const fileRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [form, setForm] = useState({
    tier: tierParam,
    condition: '',
    name: '',
    phone: '',
    notes: '',
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push(`/login?redirect=/account/cleaning/new?tier=${tierParam}`)
        return
      }
      setUser(session.user)
      setForm(f => ({ ...f, name: session.user.user_metadata?.full_name || '' }))
      setLoading(false)
    })
  }, [router, tierParam])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).slice(0, 5 - images.length).forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) setImages(prev => [...prev, ev.target!.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (idx: number) => setImages(prev => prev.filter((_, i) => i !== idx))

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const selectedTier = CLEANING_TIERS.find(t => t.value === form.tier) || CLEANING_TIERS[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.condition || !form.name || !form.phone) {
      toast.error('Please fill in all required fields')
      return
    }
    if (images.length === 0) {
      toast.error('Please upload at least one photo of your shoes')
      return
    }
    setSubmitting(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch('/api/admin/cleaning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          tier: form.tier,
          tier_label: selectedTier.label,
          price: selectedTier.price,
          condition: form.condition,
          customer_name: form.name,
          customer_phone: form.phone,
          customer_email: user?.email,
          notes: form.notes,
          images,
          user_id: user?.id,
        }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSubmitted(true)
    } catch {
      toast.error('Failed to submit request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-8 h-8 border-2 border-pink/30 border-t-pink rounded-full animate-spin" />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <ShopHeader />
        <main className="flex-1 flex items-center justify-center pt-20 pb-24 px-4">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Request Submitted!</h1>
            <p className="text-text-secondary text-sm mb-8">
              We&apos;ll review your shoes and get back to you with a timeline. Check your account for updates.
            </p>
            <button onClick={() => router.push('/account/cleaning')} className="bg-[#FF2E88] text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition">
              View My Requests
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-24 pb-24 pb-mobile-nav px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-2">Cleaning Request</h1>
          <p className="text-sm text-text-secondary mb-8">Tell us about your kicks and we&apos;ll take it from here.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tier */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">Service</label>
              <div className="grid grid-cols-2 gap-3">
                {CLEANING_TIERS.map(tier => (
                  <button
                    key={tier.value}
                    type="button"
                    onClick={() => set('tier', tier.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      form.tier === tier.value
                        ? 'border-pink bg-pink/5'
                        : 'border-border bg-card hover:border-pink/30'
                    }`}
                  >
                    <p className="font-semibold text-sm">{tier.label}</p>
                    <p className="text-lg font-bold text-pink mt-1">${tier.price}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">Shoe Condition *</label>
              <select
                value={form.condition}
                onChange={e => set('condition', e.target.value)}
                required
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-text focus:border-pink focus:outline-none"
              >
                <option value="">Select condition...</option>
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Photos */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">Photos of Your Shoes * (up to 5)</label>
              <div className="grid grid-cols-5 gap-2 mb-2">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-pink/40 flex items-center justify-center transition-colors"
                  >
                    <Upload className="w-5 h-5 text-text-muted" />
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">Name *</label>
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                required
                placeholder="Your name"
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-pink focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">Phone Number *</label>
              <input
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                required
                type="tel"
                placeholder="(720) 555-1234"
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-pink focus:outline-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-2 block">Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                rows={3}
                placeholder="Anything else we should know about your shoes?"
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-pink focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#FF2E88] text-white font-semibold py-4 rounded-xl text-base flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {submitting ? 'Submitting...' : `Submit Request — $${selectedTier.price}`}
            </button>
          </form>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
