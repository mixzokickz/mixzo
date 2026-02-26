'use client'

import { useState } from 'react'
import { Phone, Mail, MapPin, Send } from 'lucide-react'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BUSINESS_PHONE, BUSINESS_EMAIL, BUSINESS_LOCATION, BUSINESS_INSTAGRAM } from '@/lib/constants'
import { toast } from 'sonner'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', category: 'general', message: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Message sent! We will get back to you soon.')
      setForm({ name: '', email: '', subject: '', category: 'general', message: '' })
      setSubmitted(true)
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-24 px-6 md:px-12 lg:px-16 pb-mobile-nav">
        <div className="max-w-4xl mx-auto py-6">
          <h1 className="text-2xl font-bold mb-2">Contact Us</h1>
          <p className="text-text-muted mb-8">Have a question? We are here to help.</p>

          <div className="grid md:grid-cols-2 gap-8">
            {submitted ? (
              <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border)] p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                  <Send className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Message Sent!</h3>
                <p className="text-sm text-[var(--text-secondary)]">We&apos;ll get back to you as soon as possible.</p>
                <button onClick={() => setSubmitted(false)} className="text-sm text-[var(--pink)] hover:underline mt-2">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input placeholder="Your name" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} />
                <Input placeholder="Your email" type="email" value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} />
                <Input placeholder="Subject" value={form.subject} onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))} />
                <select
                  value={form.category}
                  onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--pink)] transition-colors"
                >
                  <option value="general">General</option>
                  <option value="order_issue">Order Issue</option>
                  <option value="returns">Returns</option>
                  <option value="cleaning">Cleaning</option>
                </select>
                <textarea
                  placeholder="Your message"
                  value={form.message}
                  onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-white text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--pink)] resize-none transition-colors"
                />
                <Button type="submit" disabled={loading} size="lg" className="w-full">
                  <Send className="w-4 h-4" />
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}

            <div className="space-y-6">
              <div className="rounded-xl bg-card border border-border p-6 space-y-4">
                <h3 className="font-semibold">Get in Touch</h3>
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <Phone className="w-4 h-4 text-pink shrink-0" />
                  <a href={`tel:${BUSINESS_PHONE}`} className="hover:text-text transition-colors">{BUSINESS_PHONE}</a>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <Mail className="w-4 h-4 text-pink shrink-0" />
                  <a href={`mailto:${BUSINESS_EMAIL}`} className="hover:text-text transition-colors">{BUSINESS_EMAIL}</a>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <MapPin className="w-4 h-4 text-pink shrink-0" />
                  {BUSINESS_LOCATION}
                </div>
                <p className="text-sm text-text-secondary">
                  Instagram: <a href={`https://instagram.com/${BUSINESS_INSTAGRAM.replace('@', '')}`} className="text-pink hover:underline" target="_blank" rel="noopener noreferrer">{BUSINESS_INSTAGRAM}</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
