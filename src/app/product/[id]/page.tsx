'use client'

import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, Truck, Shield, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/stores/cart'
import { ShopHeader } from '@/components/layout/shop-header'
import { Footer } from '@/components/layout/footer'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { ProductCard } from '@/components/shop/product-card'
import { ConditionBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  brand: string
  price: number
  size: string
  condition: string
  image_url: string | null
  description: string | null
  colorway: string | null
  stockx_price: number | null
  status: string
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Pick<Product, 'id' | 'name' | 'brand' | 'price' | 'size' | 'condition' | 'image_url'>[]>([])
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        setProduct(data)
        const { data: rel } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .neq('id', id)
          .ilike('brand', `%${data.brand}%`)
          .limit(4)
        setRelated(rel || [])
      }
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
    toast.success('Added to cart')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <ShopHeader />
        <main className="flex-1 pt-24 px-6 md:px-12 lg:px-16">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="space-y-4 py-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <ShopHeader />
        <main className="flex-1 pt-20 flex flex-col items-center justify-center text-center px-4">
          <Package className="w-16 h-16 text-text-muted mb-4" />
          <h1 className="text-2xl font-bold mb-2">Product not found</h1>
          <p className="text-text-muted mb-6">This product may have been removed or sold.</p>
          <Link href="/shop"><Button variant="secondary">Back to Shop</Button></Link>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ShopHeader />
      <main className="flex-1 pt-24 px-6 md:px-12 lg:px-16 pb-mobile-nav">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
            <Link href="/" className="hover:text-text transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-text transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-text truncate max-w-[200px]">{product?.name || 'Product'}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Image */}
            <div className="aspect-square relative rounded-2xl bg-card border border-border overflow-hidden">
              {product.image_url ? (
                <Image src={product.image_url} alt={product.name} fill className="object-contain p-8" sizes="(max-width: 768px) 100vw, 50vw" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted">No Image</div>
              )}
            </div>

            {/* Details */}
            <div className="py-2">
              <p className="text-sm font-medium text-text-muted uppercase tracking-wider">{product.brand}</p>
              <h1 className="text-2xl md:text-3xl font-bold mt-1">{product.name}</h1>
              {product.colorway && <p className="text-sm text-text-secondary mt-1">{product.colorway}</p>}

              <div className="flex items-center gap-3 mt-4">
                <ConditionBadge condition={product.condition} />
                <span className="text-sm text-text-muted">Size {product.size}</span>
              </div>

              <div className="mt-6">
                <span className="text-3xl font-black">{formatPrice(product.price)}</span>
                {product.stockx_price && product.stockx_price > product.price && (
                  <div className="mt-1.5">
                    <span className="text-sm text-text-muted line-through mr-2">{formatPrice(product.stockx_price)}</span>
                    <span className="text-sm text-cyan font-semibold">
                      Save {Math.round((1 - product.price / product.stockx_price) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              <Button onClick={handleAddToCart} size="lg" className="w-full mt-8">
                <ShoppingBag className="w-5 h-5" />
                Add to Cart
              </Button>

              {product.description && (
                <div className="mt-8">
                  <h3 className="text-sm font-semibold mb-2">Description</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{product.description}</p>
                </div>
              )}

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <Truck className="w-4 h-4 text-pink shrink-0" />
                  {product.price >= FREE_SHIPPING_THRESHOLD ? 'Free shipping' : `Free shipping on orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)}`}
                </div>
                <div className="flex items-center gap-3 text-sm text-text-secondary">
                  <Shield className="w-4 h-4 text-pink shrink-0" />
                  Authenticity guaranteed
                </div>
              </div>
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-16">
              <h2 className="text-xl font-bold mb-6">You Might Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {related.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
