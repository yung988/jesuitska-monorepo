import { createClient } from '@supabase/supabase-js'
import type { Guest, Room, RoomType, Reservation, Invoice, Payment, PensionInfo } from './types'

// Database types
export type Database = {
  public: {
    Tables: {
      guests: {
        Row: Guest
        Insert: Omit<Guest, 'id' | 'created_at'>
        Update: Partial<Omit<Guest, 'id' | 'created_at'>>
      }
      rooms: {
        Row: Room
        Insert: Omit<Room, 'id'>
        Update: Partial<Omit<Room, 'id'>>
      }
      room_types: {
        Row: RoomType
        Insert: Omit<RoomType, 'id'>
        Update: Partial<Omit<RoomType, 'id'>>
      }
      reservations: {
        Row: Reservation
        Insert: Omit<Reservation, 'id' | 'created_at'>
        Update: Partial<Omit<Reservation, 'id' | 'created_at'>>
      }
      invoices: {
        Row: Invoice
        Insert: Omit<Invoice, 'id' | 'created_at'>
        Update: Partial<Omit<Invoice, 'id' | 'created_at'>>
      }
      payments: {
        Row: Payment
        Insert: Omit<Payment, 'id' | 'created_at'>
        Update: Partial<Omit<Payment, 'id' | 'created_at'>>
      }
      pension_info: {
        Row: PensionInfo
        Insert: Omit<PensionInfo, 'id' | 'created_at'>
        Update: Partial<Omit<PensionInfo, 'id' | 'created_at'>>
      }
    }
  }
}

// Create Supabase client factory
export function createSupabaseClient(url: string, anonKey: string) {
  return createClient<Database>(url, anonKey)
}

// Create server client for SSR
export function createSupabaseServerClient(url: string, serviceRoleKey: string) {
  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
