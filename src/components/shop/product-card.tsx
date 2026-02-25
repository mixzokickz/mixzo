'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ConditionBadge } from '@/components/ui/badge'
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
  return (
    <Link href={`/product/${product.id}`} aria-label={`${product.name} - ${formatPrice(product.price)}`}>
      <div className="group rounded-xl bg-card border border-border overflow-hidden transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(255,46,136,0.1)] hover:border-pink/30">
        <div className="aspect-square relative bg-elevated overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain p-4 transition-all duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-text-muted text-sm">No Image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2.5 right-2.5">
            <ConditionBadge condition={product.condition} />
          </div>
        </div>
        <div className="p-3.5">
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">{product.brand}</p>
          <h3 className="text-sm font-semibold text-text mt-0.5 line-clamp-2 leading-snug group-hover:text-pink transition-colors duration-200">{product.name}</h3>
          <div className="flex items-center justify-between mt-2.5">
            <span className="text-base font-bold text-text">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-text-muted">Size {product.size}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
