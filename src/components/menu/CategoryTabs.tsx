'use client'

import { cn } from '@/lib/utils'
import type { Category } from '@/types'

interface Props {
  categories: Category[]
  active: string
  onChange: (id: string) => void
}

export function CategoryTabs({ categories, active, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={cn(
            'flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-colors',
            active === cat.id
              ? 'bg-brand-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
