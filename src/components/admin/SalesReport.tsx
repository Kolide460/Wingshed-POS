'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import type { Order, OrderItem } from '@/types'

interface ReportRow {
  name: string
  quantity: number
  revenue: number
}

export function SalesReport() {
  const [from, setFrom] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  })
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0])
  const [orders, setOrders] = useState<Order[]>([])
  const [itemRows, setItemRows] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const run = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .gte('created_at', from + 'T00:00:00')
      .lte('created_at', to + 'T23:59:59')
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })

    const o = (data ?? []) as Order[]
    setOrders(o)

    const map = new Map<string, ReportRow>()
    o.forEach((order) => {
      ;(order.order_items ?? []).forEach((item: OrderItem) => {
        const key = item.menu_item_name
        const existing = map.get(key) ?? { name: key, quantity: 0, revenue: 0 }
        map.set(key, {
          ...existing,
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.unit_price * item.quantity,
        })
      })
    })
    setItemRows(Array.from(map.values()).sort((a, b) => b.revenue - a.revenue))
    setLoading(false)
  }

  useEffect(() => { run() }, [])

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
  const paidOnline = orders.filter((o) => o.payment_method === 'stripe').reduce((sum, o) => sum + Number(o.total), 0)
  const paidCash = totalRevenue - paidOnline

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-end">
        <div>
          <label className="text-xs text-gray-500 block mb-1">From</label>
          <input type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">To</label>
          <input type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 disabled:opacity-50"
        >
          {loading ? '…' : 'Run'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-2xl font-black text-gray-900">{orders.length}</div>
          <div className="text-xs text-gray-500">Orders</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-2xl font-black text-brand-600">{formatPrice(totalRevenue)}</div>
          <div className="text-xs text-gray-500">Revenue</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-lg font-bold text-gray-900">{formatPrice(orders.length ? totalRevenue / orders.length : 0)}</div>
          <div className="text-xs text-gray-500">Avg order</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
          <div className="font-bold">{formatPrice(paidOnline)}</div>
          <div className="text-xs text-gray-500">💳 Online</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
          <div className="font-bold">{formatPrice(paidCash)}</div>
          <div className="text-xs text-gray-500">💵 Collection</div>
        </div>
      </div>

      {itemRows.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 font-semibold text-sm">Best sellers</div>
          {itemRows.map((row) => (
            <div key={row.name} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0">
              <div className="flex-1 text-sm">{row.name}</div>
              <div className="text-xs text-gray-500 w-12 text-right">×{row.quantity}</div>
              <div className="font-semibold text-sm w-16 text-right">{formatPrice(row.revenue)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
