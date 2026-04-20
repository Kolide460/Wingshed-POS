'use client'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
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
  pending:   'Confirm',
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
    <div className={`bg-white rounded-2xl shadow border-2 ${isUrgent && order.status !== 'ready' ? 'border-red-400' : 'border-transparent'} p-4 space-y-3`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-black text-gray-900">#{order.order_number}</span>
          <span className="ml-2 text-sm text-gray-500">{order.customer_name}</span>
        </div>
        <Badge variant={order.status} />
      </div>

      <div className="text-sm font-semibold text-gray-700">
        🕐 {pickup.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        {isUrgent && <span className="ml-2 text-red-500 text-xs">SOON</span>}
      </div>

      <ul className="divide-y divide-gray-50">
        {items.map((item) => (
          <li key={item.id} className="py-1.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold">
                {item.quantity}
              </span>
              <span className="flex-1 font-medium text-sm">{item.menu_item_name}</span>
            </div>
            {item.notes && (
              <p className="text-xs text-orange-600 mt-0.5 ml-8">Note: {item.notes}</p>
            )}
          </li>
        ))}
      </ul>

      {order.order_notes && (
        <div className="bg-orange-50 rounded-lg px-3 py-2 text-sm text-orange-800">
          <strong>Order note:</strong> {order.order_notes}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-gray-400">
          {order.payment_method === 'stripe' ? '💳 Paid online' : '💵 Pay on collection'}
        </span>
        <span className="font-bold">{formatPrice(Number(order.total))}</span>
      </div>

      {nextStatus && (
        <Button
          className="w-full"
          onClick={() => onUpdateStatus(order.id, nextStatus)}
        >
          {STATUS_LABEL[order.status]}
        </Button>
      )}
    </div>
  )
}
