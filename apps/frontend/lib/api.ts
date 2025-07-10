import { supabase } from './supabase';

// Define types locally based on the shared package
interface Room {
  id: string
  room_number: string
  room_type_id: string
  floor: number
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance'
  room_types?: RoomType
}

interface RoomType {
  id: string
  name: string
  description?: string
  base_price: number  // mapped from price_per_night
  max_occupancy: number  // mapped from capacity
  amenities?: string[]
}

interface Guest {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  created_at: string
}

interface Reservation {
  id: string
  guest_id: string
  room_id: string
  check_in_date: string
  check_out_date: string
  adults: number
  children: number
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'
  total_amount: number
  notes?: string
  created_at: string
  guests?: Guest
  rooms?: Room
}

/**
 * Rooms API
 */
export async function getRooms() {
  const { data, error } = await supabase
    .from('rooms')
    .select(`
      id,
      room_number,
      floor,
      status,
      room_types (
        id,
        name,
        description,
        base_price:price_per_night,
        max_occupancy:capacity,
        amenities
      )
    `)
    .order('room_number', { ascending: true });
  
  if (error) {
    console.error("Error fetching rooms:", error);
    throw error;
  }
  return data;
}

export async function getRoom(id: string) {
  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      room_types (*)
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getAvailableRooms(checkIn: string, checkOut: string) {
  // First get all rooms
  const { data: allRooms, error: roomsError } = await supabase
    .from('rooms')
    .select(`
      id,
      room_number,
      floor,
      status,
      room_types (
        id,
        name,
        description,
        base_price:price_per_night,
        max_occupancy:capacity,
        amenities
      )
    `)
    .eq('status', 'available');
  
  if (roomsError) {
    console.error("Error fetching all rooms for availability check:", roomsError);
    throw roomsError;
  }

  // Then get occupied rooms for the date range
  const { data: occupiedRooms, error: reservationsError } = await supabase
    .from('reservations')
    .select('room_id')
    .lte('check_in_date', checkOut)
    .gte('check_out_date', checkIn)
    .not('status', 'eq', 'cancelled');
  
  if (reservationsError) throw reservationsError;

  console.log('All rooms:', allRooms?.length);
  console.log('Occupied rooms:', occupiedRooms?.length);
  console.log('Occupied room IDs:', occupiedRooms?.map(r => r.room_id));

  const occupiedRoomIds = occupiedRooms?.map(r => r.room_id) || [];
  const availableRooms = allRooms?.filter(room => !occupiedRoomIds.includes(room.id)) || [];
  
  console.log('Available rooms:', availableRooms.length);
  return availableRooms;
}

/**
 * Bookings/Reservations API
 */
export async function getReservations() {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      guests (*),
      rooms (*)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getReservation(id: string) {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      guests (*),
      rooms (*)
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createReservation(reservation: Partial<Reservation>) {
  const { data, error } = await supabase
    .from('reservations')
    .insert(reservation)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateReservation(id: string, reservation: Partial<Reservation>) {
  const { data, error } = await supabase
    .from('reservations')
    .update(reservation)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function cancelReservation(id: string) {
  return updateReservation(id, { status: 'cancelled' });
}

/**
 * Guests API
 */
export async function getGuests() {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .order('last_name', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function getGuest(id: string) {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createGuest(guest: Partial<Guest>) {
  const { data, error } = await supabase
    .from('guests')
    .insert(guest)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateGuest(id: string, guest: Partial<Guest>) {
  const { data, error } = await supabase
    .from('guests')
    .update(guest)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function findGuestByEmail(email: string) {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('email', email);
  
  if (error) throw error;
  return data;
}

/**
 * Settings/Pension Info API
 */
export async function getPensionInfo() {
  const { data, error } = await supabase
    .from('pension_info')
    .select('*')
    .single();
  
  if (error) throw error;
  return data;
}
