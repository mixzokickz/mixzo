'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { SIZES, CONDITIONS } from '@/lib/constants'
import { generateOrderId } from '@/lib/utils'
import { toast } from 'sonner'

interface OrderItem { name: string; size: string; condition: string; price: string; quantity: string }

export default function NewOrderPage() {
  const router = useRouter()
  const [items, setItems] = useState<OrderItem[]>([{ name: '', size: '', condition: 'new', price: '', quantity: '1' }])
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' })
  const [address, setAddress] = useState({ line1: '', line2: '', city: '', state: '', zip: '' })
  const [saving, setSaving] = useState(false)

  const addItem = () => setItems([...items, { name: '', size: '', condition: 'new', price: '', quantity: '1' }])
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (i: number, key: string, val: string) => setItems(items.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const orderItems = items.map(i => ({ name: i.name, size: i.size, condition: i.condition, price: parseFloat(i.price), quantity: parseInt(i.quantity) || 1 }))
      const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
      const { error } = await supabase.from('orders').insert({
        id: generateOrderId(),
        customer_name: customer.name,
        customer_email: customer.email,
        items: orderItems,
        total,
        subtotal: total,
        shipping_cost: 0,
        discount: 0,
        status: 'confirmed',
        shipping_address: { name: customer.name, ...address },
      })
      if (error) throw error
      toast.success('Order created')
      router.push('/admin/orders')
    } catch { toast.error('Failed to create order') }
    finally { setSaving(false) }
  }

  const ic = 'w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none transition-colors'

  return (
    <div className="space-y-6 page-enter max-w-2xl">
      <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white"><ArrowLeft size={16} /> Orders</Link>
      <h1 className="text-2xl font-bold text-white">Create Manual Order</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Customer</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-[var(--text-secondary)] mb-1.5">Name</label><input value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className={ic} required /></div>
            <div><label className="block text-xs text-[var(--text-secondary)] mb-1.5">Email</label><input type="email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} className={ic} /></div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Items</h2>
            <button type="button" onClick={addItem} className="text-xs text-[var(--pink)] font-medium flex items-center gap-1"><Plus size={14} /> Add Item</button>
          </div>
          {items.map((item, i) => (
            <div key={i} className="p-3 bg-[var(--bg-elevated)] rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">Item {i + 1}</span>
                {items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>}
              </div>
              <input value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} placeholder="Product name" className={ic} required />
              <div className="grid grid-cols-4 gap-2">
                <select value={item.size} onChange={e => updateItem(i, 'size', e.target.value)} className={ic} required>
                  <option value="">Size</option>{SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={item.condition} onChange={e => updateItem(i, 'condition', e.target.value)} className={ic}>
                  {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <input type="number" value={item.price} onChange={e => updateItem(i, 'price', e.target.value)} placeholder="Price" className={ic} required />
                <input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} placeholder="Qty" className={ic} min="1" />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Shipping Address</h2>
          <input value={address.line1} onChange={e => setAddress({...address, line1: e.target.value})} placeholder="Address line 1" className={ic} />
          <input value={address.line2} onChange={e => setAddress({...address, line2: e.target.value})} placeholder="Address line 2" className={ic} />
          <div className="grid grid-cols-3 gap-3">
            <input value={address.city} onChange={e => setAddress({...address, city: e.target.value})} placeholder="City" className={ic} />
            <input value={address.state} onChange={e => setAddress({...address, state: e.target.value})} placeholder="State" className={ic} />
            <input value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} placeholder="ZIP" className={ic} />
          </div>
        </div>

        <button type="submit" disabled={saving} className="w-full bg-[#FF2E88] hover:opacity-90 py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 text-sm">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          {saving ? 'Creating...' : 'Create Order'}
        </button>
      </form>
    </div>
  )
}
