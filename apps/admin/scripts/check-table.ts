import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTable() {
  // First, let's see what's in the pension_info table
  const { data, error } = await supabase
    .from('pension_info')
    .select('*')
    .limit(1)

  console.log('Data:', data)
  console.log('Error:', error)

  // Let's also check the table structure via SQL
  const { data: columns, error: columnsError } = await supabase
    .rpc('get_table_columns', {
      table_name: 'pension_info'
    })
    .catch(() => ({ data: null, error: 'RPC not available' }))

  console.log('Columns:', columns)
  console.log('Columns Error:', columnsError)
}

checkTable().catch(console.error)
