const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdminUsers() {
  console.log('Fetching admin users from Supabase...\n');
  
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin users:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('No admin users found in the database.');
    return;
  }

  console.log(`Found ${data.length} admin user(s):\n`);
  
  data.forEach((user, index) => {
    console.log(`User ${index + 1}:`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.full_name}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Active: ${user.is_active}`);
    console.log(`  Created: ${user.created_at}`);
    console.log(`  Last login: ${user.last_login || 'Never'}`);
    console.log('');
  });
}

checkAdminUsers().catch(console.error);
