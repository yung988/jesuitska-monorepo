// Database types
export interface Guest {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  created_at: string
}

export interface Room {
  id: string
  room_number: string
  room_type_id: string
  floor: number
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance'
  is_clean: boolean
  room_types?: RoomType
}

export interface RoomType {
  id: string
  name: string
  description?: string
  base_price: number
  max_occupancy: number
  amenities?: string[]
}

export interface Reservation {
  id: string
  guest_id: string
  room_id: string
  check_in_date: string
  check_out_date: string
  adults: number
  children: number
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
  total_amount: number
  notes?: string
  created_at: string
  guests?: Guest
  rooms?: Room
}

export interface Invoice {
  id: string
  reservation_id: string
  invoice_number: string
  issue_date: string
  due_date: string
  subtotal: number
  tax: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  paid_date?: string
  created_at: string
  reservations?: Reservation
}

export interface Payment {
  id: string
  invoice_id: string
  amount: number
  payment_date: string
  payment_method: 'cash' | 'card' | 'transfer'
  transaction_id?: string
  status: 'pending' | 'completed' | 'failed'
  notes?: string
  created_at: string
  invoices?: Invoice
}

export interface PensionInfo {
  id: string
  name: string
  address: string
  city?: string
  postal_code?: string
  country?: string
  phone: string
  phone2?: string
  phone_secondary?: string
  email: string
  website?: string
  manager_name?: string
  owner_name?: string
  ic?: string
  company_id?: string
  description?: string
  check_in_time: string
  check_out_time: string
  breakfast_price?: number
  rating?: number
  location_rating?: number
  opened_year?: number
  languages?: string[]
  languages_spoken?: string[]
  payment_methods?: string[]
  policies?: any
  amenities?: string[]
  created_at: string
}
