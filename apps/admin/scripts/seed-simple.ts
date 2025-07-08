import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
  console.log('🏨 Adding sample guests...')

  // Simple guest data - only required fields
  const guests = [
    {
      first_name: 'Test',
      last_name: 'User',
      email: 'test.user@example.com',
      phone: '+420 777 111 111'
    },
    {
      first_name: 'Marie',
      last_name: 'Nová',
      email: 'marie.nova@example.cz',
      phone: '+420 777 222 222'
    },
    {
      first_name: 'Peter',
      last_name: 'Veselý',
      email: 'peter.vesely@example.sk',
      phone: '+421 907 333 333'
    }
  ]

  for (const guest of guests) {
    const { data, error } = await supabase
      .from('guests')
      .insert(guest)
      .select()
    
    if (error) {
      console.error(`❌ Error:`, error)
    } else {
      console.log(`✅ Guest ${guest.first_name} ${guest.last_name} created`)
    }
  }

  // Check rooms
  const { data: rooms } = await supabase
    .from('rooms')
    .select('id, room_number')
  
  console.log(`Found ${rooms?.length || 0} rooms`)

  // If we have guests and rooms, create a few reservations
  const { data: guestData } = await supabase
    .from('guests')
    .select('id')
    .limit(3)

  if (guestData && rooms && guestData.length > 0 && rooms.length > 0) {
    const today = new Date()
    const reservation = {
      guest_id: guestData[0].id,
      room_id: rooms[0].id,
      check_in_date: today.toISOString().split('T')[0],
      check_out_date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      adults: 2,
      children: 0,
      status: 'confirmed',
      total_amount: 3600
    }

    const { error } = await supabase
      .from('reservations')
      .insert(reservation)
    
    if (error) {
      console.error('❌ Reservation error:', error)
    } else {
      console.log('✅ Sample reservation created')
    }
  }

  console.log('🎉 Done!')
}

seed().catch(console.error)
