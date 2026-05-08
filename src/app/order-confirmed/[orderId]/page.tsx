import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import type { Order, OrderItem } from '@/types'

function Money({ value, size = 14 }: { value: number; size?: number }) {
  const [whole, frac] = value.toFixed(2).split('.')
  return (
    <span className="ws-money" style={{ fontSize: size, fontWeight: 500 }}>
      <span className="ws-money-symbol">£</span>{whole}<span className="ws-money-frac">.{frac}</span>
    </span>
  )
}

function formatPickupTime(iso: string) {
  const d = new Date(iso)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

function formatOrderDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function OrderConfirmedPage({ params }: { params: { orderId: string } }) {
  const supabase = createServiceClient()
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', params.orderId)
    .single()

  if (!order) {
    return (
      <div className="ws-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--ws-ink-muted)' }}>Order not found</p>
        <Link href="/menu" style={{ color: 'var(--ws-accent)', marginTop: 8, display: 'block', textAlign: 'center' }}>
          Back to menu
        </Link>
      </div>
    )
  }

  const o = order as Order
  const items = (o.order_items ?? []) as OrderItem[]
  const orderCode = `WS-${String(o.order_number).padStart(4, '0')}`
  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0)
  const tip = Number(o.total) - subtotal
  const payLabel = o.payment_method === 'stripe' ? 'Paid online' : 'Pay on collection'

  return (
    <div className="ws-page" style={{ overflowY: 'auto', paddingBottom: 40 }}>
      {/* Tick header */}
      <div className="ws-receipt-header">
        <div className="ws-confirm-tick" style={{ width: 68, height: 68, marginBottom: 18 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="ws-confirm-h1" style={{ marginBottom: 4 }}>Order confirmed</h1>
        <p className="ws-confirm-sub" style={{ marginBottom: 0 }}>
          Head to Wing Shed when you see your code called
        </p>
      </div>

      {/* Receipt card */}
      <div className="ws-receipt-card">
        {/* Shop header */}
        <div className="ws-receipt-shop">
          <div className="ws-receipt-shop-name">Wing Shed</div>
          <div className="ws-receipt-shop-addr">College Rd, Gloweth, Truro TR1 3GD</div>
        </div>

        <div className="ws-receipt-divider" />

        {/* Order meta */}
        <div className="ws-receipt-meta-grid">
          <div>
            <div className="ws-receipt-label">Order</div>
            <div className="ws-receipt-value" style={{ fontFamily: 'var(--font-geist-mono), monospace', fontWeight: 700 }}>{orderCode}</div>
          </div>
          <div>
            <div className="ws-receipt-label">Date</div>
            <div className="ws-receipt-value">{formatOrderDate(o.created_at)}</div>
          </div>
          <div>
            <div className="ws-receipt-label">Name</div>
            <div className="ws-receipt-value">{o.customer_name}</div>
          </div>
          <div>
            <div className="ws-receipt-label">Collection</div>
            <div className="ws-receipt-value">{formatPickupTime(o.pickup_time)}</div>
          </div>
        </div>

        <div className="ws-receipt-divider ws-receipt-divider--dashed" />

        {/* Items */}
        <div className="ws-receipt-items">
          {items.map((item) => (
            <div key={item.id} className="ws-receipt-item">
              <div className="ws-receipt-item-left">
                <span className="ws-receipt-item-qty">{item.quantity}×</span>
                <div>
                  <div className="ws-receipt-item-name">{item.menu_item_name}</div>
                  {item.notes && <div className="ws-receipt-item-note">{item.notes}</div>}
                </div>
              </div>
              <div className="ws-receipt-item-price">
                <Money value={item.unit_price * item.quantity} />
              </div>
            </div>
          ))}
        </div>

        <div className="ws-receipt-divider ws-receipt-divider--dashed" />

        {/* Totals */}
        <div className="ws-receipt-totals">
          <div className="ws-receipt-total-row">
            <span>Subtotal</span>
            <span><Money value={subtotal} /></span>
          </div>
          {tip > 0.005 && (
            <div className="ws-receipt-total-row">
              <span>Tip</span>
              <span><Money value={tip} /></span>
            </div>
          )}
          <div className="ws-receipt-total-row ws-receipt-total-row--bold">
            <span>Total</span>
            <span><Money value={Number(o.total)} size={16} /></span>
          </div>
          <div className="ws-receipt-total-row" style={{ marginTop: 6 }}>
            <span style={{ color: 'var(--ws-ink-muted)', fontSize: 12 }}>{payLabel}</span>
          </div>
        </div>

        <div className="ws-receipt-divider" />

        {/* Order code spotlight */}
        <div className="ws-receipt-code-block">
          <div className="ws-receipt-code-label">Your order code</div>
          <div className="ws-receipt-code">{orderCode}</div>
          <div className="ws-receipt-code-hint">Show this at the counter</div>
        </div>

        <div className="ws-receipt-footer-msg">
          Thank you for your order 🙌
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '20px 18px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <a
          href={`/api/print/${o.id}`}
          target="_blank"
          rel="noreferrer"
          className="ws-primary-btn"
          style={{ textDecoration: 'none', justifyContent: 'center' }}
        >
          Print receipt
        </a>
        <Link href="/menu" className="ws-ghost-btn">
          Back to menu
        </Link>
      </div>
    </div>
  )
}
