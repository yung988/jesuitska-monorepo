import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../supabase'
import type { Invoice } from '../types'

export class InvoicesAPI {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getAll(includeRelations = true) {
    let query = this.supabase.from('invoices')
    
    if (includeRelations) {
      query = query.select(`
        *,
        reservations (
          id,
          check_in_date,
          check_out_date,
          guests (first_name, last_name, email, address, city, postal_code, country),
          rooms (room_number)
        )
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
      .from('invoices')
      .select(`
        *,
        reservations (
          *,
          guests (*),
          rooms (*, room_types (*))
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  async getByStatus(status: Invoice['status']) {
    const { data, error } = await this.supabase
      .from('invoices')
      .select(`
        *,
        reservations (
          guests (first_name, last_name, email),
          rooms (room_number)
        )
      `)
      .eq('status', status)
      .order('due_date', { ascending: true })
    
    if (error) throw error
    return data
  }

  async getOverdue() {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await this.supabase
      .from('invoices')
      .select(`
        *,
        reservations (
          guests (first_name, last_name, email, phone),
          rooms (room_number)
        )
      `)
      .lt('due_date', today)
      .in('status', ['sent', 'draft'])
      .order('due_date', { ascending: true })
    
    if (error) throw error
    return data
  }

  async getByReservation(reservationId: string) {
    const { data, error } = await this.supabase
      .from('invoices')
      .select('*')
      .eq('reservation_id', reservationId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
    return data
  }

  async create(invoice: Omit<Invoice, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('invoices')
      .insert(invoice)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async update(id: string, invoice: Partial<Omit<Invoice, 'id' | 'created_at'>>) {
    const { data, error } = await this.supabase
      .from('invoices')
      .update(invoice)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateStatus(id: string, status: Invoice['status'], paidDate?: string) {
    const updateData: any = { status }
    if (status === 'paid' && paidDate) {
      updateData.paid_date = paidDate
    }
    
    const { data, error } = await this.supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async markAsPaid(id: string) {
    return this.updateStatus(id, 'paid', new Date().toISOString())
  }

  async markAsOverdue(id: string) {
    return this.updateStatus(id, 'overdue')
  }

  async send(id: string) {
    return this.updateStatus(id, 'sent')
  }

  async cancel(id: string) {
    return this.updateStatus(id, 'cancelled')
  }

  async generateInvoiceNumber() {
    const year = new Date().getFullYear()
    
    // Get the last invoice number for this year
    const { data, error } = await this.supabase
      .from('invoices')
      .select('invoice_number')
      .like('invoice_number', `${year}%`)
      .order('invoice_number', { ascending: false })
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    
    let nextNumber = 1
    if (data) {
      const lastNumber = parseInt(data.invoice_number.slice(-4))
      nextNumber = lastNumber + 1
    }
    
    return `${year}${String(nextNumber).padStart(4, '0')}`
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from('invoices')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
