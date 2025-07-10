import { 
  getReservations as fetchReservations, 
  getReservation as fetchReservation,
  createReservation as createNewReservation,
  updateReservation as updateExistingReservation,
  cancelReservation as cancelExistingReservation,
  createGuest
} from '../api';

export interface Booking {
  id: string;
  guest_id: string;
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  total_amount: number;
  notes?: string;
  created_at: string;
  guests?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  rooms?: {
    id: string;
    room_number: string;
    room_types?: {
      name: string;
      base_price: number;
    };
  };
}

export interface GuestData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface CreateBookingData {
  guest_id?: string;
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  total_amount: number;
  status?: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  notes?: string;
  guest?: GuestData; // Volitelný parametr pro vytvoření hosta zároveň s rezervací
}

/**
 * Get all bookings
 */
export async function getBookings(): Promise<Booking[]> {
  return fetchReservations();
}

/**
 * Get a single booking by ID
 */
export async function getBooking(id: string): Promise<Booking> {
  return fetchReservation(id);
}

/**
 * Create a new booking
 */
export async function createBooking(data: CreateBookingData): Promise<Booking> {
  // Pokud máme data o hostovi, nejprve vytvoříme hosta
  if (data.guest && !data.guest_id) {
    try {
      const guest = await createGuest(data.guest);
      data.guest_id = guest.id;
    } catch (error) {
      console.error('Error creating guest:', error);
      throw new Error('Nepodařilo se vytvořit hosta');
    }
  }
  
  // Odstraníme objekt guest z dat, protože ho nepotřebujeme poslat do API
  const { guest, ...bookingData } = data;
  
  // Vytvoříme rezervaci
  return createNewReservation(bookingData);
}

/**
 * Update a booking
 */
export async function updateBooking(
  id: string,
  data: Partial<CreateBookingData>
): Promise<Booking> {
  return updateExistingReservation(id, data);
}

/**
 * Cancel a booking
 */
export async function cancelBooking(id: string): Promise<Booking> {
  return cancelExistingReservation(id);
}
