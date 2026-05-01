'use client'

import { useRealtimeOrders } from '@/hooks/useRealtimeOrders'
import { OrderCard } from '@/components/kitchen/OrderCard'
import type { OrderStatus } from '@/types'

const COLUMNS: { status: OrderStatus; label: string }[] = [
  { status: 'confirmed', label: '📋 Confirmed' },
  { status: 'preparing', label: '🔥 Preparing' },
  { status: 'ready',     label: '✅ Ready' },
]

export default function KitchenPage() {
  const { orders, loading, updateStatus } = useRealtimeOrders(['confirmed', 'preparing', 'ready', 'pending'])
  const pendingOrders = orders.filter((o) => o.status === 'pending')

  if (loading) {
    return (
      <div className="ws-kitchen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#fff', fontSize: 20 }}>Loading orders…</div>
      </div>
    )
  }

  return (
    <div className="ws-kitchen">
      <div className="ws-kitchen-header">
        <div className="ws-kitchen-logo">
          <span>🍗</span> Wingshed Kitchen
        </div>
        <span className="ws-kitchen-count">
          {orders.length} active order{orders.length !== 1 ? 's' : ''}
        </span>
      </div>

      {pendingOrders.length > 0 && (
        <div className="ws-kitchen-alert">
          ⚠ {pendingOrders.length} new order{pendingOrders.length > 1 ? 's' : ''} awaiting confirmation
        </div>
      )}

      <div className="ws-kitchen-cols">
        {COLUMNS.map(({ status, label }) => {
          const colOrders = orders.filter((o) => o.status === status)
          return (
            <div key={status} className="ws-kitchen-col">
              <div className="ws-kitchen-col-header">
                <span className="ws-kitchen-col-title">{label}</span>
                <span className="ws-kitchen-col-count">{colOrders.length}</span>
              </div>
              <div className="ws-kitchen-cards">
                {colOrders.map((order) => (
                  <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} />
                ))}
                {colOrders.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: '#4b5563', fontSize: 13 }}>No orders</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {pendingOrders.length > 0 && (
        <div style={{ background: '#1f2937', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ color: '#fbbf24', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            New orders — tap to confirm
          </div>
          {pendingOrders.map((order) => (
            <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} />
          ))}
        </div>
      )}
    </div>
  )
}
