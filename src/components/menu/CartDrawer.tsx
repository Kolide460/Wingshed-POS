'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import type { CartItem } from '@/types'

interface Props {
  items: CartItem[]
  total: number
  onUpdateQuantity: (index: number, qty: number) => void
  onUpdateNotes: (index: number, notes: string) => void
  onRemove: (index: number) => void
  onClose: () => void
}

export function CartDrawer({ items, total, onUpdateQuantity, onUpdateNotes, onRemove, onClose }: Props) {
  const router = useRouter()

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-md bg-white flex flex-col h-full shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Your order</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 && (
            <p className="text-gray-400 text-center py-8">Your cart is empty</p>
          )}
          {items.map((item, idx) => (
            <div key={idx} className="border border-gray-100 rounded-xl p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <button
                    className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-200"
                    onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-semibold">{item.quantity}</span>
                  <button
                    className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-600 hover:bg-brand-200"
                    onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <span className="flex-1 font-medium text-sm">{item.menu_item.name}</span>
                <span className="font-semibold text-sm">{formatPrice(item.menu_item.price * item.quantity)}</span>
                <button
                  onClick={() => onRemove(idx)}
                  className="text-gray-300 hover:text-red-400 text-xl leading-none"
                >
                  &times;
                </button>
              </div>
              <input
                type="text"
                className="w-full border border-gray-100 rounded-lg px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-300"
                placeholder="Add a note…"
                value={item.notes}
                onChange={(e) => onUpdateNotes(idx, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="p-4 border-t space-y-3">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Button
            size="lg"
            className="w-full"
            disabled={items.length === 0}
            onClick={() => { onClose(); router.push('/checkout') }}
          >
            Go to checkout
          </Button>
        </div>
      </div>
    </div>
  )
}
