import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'

export default async function AdminDashboard() {
  const supabase = createServiceClient()
  const today = new Date().toISOString().split('T')[0]

  const [{ data: todayOrders }, { data: activeOrders }] = await Promise.all([
    supabase
      .from('orders')
      .select('total, status')
      .gte('created_at', today + 'T00:00:00')
      .neq('status', 'cancelled'),
    supabase
      .from('orders')
      .select('id, order_number, status, customer_name, pickup_time, total')
      .in('status', ['confirmed', 'preparing', 'ready'])
      .order('pickup_time'),
  ])

  const revenue = (todayOrders ?? []).reduce((sum: number, o: { total: number }) => sum + Number(o.total), 0)

  return (
    <div className="space-y-5">
      <h1 className="font-black text-2xl">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
          <div className="text-3xl font-black text-gray-900">{(todayOrders ?? []).length}</div>
          <div className="text-xs text-gray-500">Orders today</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
          <div className="text-2xl font-black text-brand-600">{formatPrice(revenue)}</div>
          <div className="text-xs text-gray-500">Revenue today</div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/kitchen"
          className="flex-1 text-center py-3.5 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600"
        >
          🍳 Kitchen screen
        </Link>
        <Link
          href="/menu"
          className="flex-1 text-center py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
        >
          🛒 Storefront
        </Link>
      </div>

      {(activeOrders ?? []).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 font-semibold text-sm text-gray-600">
            Active orders
          </div>
          {(activeOrders ?? []).map((o: { id: string; order_number: number; status: string; customer_name: string; pickup_time: string; total: number }) => (
            <div key={o.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
              <span className="font-black text-brand-600">#{o.order_number}</span>
              <span className="flex-1 text-sm">{o.customer_name}</span>
              <span className="text-xs text-gray-500">
                {new Date(o.pickup_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-xs font-medium capitalize text-gray-600">{o.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
