'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import { formatPrice, formatDate } from '@/lib/utils'
import { SITE_NAME, BUSINESS_EMAIL, BUSINESS_PHONE, BUSINESS_LOCATION } from '@/lib/constants'

interface Order {
  id: string; created_at: string; total: number; items: Array<{ name: string; size: string; condition: string; price: number; quantity: number }>;
  shipping_address: { name: string; line1: string; line2?: string; city: string; state: string; zip: string };
  customer_name: string;
}

export default function PackingSlipPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    supabase.from('orders').select('*').eq('id', params.id).single()
      .then(({ data }) => { setOrder(data); if (data) setTimeout(() => window.print(), 500) })
  }, [params.id])

  if (!order) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="min-h-screen bg-white text-black p-8 max-w-2xl mx-auto print:p-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`@media print { body { background: white; } .no-print { display: none; } }`}</style>

      <button onClick={() => window.print()} className="no-print mb-6 px-4 py-2 bg-black text-white rounded-lg text-sm">
        Print Packing Slip
      </button>

      <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold">{SITE_NAME}</h1>
          <p className="text-sm text-gray-500">{BUSINESS_LOCATION}</p>
          <p className="text-sm text-gray-500">{BUSINESS_EMAIL}</p>
          <p className="text-sm text-gray-500">{BUSINESS_PHONE}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">PACKING SLIP</p>
          <p className="text-sm text-gray-500">#{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
        </div>
      </div>

      {order.shipping_address && (
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ship To</p>
          <p className="font-medium">{order.shipping_address.name}</p>
          <p className="text-sm text-gray-600">{order.shipping_address.line1}</p>
          {order.shipping_address.line2 && <p className="text-sm text-gray-600">{order.shipping_address.line2}</p>}
          <p className="text-sm text-gray-600">{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}</p>
        </div>
      )}

      <table className="w-full text-sm mb-8">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-2 font-semibold">Item</th>
            <th className="text-center py-2 font-semibold">Size</th>
            <th className="text-center py-2 font-semibold">Qty</th>
            <th className="text-right py-2 font-semibold">Price</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-3">{item.name}</td>
              <td className="py-3 text-center">{item.size}</td>
              <td className="py-3 text-center">{item.quantity}</td>
              <td className="py-3 text-right">{formatPrice(item.price)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200">
            <td colSpan={3} className="py-3 text-right font-bold">Total</td>
            <td className="py-3 text-right font-bold">{formatPrice(order.total)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="text-center text-xs text-gray-400 border-t border-gray-200 pt-4">
        <p>Thank you for your purchase. Every pair is verified authentic.</p>
        <p className="mt-1">{SITE_NAME} &middot; {BUSINESS_LOCATION}</p>
      </div>
    </div>
  )
}
