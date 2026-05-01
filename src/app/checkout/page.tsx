'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TimeSlotPicker } from '@/components/checkout/TimeSlotPicker'
import { StripeCheckout } from '@/components/checkout/StripeCheckout'
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
    <div className="ws-page">
      <div className="ws-topbar">
        <div className="ws-topbar-inner">
          <button className="ws-back-btn" onClick={() => router.back()}>←</button>
          <span className="ws-page-title">Checkout</span>
        </div>
      </div>

      <div className="ws-section" style={{ paddingBottom: 32 }}>
        {/* Order summary */}
        <div className="ws-box">
          <div className="ws-box-header">Your order</div>
          {items.map((item, idx) => (
            <div key={idx} className="ws-order-row">
              <div className="ws-order-qty">{item.quantity}</div>
              <span className="ws-order-name">{item.menu_item.name}</span>
              {item.notes && <span className="ws-order-note">{item.notes}</span>}
              <span className="ws-order-price">{formatPrice(item.menu_item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="ws-total-box">
            <span>Total</span>
            <span style={{ color: 'var(--brand)' }}>{formatPrice(total)}</span>
          </div>
        </div>

        {/* Customer details */}
        <div className="ws-box">
          <div className="ws-box-header">Your details</div>
          <div className="ws-input-group">
            <input
              className="ws-input"
              placeholder="Your name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              className="ws-input"
              placeholder="Phone number (optional)"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <textarea
              className="ws-input"
              style={{ resize: 'none' }}
              rows={2}
              placeholder="Order notes (optional)"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Pickup time */}
        <div className="ws-box">
          <div className="ws-box-header">Collection time</div>
          <TimeSlotPicker slots={slots} value={pickupTime} onChange={setPickupTime} />
        </div>

        {/* Payment method */}
        <div className="ws-box">
          <div className="ws-box-header">Payment</div>
          <div className="ws-pay-options">
            <button
              type="button"
              onClick={() => setPaymentMethod('collection')}
              className={`ws-pay-option${paymentMethod === 'collection' ? ' selected' : ''}`}
            >
              💵 Pay on collection
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('stripe')}
              className={`ws-pay-option${paymentMethod === 'stripe' ? ' selected' : ''}`}
            >
              💳 Pay online
            </button>
          </div>

          {error && <div className="ws-error">{error}</div>}

          {paymentMethod === 'collection' && !clientSecret && (
            <form onSubmit={handleCollectionSubmit} style={{ padding: '0 16px 16px' }}>
              <button type="submit" className="ws-submit-btn" disabled={submitting}>
                {submitting ? 'Placing order…' : `Place order · ${formatPrice(total)}`}
              </button>
            </form>
          )}

          {paymentMethod === 'stripe' && !clientSecret && (
            <form onSubmit={handleStripeSubmit} style={{ padding: '0 16px 16px' }}>
              <button type="submit" className="ws-submit-btn" disabled={submitting}>
                {submitting ? 'Preparing payment…' : `Pay now · ${formatPrice(total)}`}
              </button>
            </form>
          )}

          {clientSecret && (
            <div style={{ padding: '0 16px 16px' }}>
              <StripeCheckout
                clientSecret={clientSecret}
                onSuccess={onStripeSuccess}
                onError={(msg) => setError(msg)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
