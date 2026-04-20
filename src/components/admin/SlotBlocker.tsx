'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import type { BlockedSlot } from '@/types'

export function SlotBlocker() {
  const [slots, setSlots] = useState<BlockedSlot[]>([])
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const load = async () => {
    const { data } = await supabase
      .from('blocked_slots')
      .select('*')
      .gte('block_date', today)
      .order('block_date')
      .order('start_time')
    setSlots((data ?? []) as BlockedSlot[])
  }

  useEffect(() => { load() }, [])

  const addBlock = async () => {
    if (!date || !startTime || !endTime) return
    setSaving(true)
    await supabase.from('blocked_slots').insert({
      block_date: date,
      start_time: startTime,
      end_time: endTime,
      reason: reason || null,
    })
    setDate('')
    setStartTime('')
    setEndTime('')
    setReason('')
    await load()
    setSaving(false)
  }

  const remove = async (id: string) => {
    await supabase.from('blocked_slots').delete().eq('id', id)
    await load()
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        <h3 className="font-semibold text-sm text-gray-700">Block a time slot</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Date</label>
            <input
              type="date"
              min={today}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Reason (optional)</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Staff break"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">From</label>
            <input
              type="time"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Until</label>
            <input
              type="time"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={addBlock} disabled={saving || !date || !startTime || !endTime}>
          {saving ? 'Saving…' : 'Block slot'}
        </Button>
      </div>

      <div className="space-y-2">
        {slots.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No upcoming blocks</p>
        )}
        {slots.map((slot) => (
          <div key={slot.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3">
            <div className="flex-1">
              <div className="font-medium text-sm">{slot.block_date}</div>
              <div className="text-xs text-gray-500">
                {slot.start_time} – {slot.end_time}
                {slot.reason && ` · ${slot.reason}`}
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={() => remove(slot.id)}>Remove</Button>
          </div>
        ))}
      </div>
    </div>
  )
}
