import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedSampleData() {
  console.log('🏨 Seeding sample data based on Pension Jesuitská...')

  // Create some sample guests based on reviews
  const guests = [
    {
      first_name: 'Milena',
      last_name: 'Smith',
      email: 'milena.smith@example.com',
      phone: '+44 7700 900123',
      address: '123 High Street',
      city: 'London',
      postal_code: 'SW1A 1AA',
      country: 'Velká Británie'
    },
    {
      first_name: 'Jan',
      last_name: 'Novák',
      email: 'jan.novak@example.cz',
      phone: '+420 777 123 456',
      address: 'Václavská 123',
      city: 'Praha',
      postal_code: '110 00',
      country: 'Česká republika'
    },
    {
      first_name: 'Petra',
      last_name: 'Svobodová',
      email: 'petra.svobodova@example.cz',
      phone: '+420 777 234 567',
      address: 'Náměstí Svobody 456',
      city: 'Brno',
      postal_code: '602 00',
      country: 'Česká republika'
    },
    {
      first_name: 'Monika',
      last_name: 'Dvořáková',
      email: 'monika.dvorakova@example.cz',
      phone: '+420 777 345 678',
      address: 'Masarykova 789',
      city: 'Olomouc',
      postal_code: '779 00',
      country: 'Česká republika'
    },
    {
      first_name: 'Hans',
      last_name: 'Müller',
      email: 'hans.mueller@example.at',
      phone: '+43 664 123 4567',
      address: 'Hauptstraße 10',
      city: 'Wien',
      postal_code: '1010',
      country: 'Rakousko'
    },
    {
      first_name: 'Eva',
      last_name: 'Schmidt',
      email: 'eva.schmidt@example.de',
      phone: '+49 170 123 4567',
      address: 'Marienplatz 5',
      city: 'München',
      postal_code: '80331',
      country: 'Německo'
    }
  ]

  for (const guest of guests) {
    const { data, error } = await supabase
      .from('guests')
      .insert(guest)
      .select()
      .single()
    
    if (error) {
      console.error(`❌ Error creating guest ${guest.first_name} ${guest.last_name}:`, error)
    } else {
      console.log(`✅ Guest ${guest.first_name} ${guest.last_name} created`)
    }
  }

  // Create sample reservations
  const { data: guestsList } = await supabase
    .from('guests')
    .select('id, first_name, last_name')
  
  const { data: roomsList } = await supabase
    .from('rooms')
    .select('id, room_number')

  if (guestsList && roomsList && guestsList.length > 0 && roomsList.length > 0) {
    const today = new Date()
    const reservations = [
      {
        guest_id: guestsList[0].id,
        room_id: roomsList[0].id,
        check_in_date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        check_out_date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
        adults: 2,
        children: 0,
        status: 'confirmed',
        total_amount: 5400, // 3 nights * 1800
        notes: 'Požadavek na pokoj s výhledem do dvora'
      },
      {
        guest_id: guestsList[1].id,
        room_id: roomsList[2].id,
        check_in_date: today.toISOString().split('T')[0], // Today
        check_out_date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
        adults: 2,
        children: 0,
        status: 'checked_in',
        total_amount: 3600, // 2 nights * 1800
        notes: 'Příjezd v 15:00'
      },
      {
        guest_id: guestsList[2].id,
        room_id: roomsList[4].id,
        check_in_date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
        check_out_date: today.toISOString().split('T')[0], // Today
        adults: 2,
        children: 0,
        status: 'checked_out',
        total_amount: 6000, // 3 nights * 2000
        notes: 'Spokojenost s pobytem, vrátí se příští rok'
      },
      {
        guest_id: guestsList[3].id,
        room_id: roomsList[8].id, // Deluxe Suite
        check_in_date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
        check_out_date: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 21 days from now
        adults: 2,
        children: 2,
        status: 'confirmed',
        total_amount: 24500, // 7 nights * 3500
        notes: 'Rodina s dětmi, požadavek na dětskou postýlku'
      },
      {
        guest_id: guestsList[4]?.id,
        room_id: roomsList[1]?.id,
        check_in_date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        check_out_date: new Date(today.getTime() + 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 32 days from now
        adults: 2,
        children: 0,
        status: 'confirmed',
        total_amount: 3600, // 2 nights * 1800 + breakfast
        notes: 'Rakouský host, oceňuje snídaně'
      }
    ]

    for (const reservation of reservations) {
      if (reservation.guest_id && reservation.room_id) {
        const { error } = await supabase
          .from('reservations')
          .insert(reservation)
        
        if (error) {
          console.error('❌ Error creating reservation:', error)
        } else {
          console.log(`✅ Reservation created for guest ${guestsList.find(g => g.id === reservation.guest_id)?.first_name}`)
        }
      }
    }

    // Create invoices for confirmed/completed reservations
    const { data: reservationsList } = await supabase
      .from('reservations')
      .select('*')
      .in('status', ['confirmed', 'checked_in', 'checked_out'])

    if (reservationsList) {
      for (const reservation of reservationsList) {
        const invoiceNumber = `2025${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
        const { error } = await supabase
          .from('invoices')
          .insert({
            reservation_id: reservation.id,
            invoice_number: invoiceNumber,
            issue_date: reservation.created_at,
            due_date: new Date(new Date(reservation.check_in_date).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            subtotal: reservation.total_amount * 0.79, // Without VAT
            tax: reservation.total_amount * 0.21, // 21% VAT
            total: reservation.total_amount,
            status: reservation.status === 'checked_out' ? 'paid' : 'sent',
            paid_date: reservation.status === 'checked_out' ? reservation.check_out_date : null
          })
        
        if (error) {
          console.error('❌ Error creating invoice:', error)
        } else {
          console.log(`✅ Invoice ${invoiceNumber} created`)
        }
      }
    }

    // Create payments for paid invoices
    const { data: paidInvoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('status', 'paid')

    if (paidInvoices) {
      for (const invoice of paidInvoices) {
        const { error } = await supabase
          .from('payments')
          .insert({
            invoice_id: invoice.id,
            amount: invoice.total,
            payment_date: invoice.paid_date,
            payment_method: 'cash',
            status: 'completed',
            transaction_id: `PAY${Date.now()}`,
            notes: 'Platba při odjezdu'
          })
        
        if (error) {
          console.error('❌ Error creating payment:', error)
        } else {
          console.log(`✅ Payment created for invoice ${invoice.invoice_number}`)
        }
      }
    }
  }

  console.log('🎉 Sample data seeding completed!')
}

// Run the seed
seedSampleData().catch(console.error)
