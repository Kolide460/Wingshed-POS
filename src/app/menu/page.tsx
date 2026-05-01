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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="ws-header">
        <div className="ws-header-inner">
          <div className="ws-logo">
            <div className="ws-logo-icon">🍗</div>
            Wingshed
          </div>
          <button className="ws-cart-btn" onClick={() => setCartOpen(true)}>
            {itemCount > 0 && <span className="ws-cart-badge">{itemCount}</span>}
            🛒 {itemCount === 0 ? 'Cart' : formatPrice(total)}
          </button>
        </div>
        <CategoryTabs
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
        />
      </header>

      <main style={{ flex: 1, paddingBottom: itemCount > 0 ? 80 : 0 }}>
        <div className="ws-grid">
          {visibleItems.map((item) => (
            <MenuItemCard key={item.id} item={item} onAdd={addItem} />
          ))}
          {visibleItems.length === 0 && categories.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 0', color: 'var(--muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🍗</div>
              <p>Menu loading…</p>
            </div>
          )}
          {visibleItems.length === 0 && categories.length > 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 0', color: 'var(--muted)' }}>
              <p>Nothing in this category yet.</p>
            </div>
          )}
        </div>
      </main>

      {itemCount > 0 && (
        <div className="ws-bottom-bar">
          <button className="ws-bottom-btn" onClick={() => setCartOpen(true)}>
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
