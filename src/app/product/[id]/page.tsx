'use client'

import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Truck, Shield, Package, ChevronLeft, ChevronRight, Share2, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
  images: string[] | null
  description: string | null
  colorway: string | null
  style_id: string | null
  stockx_price: number | null
  has_box: boolean | null
  status: string
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Pick<Product, 'id' | 'name' | 'brand' | 'price' | 'size' | 'condition' | 'image_url'>[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [imageDirection, setImageDirection] = useState(0)
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

  // Build gallery from images array + image_url fallback
  const gallery: string[] = []
  if (product?.images?.length) {
    gallery.push(...product.images)
  } else if (product?.image_url) {
    gallery.push(product.image_url)
  }

  const navigateImage = (dir: number) => {
    setImageDirection(dir)
    setSelectedImage(prev => {
      const next = prev + dir
      if (next < 0) return gallery.length - 1
      if (next >= gallery.length) return 0
      return next
    })
  }

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      size: product.size,
      price: product.price,
      condition: product.condition,
      image_url: gallery[0] || product.image_url,
    })
    toast.success('Added to cart')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product?.name, url: window.location.href })
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
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
            <span className="text-text truncate max-w-[200px]">{product.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="aspect-square relative rounded-2xl bg-card border border-border overflow-hidden group">
                {gallery.length > 0 ? (
                  <>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={selectedImage}
                        initial={{ opacity: 0, x: imageDirection * 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: imageDirection * -30 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0"
                      >
                        <Image
                          src={gallery[selectedImage]}
                          alt={product.name}
                          fill
                          className="object-contain p-8"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Navigation arrows */}
                    {gallery.length > 1 && (
                      <>
                        <button
                          onClick={() => navigateImage(-1)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/60"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => navigateImage(1)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/60"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        {/* Dots */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {gallery.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => { setImageDirection(i > selectedImage ? 1 : -1); setSelectedImage(i) }}
                              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === selectedImage ? 'bg-white w-5' : 'bg-white/40 hover:bg-white/60'}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted">No Image</div>
                )}
              </div>

              {/* Thumbnail strip */}
              {gallery.length > 1 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => { setImageDirection(i > selectedImage ? 1 : -1); setSelectedImage(i) }}
                      className={`w-16 h-16 rounded-xl border-2 overflow-hidden shrink-0 cursor-pointer transition-all ${
                        i === selectedImage ? 'border-pink' : 'border-border hover:border-text-muted'
                      }`}
                    >
                      <Image src={img} alt="" width={64} height={64} className="w-full h-full object-contain p-1 bg-card" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="py-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-text-muted uppercase tracking-wider">{product.brand}</p>
                  <h1 className="text-2xl md:text-3xl font-bold mt-1">{product.name}</h1>
                </div>
                <button
                  onClick={handleShare}
                  className="shrink-0 w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-text-muted transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {product.colorway && <p className="text-sm text-text-secondary mt-1">{product.colorway}</p>}
              {product.style_id && <p className="text-xs text-text-muted mt-0.5 font-mono">{product.style_id}</p>}

              <div className="flex items-center gap-3 mt-4">
                <ConditionBadge condition={product.condition} />
                <span className="text-sm text-text-muted">Size {product.size}</span>
                {product.has_box !== null && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-card border border-border text-text-muted">
                    {product.has_box ? 'With Box' : 'No Box'}
                  </span>
                )}
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

              <div className="mt-8 space-y-3 p-4 rounded-xl bg-card border border-border">
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
            <section className="mt-16 pb-8">
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
