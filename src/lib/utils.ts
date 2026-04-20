import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Settings, BusinessHours, BlockedSlot, TimeSlot } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(pence: number): string {
  return `£${pence.toFixed(2)}`
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const hour12 = hour % 12 || 12
  return `${hour12}:${m}${ampm}`
}

export function generateTimeSlots(
  settings: Pick<Settings, 'lead_time_minutes' | 'slot_duration_minutes'>,
  businessHours: BusinessHours[],
  blockedSlots: BlockedSlot[],
  targetDate: Date
): TimeSlot[] {
  const dayOfWeek = targetDate.getDay()
  const hours = businessHours.find((h) => h.day_of_week === dayOfWeek)
  if (!hours || !hours.is_open) return []

  const slots: TimeSlot[] = []
  const now = new Date()
  const leadMs = settings.lead_time_minutes * 60 * 1000
  const slotMs = settings.slot_duration_minutes * 60 * 1000

  const [openH, openM] = hours.open_time.split(':').map(Number)
  const [closeH, closeM] = hours.close_time.split(':').map(Number)

  const dateStr = targetDate.toISOString().split('T')[0]
  const openDate = new Date(`${dateStr}T${hours.open_time}:00`)
  const closeDate = new Date(`${dateStr}T${hours.close_time}:00`)

  let cursor = openDate.getTime()
  const closeTime = closeDate.getTime()

  while (cursor < closeTime) {
    const slotDate = new Date(cursor)
    const timeStr = slotDate.toTimeString().slice(0, 5)
    const slotEnd = new Date(cursor + slotMs)
    const slotEndStr = slotEnd.toTimeString().slice(0, 5)

    const tooSoon = slotDate.getTime() < now.getTime() + leadMs
    const blocked = blockedSlots.some(
      (b) =>
        b.block_date === dateStr &&
        b.start_time <= timeStr &&
        b.end_time > timeStr
    )

    slots.push({
      time: slotDate.toISOString(),
      label: formatTime(timeStr),
      available: !tooSoon && !blocked,
    })

    cursor += slotMs
  }

  return slots
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
