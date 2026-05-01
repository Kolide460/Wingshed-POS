import Link from 'next/link'
import type { ReactNode } from 'react'

const NAV = [
  { href: '/admin', label: '📊 Dashboard' },
  { href: '/admin/menu', label: '🍗 Menu' },
  { href: '/admin/hours', label: '🕐 Hours' },
  { href: '/admin/slots', label: '🚫 Block slots' },
  { href: '/admin/reports', label: '💰 Reports' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ws-admin">
      <div className="ws-admin-header">
        <span style={{ fontSize: 20 }}>🍗</span>
        <span className="ws-admin-header-title">Wingshed Admin</span>
        <Link href="/menu" className="ws-admin-header-link">← Storefront</Link>
      </div>

      <nav className="ws-admin-nav">
        <div className="ws-admin-nav-inner">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="ws-admin-nav-link">
              {n.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="ws-admin-main">
        {children}
      </main>
    </div>
  )
}
