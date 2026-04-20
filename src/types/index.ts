export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'collected' | 'cancelled'
export type PaymentMethod = 'stripe' | 'collection'
export type PaymentStatus = 'unpaid' | 'paid'

export interface Category {
  id: string
  name: string
  display_order: number
  active: boolean
  created_at: string
}

export interface MenuItem {
  id: string
  category_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  active: boolean
  display_order: number
  created_at: string
  category?: Category
}

export interface Order {
  id: string
  order_number: number
  status: OrderStatus
  customer_name: string
  customer_phone: string | null
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  stripe_payment_intent_id: string | null
  pickup_time: string
  order_notes: string | null
  total: number
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string | null
  menu_item_name: string
  quantity: number
  unit_price: number
  notes: string | null
  created_at: string
}

export interface BusinessHours {
  id: string
  day_of_week: number
  open_time: string
  close_time: string
  is_open: boolean
}

export interface BlockedSlot {
  id: string
  block_date: string
  start_time: string
  end_time: string
  reason: string | null
  created_at: string
}

export interface CartItem {
  menu_item: MenuItem
  quantity: number
  notes: string
}

export interface Settings {
  shop_name: string
  shop_phone: string
  shop_address: string
  lead_time_minutes: number
  slot_duration_minutes: number
  max_orders_per_slot: number
  collection_enabled: boolean
  stripe_enabled: boolean
}

export interface TimeSlot {
  time: string
  label: string
  available: boolean
}
