import { HoursManager } from '@/components/admin/HoursManager'

export default function AdminHoursPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-black text-2xl">Opening hours</h1>
      <HoursManager />
    </div>
  )
}
