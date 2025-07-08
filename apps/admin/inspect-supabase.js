const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('Missing Supabase credentials');
  console.log('URL:', supabaseUrl ? 'Present' : 'Missing');
  console.log('Key:', supabaseServiceKey ? 'Present' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectTables() {
  const tables = ['guests', 'rooms', 'room_types', 'reservations', 'invoices', 'payments', 'pension_info'];
  
  console.log('🔍 Inspecting Supabase Tables...\n');
  
  for (const table of tables) {
    console.log(`--- Table: ${table} ---`);
    
    try {
      // Get count
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
        
      if (error) {
        console.log('❌ Error:', error.message);
        continue;
      }
      
      console.log(`📊 Count: ${count || 0}`);
      
      // Get a sample row to see structure
      if (count > 0) {
        const { data: sample, error: sampleError } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        if (sampleError) {
          console.log('❌ Sample error:', sampleError.message);
        } else if (sample && sample.length > 0) {
          console.log('📋 Columns:', Object.keys(sample[0]).join(', '));
          
          // Show sample data for small tables
          if (count <= 5) {
            console.log('📄 Sample data:', JSON.stringify(sample[0], null, 2));
          }
        }
      }
      
      console.log('');
    } catch (err) {
      console.log('❌ Exception:', err.message);
    }
  }
}

inspectTables().catch(console.error);
