import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import type { Order } from '@/types'

function Money({ value }: { value: number }) {
  const [whole, frac] = value.toFixed(2).split('.')
  return (
    <span className="ws-money" style={{ fontSize: 13, fontWeight: 500 }}>
      <span className="ws-money-symbol">£</span>{whole}<span className="ws-money-frac">.{frac}</span>
    </span>
  )
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
  const isPickup = o.payment_method !== 'stripe' || true
  const orderCode = `WS-${String(o.order_number).padStart(4, '0')}`

  return (
    <div className="ws-page" style={{ paddingTop: 54, paddingBottom: 34 }}>
      <div className="ws-confirm-wrap">
        <div className="ws-confirm-tick">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className="ws-confirm-h1">Order in!</h1>
        <p className="ws-confirm-sub">
          {isPickup
            ? "Pick up at 108 Mare St when you see your code."
            : "We've passed it to the kitchen. Rider's lining up."}
        </p>

        <div className="ws-order-card">
          <div className="ws-eyebrow" style={{ marginBottom: 6 }}>Order code</div>
          <div className="ws-order-code">{orderCode}</div>
          <div className="ws-order-meta">
            <div style={{ textAlign: 'left' }}>
              <div className="ws-order-meta-label">Ready</div>
              <div className="ws-order-meta-value">~12 min</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="ws-order-meta-label">Paid</div>
              <div className="ws-order-meta-value"><Money value={Number(o.total)} /></div>
            </div>
          </div>
        </div>
      </div>

      <div className="ws-confirm-actions">
        <Link href="/menu" className="ws-ghost-btn">
          Back to menu
        </Link>
        <a
          href={`/api/print/${o.id}`}
          target="_blank"
          rel="noreferrer"
          className="ws-primary-btn"
          style={{ textDecoration: 'none', justifyContent: 'center' }}
        >
          Print receipt
        </a>
      </div>
    </div>
  )
}
