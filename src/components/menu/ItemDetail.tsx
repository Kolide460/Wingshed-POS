'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/utils'
import type { MenuItem } from '@/types'

const SAUCES = [
  { id: 'shed',      name: 'Shed Sauce',       heat: 1, desc: 'House blend, smoky' },
  { id: 'hot-honey', name: 'Hot Honey',         heat: 2, desc: 'Sticky, sweet, warm' },
  { id: 'buffalo',   name: 'Classic Buffalo',   heat: 2, desc: 'Vinegar-forward' },
  { id: 'korean',    name: 'Gochujang Glaze',   heat: 3, desc: 'Fermented chili, garlic' },
  { id: 'inferno',   name: 'Inferno',           heat: 4, desc: 'Carolina reaper. Sign waiver.' },
  { id: 'plain',     name: 'No sauce',          heat: 0, desc: 'Just salt' },
]

const DIPS = [
  { id: 'ranch',  name: 'Buttermilk Ranch', price: 0.80 },
  { id: 'blue',   name: 'Blue Cheese',      price: 0.80 },
  { id: 'garlic', name: 'Garlic Aioli',     price: 0.80 },
  { id: 'bbq',    name: 'Smoked BBQ',       price: 0.80 },
]

interface Props {
  item: MenuItem
  categoryName: string
  onClose: () => void
  onAdd: (item: MenuItem, notes: string) => void
}

function HeatDots({ n }: { n: number }) {
  return (
    <span className="ws-heat-dots">
      {[1,2,3,4].map(i => (
        <span key={i} className={`ws-heat-dot${i <= n ? ' on' : ''}`} />
      ))}
    </span>
  )
}

function Money({ value }: { value: number }) {
  const [whole, frac] = value.toFixed(2).split('.')
  return (
    <span className="ws-money">
      <span className="ws-money-symbol">£</span>{whole}<span className="ws-money-frac">.{frac}</span>
    </span>
  )
}

export function ItemDetail({ item, categoryName, onClose, onAdd }: Props) {
  const isWings = categoryName.toLowerCase().includes('wing')
  const [sauce, setSauce] = useState<string>(isWings ? 'shed' : '')
  const [dips, setDips] = useState<string[]>([])
  const [qty, setQty] = useState(1)
  const [notes, setNotes] = useState('')

  const dipsTotal = dips.length * 0.80
  const lineTotal = (item.price + dipsTotal) * qty
  const canAdd = !isWings || sauce !== ''

  const toggleDip = (id: string) =>
    setDips(d => d.includes(id) ? d.filter(x => x !== id) : [...d, id])

  const handleAdd = () => {
    const parts: string[] = []
    if (sauce) {
      const sauceObj = SAUCES.find(s => s.id === sauce)
      if (sauceObj) parts.push(`Sauce: ${sauceObj.name}`)
    }
    if (dips.length) {
      const dipNames = dips.map(id => DIPS.find(d => d.id === id)?.name).filter(Boolean)
      parts.push(`Dips: ${dipNames.join(', ')}`)
    }
    if (notes) parts.push(notes)
    onAdd(item, parts.join(' | '))
    onClose()
  }

  return (
    <div className="ws-overlay" onClick={onClose}>
      <div className="ws-overlay-panel" onClick={e => e.stopPropagation()}>
        <button className="ws-detail-back" onClick={onClose}>
          <BackIcon />
        </button>

        <div className="ws-detail-hero">
          <div className="ws-detail-eyebrow">{categoryName}</div>
          <h1 className="ws-detail-name">{item.name}</h1>
          {item.description && <p className="ws-detail-desc">{item.description}</p>}
          <Money value={item.price} />
        </div>

        <div className="ws-detail-body">
          {isWings && (
            <div className="ws-section">
              <div className="ws-section-header">
                <div>
                  <span className="ws-section-title">Pick a sauce</span>
                  <span className="ws-section-required">Required</span>
                </div>
              </div>
              <div className="ws-section-rows">
                {SAUCES.map(s => (
                  <button
                    key={s.id}
                    className={`ws-option-row${sauce === s.id ? ' selected' : ''}`}
                    onClick={() => setSauce(s.id)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                        <span className="ws-option-name">{s.name}</span>
                        {s.heat > 0 && <HeatDots n={s.heat} />}
                      </div>
                      <div className="ws-option-desc">{s.desc}</div>
                    </div>
                    <div className={`ws-radio-dot${sauce === s.id ? ' active' : ''}`}>
                      {sauce === s.id && <div className="ws-radio-inner" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="ws-section">
            <div className="ws-section-header">
              <span className="ws-section-title">Add dips</span>
              <span className="ws-section-hint">80p each</span>
            </div>
            <div className="ws-section-rows">
              {DIPS.map(d => (
                <button
                  key={d.id}
                  className={`ws-option-row${dips.includes(d.id) ? ' selected' : ''}`}
                  onClick={() => toggleDip(d.id)}
                >
                  <span style={{ flex: 1 }} className="ws-option-name">{d.name}</span>
                  <span style={{ marginRight: 12, color: 'var(--ws-ink-muted)', fontSize: 13 }}>
                    <Money value={d.price} />
                  </span>
                  <div className={`ws-checkbox${dips.includes(d.id) ? ' active' : ''}`}>
                    {dips.includes(d.id) && <CheckIcon />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="ws-section">
            <div className="ws-section-header">
              <span className="ws-section-title">Anything else?</span>
            </div>
            <div style={{ padding: '0 20px' }}>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Allergies, prep notes…"
                className="ws-checkout-input"
                style={{ minHeight: 64, resize: 'none' }}
              />
            </div>
          </div>
        </div>

        <div className="ws-dock">
          <div className="ws-stepper">
            <button className="ws-stepper-btn" disabled={qty <= 1} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
            <span className="ws-stepper-num">{qty}</span>
            <button className="ws-stepper-btn" onClick={() => setQty(q => q + 1)}>+</button>
          </div>
          <button className="ws-add-btn" disabled={!canAdd} onClick={handleAdd}>
            <span>Add to basket</span>
            <Money value={lineTotal} />
          </button>
        </div>
      </div>
    </div>
  )
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
