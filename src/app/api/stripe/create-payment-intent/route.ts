import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const { amount, orderId } = await req.json()

  if (!amount || amount < 50) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // pence
    currency: 'gbp',
    automatic_payment_methods: { enabled: true },
    metadata: { orderId: orderId ?? '' },
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
