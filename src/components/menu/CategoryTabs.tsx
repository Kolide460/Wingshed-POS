'use client'

import type { Category } from '@/types'

interface Props {
  categories: Category[]
  active: string
  onChange: (id: string) => void
}

export function CategoryTabs({ categories, active, onChange }: Props) {
  return (
    <div className="ws-cats scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`ws-cat${active === cat.id ? ' active' : ''}`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
