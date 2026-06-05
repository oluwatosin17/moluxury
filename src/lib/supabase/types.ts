export type OrderStatus =
  | 'pending' | 'payment_received' | 'processing'
  | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

export type BookingStatus =
  | 'new' | 'contacted' | 'confirmed'
  | 'completed' | 'no_show' | 'cancelled'

export interface DBProduct {
  id: string
  slug: string
  name: string
  price_naira: number
  description?: string
  images: string[]
  category_slugs: string[]
  available_lengths: string[]
  available_densities: string[]
  texture?: string
  cap_type: string
  origin: string
  is_published: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  slug: string
  label: string
  display_order: number
  is_filter: boolean
}

export interface OrderItem {
  name: string
  slug: string
  length: string
  density: string
  quantity: number
  priceNum: number
  price: string
}

export interface Order {
  id: string
  order_ref: string
  created_at: string
  updated_at: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  street_address?: string
  city?: string
  state?: string
  zip?: string
  country: string
  additional_notes?: string
  items: OrderItem[]
  subtotal: number
  status: OrderStatus
  payment_proof_url?: string
  payment_confirmed_at?: string
  payment_confirmed_by?: string
  tracking_number?: string
  shipped_at?: string
  delivered_at?: string
  admin_notes?: string
  source: string
}

export interface Booking {
  id: string
  booking_ref: string
  created_at: string
  updated_at: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
  contact_method: 'whatsapp' | 'email'
  service_slug: string
  service_name: string
  service_price_from?: number
  preferred_date?: string
  preferred_time?: string
  confirmed_date?: string
  status: BookingStatus
  admin_notes?: string
  source: string
}
