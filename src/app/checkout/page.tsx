'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { StripeCheckout } from '@/components/checkout/StripeCheckout'
import { useCart } from '@/hooks/useCart'
import { generateTimeSlots } from '@/lib/utils'
import type { BusinessHours, BlockedSlot, TimeSlot } from '@/types'

type PaymentMethod = 'card' | 'cash'

const TIPS = [0, 1, 2, 3]

function Money({ value, size = 15 }: { value: number; size?: number }) {
  const [whole, frac] = value.toFixed(2).split('.')
  return (
    <span className="ws-money" style={{ fontSize: size }}>
      <span className="ws-money-symbol">£</span>{whole}<span className="ws-money-frac">.{frac}</span>
    </span>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, loaded, clearCart } = useCart()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [tip, setTip] = useState(1)
  const [pickupTime, setPickupTime] = useState('')
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [clientSecret, setClientSecret] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState('')

  const delivery = 0
  const grandTotal = total + delivery + tip

  useEffect(() => {
    if (loaded && items.length === 0) router.push('/menu')
  }, [loaded, items.length])

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
      const generated = generateTimeSlots(
        {
          lead_time_minutes: parseInt(settingsMap.lead_time_minutes ?? '30'),
          slot_duration_minutes: parseInt(settingsMap.slot_duration_minutes ?? '15'),
        },
        (hours ?? []) as BusinessHours[],
        (blocked ?? []) as BlockedSlot[],
        new Date()
      )
      setSlots(generated)
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
        payment_method: paymentMethod === 'card' ? 'stripe' : 'collection',
        pickup_time: pickupTime,
        order_notes: '',
        items,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data.order.id as string
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Please enter your name'); return }
    if (!pickupTime) { setError('Please select a collection time'); return }
    setSubmitting(true)
    setError('')
    try {
      const id = await createOrder()
      if (paymentMethod === 'cash') {
        clearCart()
        window.open(`/api/print/${id}`, '_blank')
        router.push(`/order-confirmed/${id}`)
      } else {
        setOrderId(id)
        const res = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total, orderId: id }),
        })
        const data = await res.json()
        setClientSecret(data.clientSecret)
        setSubmitting(false)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  const onStripeSuccess = () => {
    clearCart()
    window.open(`/api/print/${orderId}`, '_blank')
    router.push(`/order-confirmed/${orderId}`)
  }

  const availableSlots = slots.filter(s => s.available)

  return (
    <div className="ws-page" style={{ overflowY: 'auto' }}>
      <div style={{ paddingBottom: 120 }}>
        {/* Header */}
        <div style={{ padding: '54px 20px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="ws-icon-btn" onClick={() => router.back()}>
            <BackIcon />
          </button>
          <span style={{ fontSize: 19, fontWeight: 600, color: 'var(--ws-ink)', letterSpacing: '-0.025em' }}>
            Checkout
          </span>
        </div>

        {/* Mode card */}
        <div className="ws-checkout-section">
          <div className="ws-eyebrow">Collection</div>
          <div className="ws-mode-card">
            <div className="ws-mode-icon"><PinIcon /></div>
            <div style={{ flex: 1 }}>
              <div className="ws-mode-card-title">Pickup</div>
              <div className="ws-mode-card-sub">108 Mare St · ready in ~12 min</div>
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="ws-checkout-section">
          <div className="ws-eyebrow">Order name</div>
          <input
            className="ws-checkout-input"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        {/* Phone (optional) */}
        <div className="ws-checkout-section">
          <div className="ws-eyebrow">Phone (optional)</div>
          <input
            className="ws-checkout-input"
            placeholder="07700 000000"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>

        {/* Time slots */}
        <div className="ws-checkout-section">
          <div className="ws-eyebrow">Collection time</div>
          {availableSlots.length === 0 ? (
            <div style={{ color: 'var(--ws-ink-muted)', fontSize: 13, padding: '8px 0' }}>
              No slots available today. Please contact us.
            </div>
          ) : (
            <div className="ws-slot-grid">
              {availableSlots.map(slot => (
                <button
                  key={slot.time}
                  type="button"
                  className={`ws-slot-btn${pickupTime === slot.time ? ' selected' : ''}`}
                  onClick={() => setPickupTime(slot.time)}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Payment */}
        <div className="ws-checkout-section">
          <div className="ws-eyebrow">Payment</div>
          <div className="ws-payment-list">
            <button
              className={`ws-payment-option${paymentMethod === 'card' ? ' selected' : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              <div style={{ flex: 1 }}>
                <div className="ws-payment-name">Pay online</div>
                <div className="ws-payment-sub">Card, Apple Pay, Google Pay</div>
              </div>
              <RadioDot active={paymentMethod === 'card'} />
            </button>
            <button
              className={`ws-payment-option${paymentMethod === 'cash' ? ' selected' : ''}`}
              onClick={() => setPaymentMethod('cash')}
            >
              <div style={{ flex: 1 }}>
                <div className="ws-payment-name">Cash on pickup</div>
                <div className="ws-payment-sub">Pay at the counter</div>
              </div>
              <RadioDot active={paymentMethod === 'cash'} />
            </button>
          </div>
        </div>

        {/* Tip */}
        <div className="ws-checkout-section">
          <div className="ws-eyebrow">Tip the kitchen</div>
          <div className="ws-tip-grid">
            {TIPS.map(t => (
              <button
                key={t}
                type="button"
                className={`ws-tip-btn${tip === t ? ' active' : ''}`}
                onClick={() => setTip(t)}
              >
                £{t}
              </button>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="ws-summary-row">
            <span>Subtotal</span>
            <span><Money value={total} /></span>
          </div>
          {tip > 0 && (
            <div className="ws-summary-row">
              <span>Tip</span>
              <span><Money value={tip} /></span>
            </div>
          )}
          <div className="ws-summary-row bold">
            <span>Total</span>
            <span><Money value={grandTotal} /></span>
          </div>
        </div>

        {error && <div className="ws-error-msg" style={{ padding: '0 20px' }}>{error}</div>}

        {/* Stripe payment element */}
        {clientSecret && (
          <div style={{ padding: '0 20px' }}>
            <StripeCheckout
              clientSecret={clientSecret}
              onSuccess={onStripeSuccess}
              onError={msg => setError(msg)}
            />
          </div>
        )}
      </div>

      {/* Pay dock */}
      {!clientSecret && (
        <div className="ws-cart-footer">
          <form onSubmit={handleSubmit}>
            <button type="submit" className="ws-primary-btn" disabled={submitting} style={{ width: '100%' }}>
              <span>{submitting ? 'Placing order…' : 'Place order'}</span>
              <Money value={grandTotal} size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 21s7-7.5 7-12a7 7 0 10-14 0c0 4.5 7 12 7 12z" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}
function RadioDot({ active }: { active: boolean }) {
  return (
    <div className={`ws-radio-dot${active ? ' active' : ''}`}>
      {active && <div className="ws-radio-inner" />}
    </div>
  )
}
