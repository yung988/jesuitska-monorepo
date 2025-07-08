import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../supabase'
import type { Reservation } from '../types'

export class ReservationsAPI {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getAll(includeRelations = true) {
    let query = this.supabase.from('reservations')
    
    if (includeRelations) {
      query = query.select(`
        *,
        guests (first_name, last_name, email, phone),
        rooms (room_number, room_types (name, base_price))
      `)
    } else {
      query = query.select('*')
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('reservations')
      .select(`
        *,
        guests (*),
        rooms (*, room_types (*))
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  async getByDateRange(startDate: string, endDate: string) {
    const { data, error } = await this.supabase
      .from('reservations')
      .select(`
        *,
        guests (first_name, last_name),
        rooms (room_number)
      `)
      .gte('check_in_date', startDate)
      .lte('check_out_date', endDate)
      .order('check_in_date', { ascending: true })
    
    if (error) throw error
    return data
  }

  async getTodayArrivals() {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await this.supabase
      .from('reservations')
      .select(`
        *,
        guests (first_name, last_name, email, phone),
        rooms (room_number)
      `)
      .eq('check_in_date', today)
      .in('status', ['confirmed'])
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  async getTodayDepartures() {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await this.supabase
      .from('reservations')
      .select(`
        *,
        guests (first_name, last_name, email, phone),
        rooms (room_number)
      `)
      .eq('check_out_date', today)
      .in('status', ['checked_in'])
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  async create(reservation: Omit<Reservation, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('reservations')
      .insert(reservation)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async update(id: string, reservation: Partial<Omit<Reservation, 'id' | 'created_at'>>) {
    const { data, error } = await this.supabase
      .from('reservations')
      .update(reservation)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateStatus(id: string, status: Reservation['status']) {
    const { data, error } = await this.supabase
      .from('reservations')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async checkIn(id: string) {
    return this.updateStatus(id, 'checked_in')
  }

  async checkOut(id: string) {
    return this.updateStatus(id, 'checked_out')
  }

  async cancel(id: string) {
    return this.updateStatus(id, 'cancelled')
  }

  async getOccupancyForDate(date: string) {
    const { data, error } = await this.supabase
      .from('reservations')
      .select('room_id')
      .lte('check_in_date', date)
      .gte('check_out_date', date)
      .not('status', 'eq', 'cancelled')
    
    if (error) throw error
    return data?.map(r => r.room_id) || []
  }
}
