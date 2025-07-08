import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedPensionInfo() {
  console.log('🏨 Seeding pension information...')

  // First get the existing record
  const { data: existing } = await supabase
    .from('pension_info')
    .select('id')
    .single()

  // Update pension_info table with the correct column names
  const { error: pensionError } = await supabase
    .from('pension_info')
    .update({
      name: 'Pension Jesuitská',
      address: 'Jesuitská 5/183, 669 02 Znojmo',
      phone: '+420 603 830 130',
      phone2: '+420 515 224 496',
      phone_secondary: '+420 515 224 496',
      email: 'info@jesuitska.cz',
      website: 'http://www.jesuitska.cz',
      manager_name: 'Jana Sabáčková',
      owner_name: 'Jana Sabáčková',
      ic: '44969732',
      company_id: '44969732',
      description: 'Výjimečně hodnocené ubytovací zařízení v historickém centru Znojma s celkovým hodnocením 8,8/10. Pension byl otevřen v roce 1994 po důkladné rekonstrukci historické budovy ve středověkém centru Znojma.',
      check_in_time: '13:00 - 19:00',
      check_out_time: '08:00 - 11:00',
      breakfast_price: 8,
      rating: 8.8,
      location_rating: 9.7,
      opened_year: 1994,
      languages: ['Čeština', 'Němčina', 'Angličtina', 'Slovenština'],
      languages_spoken: ['Čeština', 'Němčina', 'Angličtina', 'Slovenština'],
      payment_methods: ['Hotovost'],
      policies: [
        'Nekuřácký penzion',
        'Párty/akce nejsou povoleny',
        'Domácí mazlíčci na vyžádání',
        'Děti všech věků jsou vítány',
        'Dětská postýlka za 10€/noc (0-3 roky)'
      ],
      amenities: [
        'Bezplatné parkování',
        'Bezplatné Wi-Fi',
        'Rodinné pokoje',
        'Nekuřácké pokoje',
        'Kávovar/čajník na všech pokojích',
        'Snídaně formou bufetu',
        'Terasa s výhledem na vnitřní nádvoří',
        'Vlastní malá vinotéka',
        'Půjčení a úschova kol',
        'Domácí mazlíčci povoleni na vyžádání'
      ]
    })
    .eq('id', existing?.id || '2031be20-76a8-43c1-93d1-5470f6cc5735')

  if (pensionError) {
    console.error('❌ Error updating pension info:', pensionError)
    return
  }

  console.log('✅ Pension info updated')

  // Seed room types
  const roomTypes = [
    {
      name: 'Dvoulůžkový pokoj',
      description: 'Komfortní dvoulůžkový pokoj s manželskou postelí',
      base_price: 1800,
      max_occupancy: 2,
      amenities: [
        'Vlastní koupelna',
        'TV s plochou obrazovkou',
        'Bezplatné Wi-Fi',
        'Kávovar/čajník',
        'Fén',
        'Bezplatné toaletní potřeby'
      ]
    },
    {
      name: 'Dvoulůžkový pokoj se dvěma lůžky',
      description: 'Prostorný pokoj se dvěma oddělenými lůžky',
      base_price: 1800,
      max_occupancy: 2,
      amenities: [
        'Vlastní koupelna',
        'TV s plochou obrazovkou',
        'Bezplatné Wi-Fi',
        'Kávovar/čajník',
        'Fén',
        'Bezplatné toaletní potřeby'
      ]
    },
    {
      name: 'Standardní dvoulůžkový pokoj',
      description: 'Standardní pokoj s manželskou postelí a všemi potřebnými vymoženostmi',
      base_price: 2000,
      max_occupancy: 2,
      amenities: [
        'Vlastní koupelna',
        'TV s plochou obrazovkou',
        'Bezplatné Wi-Fi',
        'Kávovar/čajník',
        'Lednice',
        'Fén',
        'Bezplatné toaletní potřeby',
        'Posezení'
      ]
    },
    {
      name: 'Deluxe Suite',
      description: 'Luxusní apartmá s oddělenou ložnicí a obývacím pokojem',
      base_price: 3500,
      max_occupancy: 4,
      amenities: [
        'Ložnice s manželskou postelí',
        'Obývací pokoj s rozkládací pohovkou',
        'Futon',
        'Vlastní koupelna',
        'TV s plochou obrazovkou',
        'Bezplatné Wi-Fi',
        'Kávovar/čajník',
        'Lednice',
        'Fén',
        'Bezplatné toaletní potřeby',
        'Posezení',
        'Pohovka'
      ]
    }
  ]

  for (const roomType of roomTypes) {
    const { error: rtError } = await supabase
      .from('room_types')
      .upsert(roomType, { onConflict: 'name' })
    
    if (rtError) {
      console.error(`❌ Error creating room type ${roomType.name}:`, rtError)
    } else {
      console.log(`✅ Room type ${roomType.name} created`)
    }
  }

  // Seed rooms
  const rooms = [
    // Dvoulůžkové pokoje
    { room_number: '101', room_type_name: 'Dvoulůžkový pokoj', floor: 1 },
    { room_number: '102', room_type_name: 'Dvoulůžkový pokoj', floor: 1 },
    { room_number: '103', room_type_name: 'Dvoulůžkový pokoj se dvěma lůžky', floor: 1 },
    { room_number: '104', room_type_name: 'Dvoulůžkový pokoj se dvěma lůžky', floor: 1 },
    // Standardní pokoje
    { room_number: '201', room_type_name: 'Standardní dvoulůžkový pokoj', floor: 2 },
    { room_number: '202', room_type_name: 'Standardní dvoulůžkový pokoj', floor: 2 },
    { room_number: '203', room_type_name: 'Standardní dvoulůžkový pokoj', floor: 2 },
    { room_number: '204', room_type_name: 'Standardní dvoulůžkový pokoj', floor: 2 },
    // Deluxe Suite
    { room_number: '301', room_type_name: 'Deluxe Suite', floor: 3 },
    { room_number: '302', room_type_name: 'Deluxe Suite', floor: 3 },
  ]

  for (const room of rooms) {
    // First get the room type ID
    const { data: roomType } = await supabase
      .from('room_types')
      .select('id')
      .eq('name', room.room_type_name)
      .single()

    if (roomType) {
      const { error: roomError } = await supabase
        .from('rooms')
        .upsert({
          room_number: room.room_number,
          room_type_id: roomType.id,
          floor: room.floor,
          status: 'available',
          is_clean: true
        }, { onConflict: 'room_number' })
      
      if (roomError) {
        console.error(`❌ Error creating room ${room.room_number}:`, roomError)
      } else {
        console.log(`✅ Room ${room.room_number} created`)
      }
    }
  }

  // Seed additional services
  const services = [
    {
      name: 'Snídaně',
      description: 'Bohatá snídaně formou bufetu - džusy, čerstvé pečivo a sýry',
      price: 200,
      currency: 'CZK'
    },
    {
      name: 'Dětská postýlka',
      description: 'Postýlka pro děti 0-3 roky',
      price: 250,
      currency: 'CZK',
      age_restriction: '0-3 roky'
    },
    {
      name: 'Půjčení kola',
      description: 'Půjčení kola na celý den včetně helmy a zámku',
      price: 300,
      currency: 'CZK'
    },
    {
      name: 'Parkování',
      description: 'Bezpečné parkování v uzavřeném dvoře',
      price: 0,
      currency: 'CZK'
    }
  ]

  for (const service of services) {
    const { error: serviceError } = await supabase
      .from('additional_services')
      .upsert(service, { onConflict: 'name' })
    
    if (serviceError) {
      console.error(`❌ Error creating service ${service.name}:`, serviceError)
    } else {
      console.log(`✅ Service ${service.name} created`)
    }
  }

  // Seed nearby attractions
  const attractions = [
    {
      name: 'Znojemský hrad',
      category: 'Historická památka',
      distance_km: 0.5,
      description: 'Historický hrad s nádherným výhledem na město'
    },
    {
      name: 'Znojemské podzemí',
      category: 'Turistická atrakce',
      distance_km: 0.3,
      description: 'Rozsáhlý systém středověkých podzemních chodeb'
    },
    {
      name: 'Vyhlídková radniční věž',
      category: 'Vyhlídka',
      distance_km: 0.2,
      description: 'Výhled na historické centrum města'
    },
    {
      name: 'Rotunda Panny Marie a sv. Kateřiny',
      category: 'Historická památka',
      distance_km: 0.4,
      description: 'Románská rotunda z 11. století'
    },
    {
      name: 'Kostel sv. Michala',
      category: 'Historická památka',
      distance_km: 0.05,
      description: 'Historický kostel přímo u penzionu'
    },
    {
      name: 'Národní park Podyjí',
      category: 'Příroda',
      distance_km: 0.4,
      description: 'Krásná příroda, ideální pro pěší turistiku a cyklistiku'
    },
    {
      name: 'Zámek Vranov nad Dyjí',
      category: 'Historická památka',
      distance_km: 21,
      description: 'Barokní zámek na skále nad řekou Dyjí'
    },
    {
      name: 'Hrad Bítov',
      category: 'Historická památka',
      distance_km: 32,
      description: 'Jeden z nejstarších a nejzachovalejších hradů v ČR'
    }
  ]

  for (const attraction of attractions) {
    const { error: attrError } = await supabase
      .from('nearby_attractions')
      .upsert(attraction, { onConflict: 'name' })
    
    if (attrError) {
      console.error(`❌ Error creating attraction ${attraction.name}:`, attrError)
    } else {
      console.log(`✅ Attraction ${attraction.name} created`)
    }
  }

  console.log('🎉 Pension information seeding completed!')
}

// Run the seed
seedPensionInfo().catch(console.error)
