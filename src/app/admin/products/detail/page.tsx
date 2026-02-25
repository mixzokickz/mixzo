'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Package } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import { CONDITION_LABELS } from '@/lib/constants'

interface Product {
  id: string; name: string; brand: string; style_id: string; size: string;
  condition: string; price: number; cost: number | null; quantity: number;
  images: string[]; status: string; description: string; created_at: string;
}

export default function ProductDetailPage() {
  const searchParams = useSearchParams()
  const productId = searchParams.get('id')
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!productId) { setLoading(false); return }
    supabase.from('products').select('*').eq('id', productId).single().then(({ data }) => {
      setProduct(data)
      setLoading(false)
    })
  }, [productId])

  if (loading) return <div className="space-y-4"><div className="skeleton h-8 w-40" /><div className="skeleton h-64 rounded-xl" /></div>

  if (!product) {
    return (
      <div className="text-center py-16">
        <Package size={48} className="text-[var(--text-muted)] mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">Product not found</h2>
        <Link href="/admin/products" className="text-sm text-[var(--pink)] hover:underline">Back to products</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 page-enter max-w-2xl">
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
        <ArrowLeft size={16} /> Products
      </Link>

      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold text-white">{product.name}</h1>
        <Link href={`/admin/products/${product.id}/edit`} className="flex items-center gap-2 text-sm text-[var(--pink)] hover:underline">
          <Edit size={14} /> Edit
        </Link>
      </div>

      {product.images?.length > 0 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {product.images.map((img, i) => (
            <img key={i} src={img} alt="" className="w-32 h-32 rounded-xl object-contain bg-white border border-[var(--border)] flex-shrink-0" />
          ))}
        </div>
      )}

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5 space-y-3">
        {[
          ['Brand', product.brand],
          ['Style ID', product.style_id],
          ['Size', product.size],
          ['Condition', CONDITION_LABELS[product.condition] || product.condition],
          ['Price', formatPrice(product.price)],
          ['Cost', product.cost ? formatPrice(product.cost) : '-'],
          ['Quantity', product.quantity.toString()],
          ['Status', product.status],
          ['Added', formatDate(product.created_at)],
        ].map(([label, value]) => (
          <div key={label as string} className="flex justify-between text-sm">
            <span className="text-[var(--text-muted)]">{label}</span>
            <span className="text-white font-medium">{value}</span>
          </div>
        ))}
      </div>

      {product.description && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
          <p className="text-sm text-[var(--text-secondary)]">{product.description}</p>
        </div>
      )}
    </div>
  )
}
