'use client'

import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import type { CartItem } from '@/types'

interface Props {
  items: CartItem[]
  total: number
  onUpdateQuantity: (index: number, qty: number) => void
  onUpdateNotes: (index: number, notes: string) => void
  onRemove: (index: number) => void
  onClose: () => void
}

export function CartDrawer({ items, total, onUpdateQuantity, onUpdateNotes, onRemove, onClose }: Props) {
  const router = useRouter()

  return (
    <>
      <div className="ws-drawer-overlay" onClick={onClose} />
      <div className="ws-drawer">
        <div className="ws-drawer-header">
          <span className="ws-drawer-title">Your order</span>
          <button className="ws-drawer-close" onClick={onClose}>×</button>
        </div>

        <div className="ws-drawer-items">
          {items.length === 0 && (
            <div className="ws-empty">
              <div className="ws-empty-icon">🛒</div>
              <p>Your cart is empty</p>
            </div>
          )}
          {items.map((item, idx) => (
            <div key={idx} className="ws-drawer-item">
              <div className="ws-drawer-item-row">
                <div className="ws-qty-controls">
                  <button className="ws-qty-btn" onClick={() => onUpdateQuantity(idx, item.quantity - 1)}>−</button>
                  <span className="ws-qty-num">{item.quantity}</span>
                  <button className="ws-qty-btn plus" onClick={() => onUpdateQuantity(idx, item.quantity + 1)}>+</button>
                </div>
                <span className="ws-item-name">{item.menu_item.name}</span>
                <span className="ws-item-price">{formatPrice(item.menu_item.price * item.quantity)}</span>
                <button className="ws-remove-btn" onClick={() => onRemove(idx)}>×</button>
              </div>
              <input
                type="text"
                className="ws-note-input"
                style={{ marginTop: 8 }}
                placeholder="Add a note…"
                value={item.notes}
                onChange={(e) => onUpdateNotes(idx, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="ws-drawer-footer">
          <div className="ws-total-row">
            <span className="ws-total-label">Total</span>
            <span className="ws-total-amount">{formatPrice(total)}</span>
          </div>
          <button
            className="ws-checkout-btn"
            disabled={items.length === 0}
            onClick={() => { onClose(); router.push('/checkout') }}
          >
            Go to checkout →
          </button>
        </div>
      </div>
    </>
  )
}
