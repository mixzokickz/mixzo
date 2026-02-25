'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, Check, Truck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { CONDITION_LABELS, FREE_SHIPPING_THRESHOLD } from '@/lib/constants'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/stores/cart'
import { ProductCard } from '@/components/shop/product-card'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  brand: string
  size: string
  price: number
  market_price: number | null
  condition: string
  description: string | null
  image_url: string | null
  images: string[] | null
  status: string
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (!data) { setLoading(false); return }
      setProduct(data)

      const { data: rel } = await supabase
        .from('products')
        .select('id, name, brand, size, price, condition, image_url, status')
        .eq('status', 'active')
        .neq('id', id)
        .limit(4)

      setRelated((rel || []) as Product[])
      setLoading(false)
    }
    load()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      size: product.size,
      price: product.price,
      condition: product.condition,
      image_url: product.image_url,
    })
    setAdded(true)
    toast.success('Added to cart')
    setTimeout(() => setAdded(false), 2000)
  }

  const allImages = product
    ? [product.image_url, ...(product.images || [])].filter(Boolean) as string[]
    : []

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
        <ShopHeader />
        <div className="flex-1 flex items-center justify-center text-[var(--text-muted)]">Loading...</div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
        <ShopHeader />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-[var(--text-muted)]">
          <p className="text-lg">Product not found</p>
          <Link href="/shop" className="btn-gradient px-6 py-2 rounded-lg text-white text-sm font-semibold">Back to Shop</Link>
        </div>
        <Footer />
      </div>
    )
  }

  const isNew = product.condition === 'new'
  const conditionLabel = CONDITION_LABELS[product.condition] || product.condition
  const savings = product.market_price ? product.market_price - product.price : null

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <ShopHeader />
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="relative aspect-square bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
              {allImages.length > 0 ? (
                <Image src={allImages[selectedImage]} alt={product.name} fill className="object-contain p-6" sizes="(max-width: 1024px) 100vw, 50vw" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">No Image</div>
              )}
              <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold text-white ${isNew ? 'bg-[var(--blue)]' : 'bg-[var(--pink)]'}`}>
                {conditionLabel}
              </span>
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-16 h-16 rounded-lg border shrink-0 overflow-hidden ${
                      i === selectedImage ? 'border-[var(--pink)]' : 'border-[var(--border)]'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-contain p-1" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <p className="text-sm text-[var(--text-muted)] uppercase tracking-wide mb-1">{product.brand}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">{product.name}</h1>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold gradient-text">{formatPrice(product.price)}</span>
              {product.market_price && product.market_price > product.price && (
                <span className="text-lg text-[var(--text-muted)] line-through">{formatPrice(product.market_price)}</span>
              )}
            </div>

            {savings && savings > 0 && (
              <p className="text-sm text-green-400 mb-4">
                You save {formatPrice(savings)} vs market price
              </p>
            )}

            <div className="flex flex-wrap gap-3 mb-6">
              <div className="px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
                <p className="text-xs text-[var(--text-muted)]">Size</p>
                <p className="text-sm font-semibold text-white">{product.size}</p>
              </div>
              <div className="px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
                <p className="text-xs text-[var(--text-muted)]">Condition</p>
                <p className="text-sm font-semibold text-white">{conditionLabel}</p>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full btn-gradient py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 mb-4"
            >
              {added ? <><Check className="w-5 h-5" /> Added to Cart</> : <><ShoppingBag className="w-5 h-5" /> Add to Cart</>}
            </button>

            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-6">
              <Truck className="w-4 h-4" />
              {product.price >= FREE_SHIPPING_THRESHOLD ? 'Free Shipping' : `Free shipping on orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)}`}
            </div>

            {product.description && (
              <div className="border-t border-[var(--border)] pt-6">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-2">Description</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-white mb-6">More Sneakers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
