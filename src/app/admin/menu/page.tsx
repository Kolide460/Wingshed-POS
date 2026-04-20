import { MenuManager } from '@/components/admin/MenuManager'

export default function AdminMenuPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-black text-2xl">Menu management</h1>
      <MenuManager />
    </div>
  )
}
