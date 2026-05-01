'use client'

import { useRouter } from 'next/navigation'
import type { CartItem } from '@/types'

interface Props {
  items: CartItem[]
  total: number
  mode: 'pickup' | 'delivery'
  onUpdateQuantity: (index: number, qty: number) => void
  onUpdateNotes: (index: number, notes: string) => void
  onRemove: (index: number) => void
  onClose: () => void
}

function Money({ value, size = 15 }: { value: number; size?: number }) {
  const [whole, frac] = value.toFixed(2).split('.')
  return (
    <span className="ws-money" style={{ fontSize: size }}>
      <span className="ws-money-symbol">£</span>{whole}<span className="ws-money-frac">.{frac}</span>
    </span>
  )
}

export function CartDrawer({ items, total, mode, onUpdateQuantity, onUpdateNotes, onRemove, onClose }: Props) {
  const router = useRouter()
  const delivery = mode === 'delivery' ? 2.50 : 0
  const grandTotal = total + delivery

  const parseMods = (notes: string) => {
    if (!notes) return []
    return notes.split(' | ').map(part => {
      const idx = part.indexOf(': ')
      if (idx === -1) return { label: '', value: part }
      return { label: part.slice(0, idx), value: part.slice(idx + 2) }
    })
  }

  return (
    <>
      <div className="ws-overlay" onClick={onClose} style={{ position: 'fixed', zIndex: 50 }} />
      <div className="ws-page" style={{ position: 'fixed', right: 0, left: '50%', transform: 'translateX(-50%)', top: 0, bottom: 0, zIndex: 51, maxWidth: 480, animation: 'wsFade 200ms ease both' }}>
        <div className="ws-cart-header">
          <button className="ws-icon-btn" onClick={onClose}>
            <BackIcon />
          </button>
          <div>
            <div className="ws-cart-title">Your basket</div>
            <div className="ws-cart-sub">
              {mode === 'delivery' ? 'Delivery · 25–35 min' : 'Pickup · ~12 min'}
            </div>
          </div>
        </div>

        <div className="ws-cart-body">
          {items.length === 0 && (
            <div className="ws-empty-state">
              <div className="ws-empty-title">Empty basket</div>
              <div className="ws-empty-sub">Add something from the menu.</div>
            </div>
          )}

          {items.map((item, idx) => {
            const mods = parseMods(item.notes)
            return (
              <div key={idx} className="ws-cart-line">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                    <span className="ws-cart-line-name">{item.menu_item.name}</span>
                    <span><Money value={item.menu_item.price * item.quantity} /></span>
                  </div>
                  {mods.map((m, mi) => (
                    <div key={mi} className="ws-cart-mod">
                      {m.label && <span className="ws-cart-mod-label">{m.label}: </span>}
                      {m.value}
                    </div>
                  ))}
                  <div style={{ marginTop: 10 }}>
                    <div className={`ws-stepper ws-stepper-compact`}>
                      <button
                        className="ws-stepper-btn"
                        onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                      >−</button>
                      <span className="ws-stepper-num">{item.quantity}</span>
                      <button
                        className="ws-stepper-btn"
                        onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                      >+</button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {items.length > 0 && (
            <div className="ws-summary">
              <div className="ws-summary-row">
                <span>Subtotal</span>
                <span><Money value={total} /></span>
              </div>
              {mode === 'delivery' && (
                <div className="ws-summary-row">
                  <span>Delivery</span>
                  <span><Money value={delivery} /></span>
                </div>
              )}
              <div className="ws-summary-row bold">
                <span>Total</span>
                <span><Money value={grandTotal} /></span>
              </div>

              <div className="ws-promo-hint">
                <span style={{ color: 'var(--ws-accent)', display: 'flex' }}>
                  <SparkIcon />
                </span>
                Add a promo code at checkout
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="ws-cart-footer">
            <button
              className="ws-primary-btn"
              onClick={() => { onClose(); router.push('/checkout') }}
            >
              <span>Checkout</span>
              <Money value={grandTotal} size={15} />
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function SparkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l1.8 5.7L19.5 10l-4.5 3.3L17 19l-5-3.5L7 19l2-5.7L4.5 10l5.7-1.3L12 3z" fill="currentColor"/>
    </svg>
  )
}
