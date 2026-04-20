'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { TimeSlot } from '@/types'

interface Props {
  slots: TimeSlot[]
  value: string
  onChange: (value: string) => void
}

export function TimeSlotPicker({ slots, value, onChange }: Props) {
  const available = slots.filter((s) => s.available)

  if (available.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        No collection slots available today. Please try another day or contact us.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {available.map((slot) => (
        <button
          key={slot.time}
          type="button"
          onClick={() => onChange(slot.time)}
          className={cn(
            'py-2.5 px-2 rounded-xl text-sm font-medium border transition-colors',
            value === slot.time
              ? 'bg-brand-500 text-white border-brand-500'
              : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300 hover:text-brand-600'
          )}
        >
          {slot.label}
        </button>
      ))}
    </div>
  )
}
