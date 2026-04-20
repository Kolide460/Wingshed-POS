import Link from 'next/link'
import type { ReactNode } from 'react'

const NAV = [
  { href: '/admin', label: '📊 Dashboard', exact: true },
  { href: '/admin/menu', label: '🍗 Menu' },
  { href: '/admin/hours', label: '🕐 Hours' },
  { href: '/admin/slots', label: '🚫 Block slots' },
  { href: '/admin/reports', label: '💰 Reports' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-900 px-4 py-3 flex items-center gap-2">
        <span className="text-xl">🍗</span>
        <span className="text-white font-black">Wingshed Admin</span>
        <Link href="/" className="ml-auto text-gray-400 text-xs hover:text-gray-200">← Storefront</Link>
      </header>

      <nav className="bg-white border-b border-gray-100 overflow-x-auto">
        <div className="flex px-2">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex-shrink-0 px-4 py-3 text-sm font-medium text-gray-600 hover:text-brand-600 hover:border-b-2 hover:border-brand-500 transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5">
        {children}
      </main>
    </div>
  )
}
