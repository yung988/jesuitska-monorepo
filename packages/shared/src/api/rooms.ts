import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../supabase'
import type { Room } from '../types'

export class RoomsAPI {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getAll(includeTypes = true) {
    let query = this.supabase.from('rooms')
    
    if (includeTypes) {
      query = query.select(`
        *,
        room_types (*)
      `)
    } else {
      query = query.select('*')
    }
    
    const { data, error } = await query.order('room_number', { ascending: true })
    
    if (error) throw error
    return data
  }

  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('rooms')
      .select(`
        *,
        room_types (*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  async getByRoomNumber(roomNumber: string) {
    const { data, error } = await this.supabase
      .from('rooms')
      .select(`
        *,
        room_types (*)
      `)
      .eq('room_number', roomNumber)
      .single()
    
    if (error) throw error
    return data
  }

  async getAvailable(checkIn: string, checkOut: string) {
    // First get all rooms
    const { data: allRooms, error: roomsError } = await this.supabase
      .from('rooms')
      .select(`
        *,
        room_types (*)
      `)
      .eq('status', 'available')
    
    if (roomsError) throw roomsError

    // Then get occupied rooms for the date range
    const { data: occupiedRooms, error: reservationsError } = await this.supabase
      .from('reservations')
      .select('room_id')
      .or(`and(check_in_date.lte.${checkOut},check_out_date.gte.${checkIn})`)
      .not('status', 'eq', 'cancelled')
    
    if (reservationsError) throw reservationsError

    const occupiedRoomIds = occupiedRooms?.map(r => r.room_id) || []
    const availableRooms = allRooms?.filter(room => !occupiedRoomIds.includes(room.id)) || []
    
    return availableRooms
  }

  async create(room: Omit<Room, 'id'>) {
    const { data, error } = await this.supabase
      .from('rooms')
      .insert(room)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async update(id: string, room: Partial<Omit<Room, 'id'>>) {
    const { data, error } = await this.supabase
      .from('rooms')
      .update(room)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateStatus(id: string, status: Room['status']) {
    const { data, error } = await this.supabase
      .from('rooms')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async markAsClean(id: string) {
    const { data, error } = await this.supabase
      .from('rooms')
      .update({ is_clean: true, status: 'available' })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async markForCleaning(id: string) {
    const { data, error } = await this.supabase
      .from('rooms')
      .update({ is_clean: false, status: 'cleaning' })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async markForMaintenance(id: string) {
    const { data, error } = await this.supabase
      .from('rooms')
      .update({ status: 'maintenance' })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from('rooms')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
