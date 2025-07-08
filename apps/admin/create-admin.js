const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdmin() {
  const email = 'admin@pension-jesuitska.cz';
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  console.log('Creating admin user...');
  console.log('Email:', email);
  console.log('Password:', password);

  const { data, error } = await supabase
    .from('admin_users')
    .upsert({
      email,
      password_hash: passwordHash,
      full_name: 'Admin Jesuitská',
      role: 'admin',
      is_active: true
    }, {
      onConflict: 'email'
    });

  if (error) {
    console.error('Error creating admin:', error);
  } else {
    console.log('Admin user created successfully!');
  }
}

createAdmin().catch(console.error);
