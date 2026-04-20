'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { DAY_NAMES } from '@/lib/utils'
import type { BusinessHours } from '@/types'

export function HoursManager() {
  const [hours, setHours] = useState<BusinessHours[]>([])
  const [leadTime, setLeadTime] = useState('30')
  const [slotDuration, setSlotDuration] = useState('15')
  const [maxOrders, setMaxOrders] = useState('5')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data: h }, { data: s }] = await Promise.all([
        supabase.from('business_hours').select('*').order('day_of_week'),
        supabase.from('settings').select('*'),
      ])
      if (h) setHours(h as BusinessHours[])
      if (s) {
        const map = Object.fromEntries(s.map((r: { key: string; value: string }) => [r.key, r.value]))
        setLeadTime(map.lead_time_minutes ?? '30')
        setSlotDuration(map.slot_duration_minutes ?? '15')
        setMaxOrders(map.max_orders_per_slot ?? '5')
      }
    }
    load()
  }, [])

  const updateHour = (idx: number, field: keyof BusinessHours, value: string | boolean) => {
    setHours((prev) => prev.map((h, i) => (i === idx ? { ...h, [field]: value } : h)))
  }

  const save = async () => {
    setSaving(true)
    await Promise.all(
      hours.map((h) =>
        supabase
          .from('business_hours')
          .upsert({ ...h }, { onConflict: 'day_of_week' })
      )
    )
    await Promise.all([
      supabase.from('settings').upsert({ key: 'lead_time_minutes', value: leadTime }),
      supabase.from('settings').upsert({ key: 'slot_duration_minutes', value: slotDuration }),
      supabase.from('settings').upsert({ key: 'max_orders_per_slot', value: maxOrders }),
    ])
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {hours.map((h, idx) => (
          <div key={h.day_of_week} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3">
            <div className="w-24 font-medium text-sm">{DAY_NAMES[h.day_of_week]}</div>
            <button
              onClick={() => updateHour(idx, 'is_open', !h.is_open)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${h.is_open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
            >
              {h.is_open ? 'Open' : 'Closed'}
            </button>
            {h.is_open && (
              <>
                <input
                  type="time"
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
                  value={h.open_time}
                  onChange={(e) => updateHour(idx, 'open_time', e.target.value)}
                />
                <span className="text-gray-400 text-sm">to</span>
                <input
                  type="time"
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
                  value={h.close_time}
                  onChange={(e) => updateHour(idx, 'close_time', e.target.value)}
                />
              </>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        <h3 className="font-semibold text-sm text-gray-700">Slot settings</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Lead time (mins)</label>
            <input
              type="number"
              min="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={leadTime}
              onChange={(e) => setLeadTime(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Slot size (mins)</label>
            <input
              type="number"
              min="5"
              step="5"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={slotDuration}
              onChange={(e) => setSlotDuration(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Max orders/slot</label>
            <input
              type="number"
              min="1"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              value={maxOrders}
              onChange={(e) => setMaxOrders(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Button onClick={save} disabled={saving} className="w-full">
        {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save changes'}
      </Button>
    </div>
  )
}
