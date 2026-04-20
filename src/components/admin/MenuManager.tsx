'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import type { MenuItem, Category } from '@/types'

export function MenuManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [activeCat, setActiveCat] = useState<string>('')
  const [editItem, setEditItem] = useState<Partial<MenuItem> | null>(null)
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  const load = async () => {
    const [{ data: cats }, { data: menuItems }] = await Promise.all([
      supabase.from('categories').select('*').order('display_order'),
      supabase.from('menu_items').select('*').order('display_order'),
    ])
    const c = (cats ?? []) as Category[]
    setCategories(c)
    setItems((menuItems ?? []) as MenuItem[])
    if (c.length && !activeCat) setActiveCat(c[0].id)
  }

  useEffect(() => { load() }, [])

  const saveItem = async () => {
    if (!editItem) return
    setSaving(true)
    if (editItem.id) {
      await supabase.from('menu_items').update(editItem).eq('id', editItem.id)
    } else {
      await supabase.from('menu_items').insert({ ...editItem, category_id: activeCat })
    }
    setEditItem(null)
    await load()
    setSaving(false)
  }

  const toggleActive = async (item: MenuItem) => {
    await supabase.from('menu_items').update({ active: !item.active }).eq('id', item.id)
    await load()
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return
    await supabase.from('menu_items').delete().eq('id', id)
    await load()
  }

  const catItems = items.filter((i) => i.category_id === activeCat)

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCat === c.id ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {catItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{item.name}</div>
              <div className="text-xs text-gray-500 truncate">{item.description}</div>
            </div>
            <span className="font-semibold text-sm">{formatPrice(item.price)}</span>
            <button
              onClick={() => toggleActive(item)}
              className={`text-xs px-2 py-1 rounded-full font-medium ${item.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
            >
              {item.active ? 'On' : 'Off'}
            </button>
            <Button variant="ghost" size="sm" onClick={() => setEditItem(item)}>Edit</Button>
            <Button variant="danger" size="sm" onClick={() => deleteItem(item.id)}>Del</Button>
          </div>
        ))}
      </div>

      <Button onClick={() => setEditItem({ category_id: activeCat, active: true, price: 0 })}>
        + Add item
      </Button>

      {editItem !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-lg">{editItem.id ? 'Edit item' : 'New item'}</h3>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Item name"
              value={editItem.name ?? ''}
              onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
            />
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
              rows={2}
              placeholder="Description (optional)"
              value={editItem.description ?? ''}
              onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
            />
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Price (£)"
              value={editItem.price ?? ''}
              onChange={(e) => setEditItem({ ...editItem, price: parseFloat(e.target.value) })}
            />
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Image URL (optional)"
              value={editItem.image_url ?? ''}
              onChange={(e) => setEditItem({ ...editItem, image_url: e.target.value })}
            />
            <div className="flex gap-2 pt-1">
              <Button variant="secondary" className="flex-1" onClick={() => setEditItem(null)}>Cancel</Button>
              <Button className="flex-1" onClick={saveItem} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
