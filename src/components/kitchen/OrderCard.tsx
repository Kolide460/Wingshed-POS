'use client'

import { formatPrice } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'

const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  pending:   'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready:     'collected',
  collected: null,
  cancelled: null,
}

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:   'Confirm order',
  confirmed: 'Start preparing',
  preparing: 'Mark ready',
  ready:     'Mark collected',
  collected: '',
  cancelled: '',
}

interface Props {
  order: Order
  onUpdateStatus: (id: string, status: OrderStatus) => void
}

export function OrderCard({ order, onUpdateStatus }: Props) {
  const items = order.order_items ?? []
  const pickup = new Date(order.pickup_time)
  const isUrgent = pickup.getTime() - Date.now() < 10 * 60 * 1000
  const nextStatus = STATUS_FLOW[order.status]

  return (
    <div className={`ws-order-card${isUrgent && order.status !== 'ready' ? ' urgent' : ''}`}>
      <div className="ws-order-card-header">
        <div>
          <div className="ws-order-card-num">#{order.order_number}</div>
          <div className="ws-order-card-name">{order.customer_name}</div>
        </div>
        <span className={`ws-status-badge ws-status-${order.status}`}>{order.status}</span>
      </div>

      <div className="ws-order-card-time">
        🕐 {pickup.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        {isUrgent && <span className="urgent">SOON</span>}
      </div>

      <div className="ws-order-card-items">
        {items.map((item) => (
          <div key={item.id} className="ws-order-card-item">
            <div className="ws-order-card-item-qty">{item.quantity}</div>
            <div>
              <div className="ws-order-card-item-name">{item.menu_item_name}</div>
              {item.notes && <div className="ws-order-card-item-note">Note: {item.notes}</div>}
            </div>
          </div>
        ))}
      </div>

      {order.order_notes && (
        <div className="ws-order-card-note">⚠ {order.order_notes}</div>
      )}

      <div className="ws-order-card-footer">
        <span className="ws-order-card-payment">
          {order.payment_method === 'stripe' ? '💳 Paid' : '💵 Collect'}
        </span>
        <span className="ws-order-card-total">{formatPrice(Number(order.total))}</span>
      </div>

      {nextStatus && (
        <button
          className="ws-advance-btn"
          onClick={() => onUpdateStatus(order.id, nextStatus)}
        >
          {STATUS_LABEL[order.status]}
        </button>
      )}
    </div>
  )
}
