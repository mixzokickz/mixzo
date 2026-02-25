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
    <Link href={`/product/${product.id}`}>
      <div className="group rounded-xl bg-card border border-border overflow-hidden card-hover">
        <div className="aspect-square relative bg-elevated">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-text-muted text-sm">No Image</span>
            </div>
          )}
        </div>
        <div className="p-3.5">
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">{product.brand}</p>
          <h3 className="text-sm font-semibold text-text mt-0.5 line-clamp-2 leading-snug">{product.name}</h3>
          <p className="text-xs text-text-muted mt-1">Size {product.size}</p>
          <div className="flex items-center justify-between mt-2.5">
            <span className="text-base font-bold text-text">{formatPrice(product.price)}</span>
            <ConditionBadge condition={product.condition} />
          </div>
        </div>
      </div>
    </Link>
  )
}
