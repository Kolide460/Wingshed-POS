'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CartItem, MenuItem } from '@/types'

const CART_KEY = 'wingshed_cart'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  const persist = useCallback((next: CartItem[]) => {
    setItems(next)
    localStorage.setItem(CART_KEY, JSON.stringify(next))
  }, [])

  const addItem = useCallback(
    (menuItem: MenuItem, notes = '') => {
      setItems((prev) => {
        const existing = prev.findIndex(
          (i) => i.menu_item.id === menuItem.id && i.notes === notes
        )
        const next =
          existing >= 0
            ? prev.map((i, idx) =>
                idx === existing ? { ...i, quantity: i.quantity + 1 } : i
              )
            : [...prev, { menu_item: menuItem, quantity: 1, notes }]
        localStorage.setItem(CART_KEY, JSON.stringify(next))
        return next
      })
    },
    []
  )

  const removeItem = useCallback((index: number) => {
    setItems((prev) => {
      const next = prev.filter((_, i) => i !== index)
      localStorage.setItem(CART_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const updateQuantity = useCallback((index: number, quantity: number) => {
    setItems((prev) => {
      const next =
        quantity <= 0
          ? prev.filter((_, i) => i !== index)
          : prev.map((item, i) => (i === index ? { ...item, quantity } : item))
      localStorage.setItem(CART_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const updateNotes = useCallback((index: number, notes: string) => {
    setItems((prev) => {
      const next = prev.map((item, i) => (i === index ? { ...item, notes } : item))
      localStorage.setItem(CART_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    localStorage.removeItem(CART_KEY)
    setItems([])
  }, [])

  const total = items.reduce(
    (sum, i) => sum + i.menu_item.price * i.quantity,
    0
  )

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return { items, addItem, removeItem, updateQuantity, updateNotes, clearCart, total, itemCount }
}
