import { SlotBlocker } from '@/components/admin/SlotBlocker'

export default function AdminSlotsPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-black text-2xl">Block time slots</h1>
      <p className="text-sm text-gray-500">Block specific date/time ranges to prevent customers from booking during those windows.</p>
      <SlotBlocker />
    </div>
  )
}
