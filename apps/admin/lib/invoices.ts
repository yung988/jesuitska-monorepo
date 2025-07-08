import { createClient } from '@/lib/supabase';

const supabase = createClient();

export async function fetchInvoices() {
  const { data, error } = await supabase
    .from('invoices')
    .select('*');

  if (error) throw error;
  return data;
}

export async function createInvoice(invoiceData) {
  const { data, error } = await supabase
    .from('invoices')
    .insert(invoiceData);

  if (error) throw error;
  return data;
}

export async function updateInvoice(id, invoiceData) {
  const { data, error } = await supabase
    .from('invoices')
    .update(invoiceData)
    .eq('id', id);

  if (error) throw error;
  return data;
}

export async function deleteInvoice(id) {
  const { data, error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return data;
}
