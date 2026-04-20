'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import type { MenuItem } from '@/types'

interface Props {
  item: MenuItem
  onAdd: (item: MenuItem, notes: string) => void
}

export function MenuItemCard({ item, onAdd }: Props) {
  const [notes, setNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)

  const handleAdd = () => {
    onAdd(item, notes)
    setNotes('')
    setShowNotes(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {item.image_url && (
        <div className="relative h-40 w-full">
          <Image src={item.image_url} alt={item.name} fill className="object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900">{item.name}</h3>
          <span className="font-bold text-brand-600 whitespace-nowrap">{formatPrice(item.price)}</span>
        </div>
        {item.description && (
          <p className="text-sm text-gray-500 mb-3">{item.description}</p>
        )}
        {showNotes && (
          <textarea
            className="w-full border border-gray-200 rounded-lg p-2 text-sm mb-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand-400"
            rows={2}
            placeholder="Any notes? (e.g. extra sauce, no salt…)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        )}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotes((v) => !v)}
            className="text-gray-500"
          >
            {showNotes ? 'Hide notes' : '+ Note'}
          </Button>
          <Button size="sm" onClick={handleAdd} className="ml-auto">
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}
