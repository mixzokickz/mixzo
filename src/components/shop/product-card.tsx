'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: {
    id: string
    name: string
    brand: string
    price: number
    size: string
    condition: string
    image_url: string | null
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const isNew = product.condition === 'new'

  return (
    <Link href={`/product/${product.id}`} aria-label={`${product.name} - ${formatPrice(product.price)}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="group rounded-2xl bg-card border border-border overflow-hidden hover:shadow-[0_12px_40px_rgba(255,46,136,0.08)] hover:border-pink/20 transition-[box-shadow,border-color] duration-300"
      >
        <div className="aspect-square relative bg-elevated overflow-hidden">
          {product.image_url ? (
            <motion.div className="w-full h-full" whileHover={{ scale: 1.08 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-contain p-4"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </motion.div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-text-muted text-sm">No Image</span>
            </div>
          )}
        </div>
        <div className="p-3.5">
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">{product.brand}</p>
          <h3 className="text-sm font-semibold text-text mt-0.5 line-clamp-2 leading-snug">{product.name}</h3>
          <div className="flex items-center justify-between mt-2.5">
            <span className="text-base font-bold text-text">{formatPrice(product.price)}</span>
            <span className="text-xs text-text-muted bg-elevated px-2 py-0.5 rounded-full">US {product.size}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isNew ? 'bg-cyan' : 'bg-pink'}`} />
            <span className="text-[11px] text-text-muted">{isNew ? 'New' : 'Preowned'}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
