import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import type { Order } from '@/types'

export default async function OrderConfirmedPage({ params }: { params: { orderId: string } }) {
  const supabase = createServiceClient()
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', params.orderId)
    .single()

  if (!order) {
    return (
      <div className="ws-confirm">
        <div className="ws-confirm-inner" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)' }}>Order not found</p>
          <Link href="/menu" style={{ color: 'var(--brand)', display: 'block', marginTop: 8 }}>Back to menu</Link>
        </div>
      </div>
    )
  }

  const o = order as Order
  const pickup = new Date(o.pickup_time)

  return (
    <div className="ws-confirm">
      <div className="ws-confirm-inner">
        <div className="ws-confirm-hero">
          <div className="ws-confirm-emoji">🎉</div>
          <h1 className="ws-confirm-title">Order confirmed!</h1>
          <p className="ws-confirm-sub">We&apos;ve got your order, see you soon.</p>
        </div>

        <div className="ws-order-num-box">
          <div className="ws-order-num-label">Order number</div>
          <div className="ws-order-num">#{o.order_number}</div>
        </div>

        <div className="ws-confirm-details">
          <div className="ws-detail-row">
            <span className="ws-detail-label">Name</span>
            <span className="ws-detail-value">{o.customer_name}</span>
          </div>
          <div className="ws-detail-row">
            <span className="ws-detail-label">Collect at</span>
            <span className="ws-detail-value">
              {pickup.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="ws-detail-row">
            <span className="ws-detail-label">Payment</span>
            <span className="ws-detail-value">{o.payment_method === 'stripe' ? '✅ Paid online' : '💵 Pay on collection'}</span>
          </div>
          <div className="ws-detail-row" style={{ fontWeight: 700 }}>
            <span className="ws-detail-label">Total</span>
            <span className="ws-detail-value" style={{ color: 'var(--brand)' }}>{formatPrice(Number(o.total))}</span>
          </div>
        </div>

        <div className="ws-confirm-actions">
          <Link href="/menu" className="ws-action-btn secondary">
            Order more
          </Link>
          <a href={`/api/print/${o.id}`} target="_blank" rel="noreferrer" className="ws-action-btn primary">
            🖨 Receipt
          </a>
        </div>
      </div>
    </div>
  )
}
