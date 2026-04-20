'use client'

import { useRealtimeOrders } from '@/hooks/useRealtimeOrders'
import { OrderCard } from '@/components/kitchen/OrderCard'
import type { OrderStatus } from '@/types'

const COLUMNS: { status: OrderStatus; label: string; bg: string }[] = [
  { status: 'confirmed', label: '📋 Confirmed', bg: 'bg-blue-50' },
  { status: 'preparing', label: '🔥 Preparing', bg: 'bg-orange-50' },
  { status: 'ready', label: '✅ Ready', bg: 'bg-green-50' },
]

export default function KitchenPage() {
  const { orders, loading, updateStatus } = useRealtimeOrders(['confirmed', 'preparing', 'ready', 'pending'])

  const pendingOrders = orders.filter((o) => o.status === 'pending')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading orders…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍗</span>
          <h1 className="text-white font-black text-xl">Wingshed Kitchen</h1>
        </div>
        <div className="text-gray-400 text-sm">
          {orders.length} active order{orders.length !== 1 ? 's' : ''}
        </div>
      </header>

      {pendingOrders.length > 0 && (
        <div className="bg-yellow-500 px-4 py-2 flex items-center gap-2">
          <span className="font-bold text-yellow-900">⚠ {pendingOrders.length} new order{pendingOrders.length > 1 ? 's' : ''} awaiting confirmation</span>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-0 overflow-hidden">
        {COLUMNS.map(({ status, label, bg }) => {
          const colOrders = orders.filter((o) => o.status === status)
          return (
            <div key={status} className={`${bg} flex flex-col overflow-hidden`}>
              <div className="px-4 py-3 border-b border-black/10 flex items-center justify-between">
                <span className="font-bold text-gray-800">{label}</span>
                <span className="bg-black/10 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {colOrders.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {colOrders.map((order) => (
                  <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} />
                ))}
                {colOrders.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">No orders</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {pendingOrders.length > 0 && (
        <div className="bg-gray-800 p-3 space-y-2">
          <div className="text-yellow-400 text-xs font-bold uppercase tracking-wider">New orders — tap to confirm</div>
          {pendingOrders.map((order) => (
            <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} />
          ))}
        </div>
      )}
    </div>
  )
}
