'use client'

import { useState } from 'react'
import Image from 'next/image'
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
    <div className="ws-card">
      {item.image_url ? (
        <div style={{ position: 'relative', height: 130 }}>
          <Image src={item.image_url} alt={item.name} fill className="ws-card-img" style={{ objectFit: 'cover' }} />
        </div>
      ) : (
        <div className="ws-card-img-placeholder">🍗</div>
      )}
      <div className="ws-card-body">
        <div className="ws-card-name">{item.name}</div>
        {item.description && <div className="ws-card-desc">{item.description}</div>}
        {showNotes && (
          <textarea
            className="ws-note-input"
            rows={2}
            placeholder="Any notes? (e.g. extra sauce…)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        )}
        <div className="ws-card-footer">
          <span className="ws-price">{formatPrice(item.price)}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              className="ws-note-toggle"
              onClick={() => setShowNotes((v) => !v)}
            >
              {showNotes ? 'hide' : '+ note'}
            </button>
            <button className="ws-add-btn" onClick={handleAdd}>+</button>
          </div>
        </div>
      </div>
    </div>
  )
}
