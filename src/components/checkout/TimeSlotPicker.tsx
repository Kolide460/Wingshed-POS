'use client'

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
      <div className="ws-no-slots">
        No collection slots available today. Please try another day or contact us.
      </div>
    )
  }

  return (
    <div className="ws-slots">
      {available.map((slot) => (
        <button
          key={slot.time}
          type="button"
          onClick={() => onChange(slot.time)}
          className={`ws-slot${value === slot.time ? ' selected' : ''}`}
        >
          {slot.label}
        </button>
      ))}
    </div>
  )
}
