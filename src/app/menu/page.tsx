'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ItemDetail } from '@/components/menu/ItemDetail'
import { CartDrawer } from '@/components/menu/CartDrawer'
import { useCart } from '@/hooks/useCart'
import type { Category, MenuItem } from '@/types'

type Mode = 'pickup' | 'delivery'

const CATEGORY_GLYPHS: Record<string, JSX.Element> = {
  wings: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 18c2-6 7-9 12-10 1 3-1 8-5 11-3 2-6 1-7-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M9 16l-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  buns: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 12a9 4 0 0118 0" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M3 13h18M5 16h14M7 19h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  sides: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M7 9h10l-1 12H8L7 9z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M10 9V4M13 9V6M16 9V5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  drinks: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M7 4h10l-1 17H8L7 4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M7.5 9h9" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ),
}

function getGlyph(catName: string) {
  const key = catName.toLowerCase()
  for (const k of Object.keys(CATEGORY_GLYPHS)) {
    if (key.includes(k)) return CATEGORY_GLYPHS[k]
  }
  return CATEGORY_GLYPHS['wings']
}

function Money({ value }: { value: number }) {
  const [whole, frac] = value.toFixed(2).split('.')
  return (
    <span className="ws-money" style={{ fontSize: 14 }}>
      <span className="ws-money-symbol">£</span>{whole}<span className="ws-money-frac">.{frac}</span>
    </span>
  )
}

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<Mode>('pickup')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const { items: cartItems, addItem, removeItem, updateQuantity, updateNotes, total, itemCount } = useCart()

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const [{ data: cats }, { data: menuItems }] = await Promise.all([
        supabase.from('categories').select('*').order('display_order'),
        supabase.from('menu_items').select('*').eq('active', true).order('display_order'),
      ])
      setCategories((cats ?? []) as Category[])
      setItems((menuItems ?? []) as MenuItem[])
    }
    load()
  }, [])

  const visibleItems = useMemo(() =>
    items
      .filter(i => activeCategory === 'all' || i.category_id === activeCategory)
      .filter(i => !query || i.name.toLowerCase().includes(query.toLowerCase())),
    [items, activeCategory, query]
  )

  const selectedCategoryName = categories.find(c => c.id === selectedItem?.category_id)?.name ?? ''

  return (
    <div className="ws-page">
      {/* Header */}
      <div className="ws-header">
        <div className="ws-header-row">
          <div className="ws-logo">
            <LogoMark />
            <span className="ws-logo-word">wingshed</span>
          </div>
          <button className="ws-icon-btn" aria-label="Orders">
            <ReceiptIcon />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="ws-mode-toggle">
          <button
            className={`ws-mode-btn${mode === 'pickup' ? ' active' : ''}`}
            onClick={() => setMode('pickup')}
          >
            <span className="ws-mode-btn-label"><PinIcon /> Pickup</span>
            <span className="ws-mode-btn-sub">Ready ~12 min</span>
          </button>
          <button
            className={`ws-mode-btn${mode === 'delivery' ? ' active' : ''}`}
            onClick={() => setMode('delivery')}
          >
            <span className="ws-mode-btn-label"><BikeIcon /> Delivery</span>
            <span className="ws-mode-btn-sub">25–35 min</span>
          </button>
        </div>

        <h1 className="ws-greeting">What's your damage<br/>tonight?</h1>
        <p className="ws-greeting-sub">Kitchen open · ~12 min wait</p>

        {/* Search */}
        <div className="ws-search">
          <span style={{ color: 'var(--ws-ink-muted)', display: 'flex' }}><SearchIcon /></span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search the menu"
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="ws-chips scrollbar-hide">
        <button
          className={`ws-chip${activeCategory === 'all' ? ' active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All
        </button>
        {categories.map(c => (
          <button
            key={c.id}
            className={`ws-chip${activeCategory === c.id ? ' active' : ''}`}
            onClick={() => setActiveCategory(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Item list */}
      <div className="ws-menu-list scrollbar-hide">
        {visibleItems.length === 0 && query && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ws-ink-muted)', fontSize: 14 }}>
            Nothing matches "{query}"
          </div>
        )}
        {visibleItems.length === 0 && !query && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ws-ink-muted)', fontSize: 14 }}>
            Loading menu…
          </div>
        )}
        {visibleItems.map(item => {
          const cat = categories.find(c => c.id === item.category_id)
          return (
            <button key={item.id} className="ws-menu-row" onClick={() => setSelectedItem(item)}>
              <div className="ws-item-glyph" style={{ color: 'var(--ws-ink-soft)' }}>
                {getGlyph(cat?.name ?? '')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span className="ws-item-name">{item.name}</span>
                </div>
                {item.description && <div className="ws-item-desc">{item.description}</div>}
              </div>
              <div style={{ flexShrink: 0, color: 'var(--ws-ink)' }}>
                <Money value={item.price} />
              </div>
            </button>
          )
        })}
        {visibleItems.length > 0 && (
          <div className="ws-menu-footer">
            Wingshed · est. 2021 · made in a hurry, eaten faster
          </div>
        )}
      </div>

      {/* Floating cart bar */}
      {itemCount > 0 && (
        <div className="ws-float-bar" onClick={() => setCartOpen(true)}>
          <div className="ws-float-left">
            <div className="ws-float-count">{itemCount}</div>
            <span className="ws-float-label">View basket</span>
          </div>
          <div className="ws-float-right">
            <Money value={total} />
            <span style={{ opacity: 0.6, display: 'flex' }}><ChevronRight /></span>
          </div>
        </div>
      )}

      {/* Item detail overlay */}
      {selectedItem && (
        <ItemDetail
          item={selectedItem}
          categoryName={selectedCategoryName}
          onClose={() => setSelectedItem(null)}
          onAdd={(item, notes) => { addItem(item, notes); setSelectedItem(null) }}
        />
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <CartDrawer
          items={cartItems}
          total={total}
          mode={mode}
          onUpdateQuantity={updateQuantity}
          onUpdateNotes={updateNotes}
          onRemove={removeItem}
          onClose={() => setCartOpen(false)}
        />
      )}
    </div>
  )
}

/* Icons */
function LogoMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1H4a1 1 0 01-1-1v-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 16c0-2 1.3-3.3 3-3.3s3 1 3 3h.5c.5 0 .5.7 0 .8L14 17c-.3 1-1.2 1.5-2 1.5s-1.7-.5-2-1.5l-.5-.2c-.5-.1-.5-.8 0-.8z" fill="currentColor"/>
    </svg>
  )
}
function ReceiptIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}
function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 21s7-7.5 7-12a7 7 0 10-14 0c0 4.5 7 12 7 12z" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}
function BikeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="17" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="18" cy="17" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 17l5-9h5l2 9M11 8l-2-3H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
