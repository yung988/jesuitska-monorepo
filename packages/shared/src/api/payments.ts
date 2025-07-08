import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../supabase'
import type { Payment } from '../types'

export class PaymentsAPI {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getAll(includeRelations = true) {
    let query = this.supabase.from('payments')
    
    if (includeRelations) {
      query = query.select(`
        *,
        invoices (
          invoice_number,
          reservations (
            guests (first_name, last_name)
          )
        )
      `)
    } else {
      query = query.select('*')
    }
    
    const { data, error } = await query.order('payment_date', { ascending: false })
    
    if (error) throw error
    return data
  }

  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('payments')
      .select(`
        *,
        invoices (
          *,
          reservations (
            *,
            guests (*),
            rooms (*, room_types (*))
          )
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  async getByInvoice(invoiceId: string) {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('payment_date', { ascending: false })
    
    if (error) throw error
    return data
  }

  async getByStatus(status: Payment['status']) {
    const { data, error } = await this.supabase
      .from('payments')
      .select(`
        *,
        invoices (
          invoice_number,
          reservations (
            guests (first_name, last_name)
          )
        )
      `)
      .eq('status', status)
      .order('payment_date', { ascending: false })
    
    if (error) throw error
    return data
  }

  async getByDateRange(startDate: string, endDate: string) {
    const { data, error } = await this.supabase
      .from('payments')
      .select(`
        *,
        invoices (
          invoice_number,
          reservations (
            guests (first_name, last_name),
            rooms (room_number)
          )
        )
      `)
      .gte('payment_date', startDate)
      .lte('payment_date', endDate)
      .order('payment_date', { ascending: false })
    
    if (error) throw error
    return data
  }

  async getTodayPayments() {
    const today = new Date().toISOString().split('T')[0]
    return this.getByDateRange(today, today)
  }

  async getRevenue(startDate: string, endDate: string) {
    const { data, error } = await this.supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('payment_date', startDate)
      .lte('payment_date', endDate)
    
    if (error) throw error
    
    const total = data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0
    return total
  }

  async create(payment: Omit<Payment, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('payments')
      .insert(payment)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async update(id: string, payment: Partial<Omit<Payment, 'id' | 'created_at'>>) {
    const { data, error } = await this.supabase
      .from('payments')
      .update(payment)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateStatus(id: string, status: Payment['status']) {
    const { data, error } = await this.supabase
      .from('payments')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async complete(id: string) {
    return this.updateStatus(id, 'completed')
  }

  async fail(id: string) {
    return this.updateStatus(id, 'failed')
  }

  async recordPayment(invoiceId: string, amount: number, method: Payment['payment_method'], notes?: string) {
    const payment: Omit<Payment, 'id' | 'created_at'> = {
      invoice_id: invoiceId,
      amount,
      payment_date: new Date().toISOString(),
      payment_method: method,
      status: 'completed',
      transaction_id: `PAY${Date.now()}`,
      notes
    }
    
    return this.create(payment)
  }

  async generateTransactionId() {
    return `PAY${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from('payments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  async getPaymentMethods() {
    return [
      { value: 'cash', label: 'Hotovost' },
      { value: 'card', label: 'Platební karta' },
      { value: 'transfer', label: 'Bankovní převod' }
    ]
  }
}
