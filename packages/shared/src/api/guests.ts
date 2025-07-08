import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../supabase'
import type { Guest } from '../types'

export class GuestsAPI {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getAll() {
    const { data, error } = await this.supabase
      .from('guests')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('guests')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  async create(guest: Omit<Guest, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('guests')
      .insert(guest)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async update(id: string, guest: Partial<Omit<Guest, 'id' | 'created_at'>>) {
    const { data, error } = await this.supabase
      .from('guests')
      .update(guest)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from('guests')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  async search(query: string) {
    const { data, error } = await this.supabase
      .from('guests')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}
