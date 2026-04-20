'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TimeSlotPicker } from '@/components/checkout/TimeSlotPicker'
import { StripeCheckout } from '@/components/checkout/StripeCheckout'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/hooks/useCart'
import { formatPrice, generateTimeSlots } from '@/lib/utils'
import type { BusinessHours, BlockedSlot, Settings, TimeSlot } from '@/types'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [orderNotes, setOrderNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'collection' | 'stripe'>('collection')
  const [pickupTime, setPickupTime] = useState('')
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [clientSecret, setClientSecret] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState('')

  useEffect(() => {
    if (items.length === 0) router.push('/menu')
  }, [items.length])

  useEffect(() => {
    const supabase = createClient()
    async function loadSlots() {
      const [{ data: hours }, { data: blocked }, { data: settings }] = await Promise.all([
        supabase.from('business_hours').select('*'),
        supabase.from('blocked_slots').select('*').gte('block_date', new Date().toISOString().split('T')[0]),
        supabase.from('settings').select('*'),
      ])
      const settingsMap = Object.fromEntries(
        (settings ?? []).map((s: { key: string; value: string }) => [s.key, s.value])
      ) as Record<string, string>

      const generatedSlots = generateTimeSlots(
        {
          lead_time_minutes: parseInt(settingsMap.lead_time_minutes ?? '30'),
          slot_duration_minutes: parseInt(settingsMap.slot_duration_minutes ?? '15'),
        },
        (hours ?? []) as BusinessHours[],
        (blocked ?? []) as BlockedSlot[],
        new Date()
      )
      setSlots(generatedSlots)
    }
    loadSlots()
  }, [])

  const createOrder = async () => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: name,
        customer_phone: phone,
        payment_method: paymentMethod,
        pickup_time: pickupTime,
        order_notes: orderNotes,
        items,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data.order.id as string
  }

  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !pickupTime) { setError('Please fill in all required fields'); return }
    setSubmitting(true)
    setError('')
    try {
      const id = await createOrder()
      clearCart()
      window.open(`/api/print/${id}`, '_blank')
      router.push(`/order-confirmed/${id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  const handleStripeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !pickupTime) { setError('Please fill in all required fields'); return }
    setSubmitting(true)
    setError('')
    try {
      const id = await createOrder()
      setOrderId(id)
      const res = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, orderId: id }),
      })
      const data = await res.json()
      setClientSecret(data.clientSecret)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
    setSubmitting(false)
  }

  const onStripeSuccess = () => {
    clearCart()
    window.open(`/api/print/${orderId}`, '_blank')
    router.push(`/order-confirmed/${orderId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
          <h1 className="font-bold text-lg">Checkout</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 font-semibold text-sm text-gray-600">Your order</div>
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0">
              <span className="text-xs bg-brand-100 text-brand-700 font-bold rounded-full w-6 h-6 flex items-center justify-center">{item.quantity}</span>
              <span className="flex-1 text-sm">{item.menu_item.name}</span>
              {item.notes && <span className="text-xs text-gray-400 italic">{item.notes}</span>}
              <span className="font-semibold text-sm">{formatPrice(item.menu_item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="px-4 py-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-brand-600">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Customer details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <h2 className="font-semibold text-sm text-gray-600">Your details</h2>
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="Your name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="Phone number (optional)"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <textarea
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
            rows={2}
            placeholder="Order notes (optional)"
            value={orderNotes}
            onChange={(e) => setOrderNotes(e.target.value)}
          />
        </div>

        {/* Pickup time */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <h2 className="font-semibold text-sm text-gray-600">Collection time</h2>
          <TimeSlotPicker slots={slots} value={pickupTime} onChange={setPickupTime} />
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <h2 className="font-semibold text-sm text-gray-600">Payment</h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('collection')}
              className={`py-3 rounded-xl border-2 text-sm font-medium transition-colors ${paymentMethod === 'collection' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600'}`}
            >
              💵 Pay on collection
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('stripe')}
              className={`py-3 rounded-xl border-2 text-sm font-medium transition-colors ${paymentMethod === 'stripe' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600'}`}
            >
              💳 Pay online
            </button>
          </div>

          {paymentMethod === 'collection' && !clientSecret && (
            <form onSubmit={handleCollectionSubmit}>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? 'Placing order…' : `Place order · ${formatPrice(total)}`}
              </Button>
            </form>
          )}

          {paymentMethod === 'stripe' && !clientSecret && (
            <form onSubmit={handleStripeSubmit}>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? 'Preparing payment…' : `Pay now · ${formatPrice(total)}`}
              </Button>
            </form>
          )}

          {clientSecret && (
            <StripeCheckout
              clientSecret={clientSecret}
              onSuccess={onStripeSuccess}
              onError={(msg) => setError(msg)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
