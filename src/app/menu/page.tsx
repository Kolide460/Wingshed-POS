'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CategoryTabs } from '@/components/menu/CategoryTabs'
import { MenuItemCard } from '@/components/menu/MenuItemCard'
import { CartDrawer } from '@/components/menu/CartDrawer'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import type { Category, MenuItem } from '@/types'

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [cartOpen, setCartOpen] = useState(false)
  const { items: cartItems, addItem, removeItem, updateQuantity, updateNotes, total, itemCount } = useCart()

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const [{ data: cats }, { data: menuItems }] = await Promise.all([
        supabase.from('categories').select('*').order('display_order'),
        supabase.from('menu_items').select('*').order('display_order'),
      ])
      const c = (cats ?? []) as Category[]
      setCategories(c)
      setItems((menuItems ?? []) as MenuItem[])
      if (c.length) setActiveCategory(c[0].id)
    }
    load()
  }, [])

  const visibleItems = items.filter((i) => i.category_id === activeCategory)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍗</span>
            <h1 className="font-black text-xl tracking-tight">Wingshed</h1>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-xl font-semibold text-sm"
          >
            🛒 {itemCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{itemCount}</span>}
            {itemCount === 0 ? 'Cart' : formatPrice(total)}
          </button>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <CategoryTabs
            categories={categories}
            active={activeCategory}
            onChange={setActiveCategory}
          />
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visibleItems.map((item) => (
            <MenuItemCard key={item.id} item={item} onAdd={addItem} />
          ))}
        </div>
        {visibleItems.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-2">🍗</div>
            <p>Menu loading…</p>
          </div>
        )}
      </main>

      {itemCount > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 max-w-2xl mx-auto w-full">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full bg-brand-500 text-white py-3.5 rounded-xl font-bold text-base flex items-center justify-between px-4"
          >
            <span>View order ({itemCount})</span>
            <span>{formatPrice(total)}</span>
          </button>
        </div>
      )}

      {cartOpen && (
        <CartDrawer
          items={cartItems}
          total={total}
          onUpdateQuantity={updateQuantity}
          onUpdateNotes={updateNotes}
          onRemove={removeItem}
          onClose={() => setCartOpen(false)}
        />
      )}
    </div>
  )
}
