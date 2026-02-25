'use client'

import Link from 'next/link'
import Image from 'next/image'
import { CONDITION_LABELS } from '@/lib/constants'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  id: string
  name: string
  brand: string
  size: string
  price: number
  condition: string
  image_url: string | null
}

export function ProductCard({ id, name, brand, size, price, condition, image_url }: ProductCardProps) {
  const isNew = condition === 'new'
  const conditionLabel = CONDITION_LABELS[condition] || condition

  return (
    <Link href={`/product/${id}`} className="block group">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden card-hover">
        <div className="relative aspect-square bg-[var(--bg-elevated)]">
          {image_url ? (
            <Image
              src={image_url}
              alt={name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-sm">
              No Image
            </div>
          )}
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white ${
              isNew ? 'bg-[var(--blue)]' : 'bg-[var(--pink)]'
            }`}
          >
            {conditionLabel}
          </span>
        </div>
        <div className="p-4">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">{brand}</p>
          <h3 className="text-sm font-semibold text-white truncate mb-1 group-hover:text-[var(--pink)] transition-colors">
            {name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-white">{formatPrice(price)}</span>
            <span className="text-xs text-[var(--text-muted)]">Size {size}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
