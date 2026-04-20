import { cn } from '@/lib/utils'

type BadgeVariant = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'collected' | 'cancelled' | 'paid' | 'unpaid'

const variantStyles: Record<BadgeVariant, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready:     'bg-green-100 text-green-800',
  collected: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
  paid:      'bg-green-100 text-green-800',
  unpaid:    'bg-yellow-100 text-yellow-800',
}

export function Badge({ variant, label }: { variant: BadgeVariant; label?: string }) {
  return (
    <span
      className={cn(
        'inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize',
        variantStyles[variant] ?? 'bg-gray-100 text-gray-700'
      )}
    >
      {label ?? variant}
    </span>
  )
}
