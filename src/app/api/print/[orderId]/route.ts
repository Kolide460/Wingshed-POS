import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateReceiptHTML } from '@/lib/print'
import type { Order, OrderItem } from '@/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const supabase = createServiceClient()
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', params.orderId)
    .single()

  if (error || !order) {
    return new NextResponse('Order not found', { status: 404 })
  }

  const html = generateReceiptHTML(order as Order, (order as Order & { order_items: OrderItem[] }).order_items ?? [])
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
