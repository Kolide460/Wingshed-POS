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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Order not found</p>
          <Link href="/menu" className="text-brand-500 mt-2 block">Back to menu</Link>
        </div>
      </div>
    )
  }

  const o = order as Order
  const pickup = new Date(o.pickup_time)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <div className="text-6xl mb-3">🎉</div>
          <h1 className="font-black text-3xl text-gray-900">Order confirmed!</h1>
          <p className="text-gray-500 mt-1">We&apos;ve got your order, see you soon.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
          <div className="text-sm text-gray-500 mb-1">Order number</div>
          <div className="text-5xl font-black text-brand-500">#{o.order_number}</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Name</span>
            <span className="font-medium">{o.customer_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Collect at</span>
            <span className="font-medium">
              {pickup.toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payment</span>
            <span className="font-medium">{o.payment_method === 'stripe' ? '✅ Paid online' : '💵 Pay on collection'}</span>
          </div>
          <div className="flex justify-between text-sm font-bold pt-1 border-t border-gray-50">
            <span>Total</span>
            <span className="text-brand-600">{formatPrice(Number(o.total))}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/menu"
            className="flex-1 text-center py-3 bg-gray-100 rounded-xl font-semibold text-gray-700 text-sm hover:bg-gray-200"
          >
            Order more
          </Link>
          <a
            href={`/api/print/${o.id}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-center py-3 bg-brand-500 rounded-xl font-semibold text-white text-sm hover:bg-brand-600"
          >
            🖨 Print receipt
          </a>
        </div>
      </div>
    </div>
  )
}
