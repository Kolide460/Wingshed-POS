'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/types'

export function useRealtimeOrders(statuses: string[] = ['pending', 'confirmed', 'preparing', 'ready']) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchOrders() {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .in('status', statuses)
        .order('pickup_time', { ascending: true })
      if (data) setOrders(data as Order[])
      setLoading(false)
    }

    fetchOrders()

    const channel = supabase
      .channel('kitchen-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        () => fetchOrders()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const updateStatus = async (orderId: string, status: Order['status']) => {
    const supabase = createClient()
    await supabase.from('orders').update({ status }).eq('id', orderId)
  }

  return { orders, loading, updateStatus }
}
