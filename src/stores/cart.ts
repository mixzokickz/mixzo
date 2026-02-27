'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CleaningTier = 'cleaning' | 'cleaning_icing' | null

export interface CartItem {
  id: string
  name: string
  brand: string
  size: string
  price: number
  condition: string
  image_url: string | null
  quantity: number
  cleaning: CleaningTier
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity' | 'cleaning'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  setCleaning: (id: string, tier: CleaningTier) => void
  clear: () => void
  getTotal: () => number
  getCleaningTotal: () => number
  getCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id)
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          })
        } else {
          set({ items: [...get().items, { ...item, quantity: 1, cleaning: null }] })
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) })
        } else {
          set({
            items: get().items.map((i) =>
              i.id === id ? { ...i, quantity } : i
            ),
          })
        }
      },
      setCleaning: (id, tier) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, cleaning: tier } : i
          ),
        })
      },
      clear: () => set({ items: [] }),
      getTotal: () => {
        const items = get().items
        const itemTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
        const cleaningTotal = items.reduce((sum, i) => {
          if (!i.cleaning) return sum
          const price = i.cleaning === 'cleaning' ? 20 : 30
          return sum + price * i.quantity
        }, 0)
        return itemTotal + cleaningTotal
      },
      getCleaningTotal: () => get().items.reduce((sum, i) => {
        if (!i.cleaning) return sum
        const price = i.cleaning === 'cleaning' ? 20 : 30
        return sum + price * i.quantity
      }, 0),
      getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'mixzo-cart' }
  )
)
