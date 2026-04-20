import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import type { CartItem } from '@/types'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { customer_name, customer_phone, payment_method, pickup_time, order_notes, items } = body as {
    customer_name: string
    customer_phone: string
    payment_method: string
    pickup_time: string
    order_notes: string
    items: CartItem[]
  }

  if (!customer_name || !pickup_time || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const total = items.reduce((sum, i) => sum + i.menu_item.price * i.quantity, 0)
  const supabase = createServiceClient()

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      customer_name,
      customer_phone: customer_phone || null,
      payment_method,
      payment_status: payment_method === 'collection' ? 'unpaid' : 'unpaid',
      pickup_time,
      order_notes: order_notes || null,
      total,
      status: payment_method === 'collection' ? 'confirmed' : 'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const orderItemsToInsert = items.map((i) => ({
    order_id: order.id,
    menu_item_id: i.menu_item.id,
    menu_item_name: i.menu_item.name,
    quantity: i.quantity,
    unit_price: i.menu_item.price,
    notes: i.notes || null,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert)
  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })

  return NextResponse.json({ order })
}
