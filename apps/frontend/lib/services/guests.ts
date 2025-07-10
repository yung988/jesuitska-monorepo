import { 
  getGuests as fetchGuests, 
  getGuest as fetchGuest,
  createGuest as createNewGuest,
  updateGuest as updateExistingGuest,
  findGuestByEmail as findGuestByEmailAddress
} from '../api';

export interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  created_at: string;
}

export interface CreateGuestData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
}

/**
 * Get all guests
 */
export async function getGuests(): Promise<Guest[]> {
  return fetchGuests();
}

/**
 * Get a single guest by ID
 */
export async function getGuest(id: string): Promise<Guest> {
  return fetchGuest(id);
}

/**
 * Create a new guest
 */
export async function createGuest(data: CreateGuestData): Promise<Guest> {
  return createNewGuest(data);
}

/**
 * Update a guest
 */
export async function updateGuest(
  id: string,
  data: Partial<CreateGuestData>
): Promise<Guest> {
  return updateExistingGuest(id, data);
}

/**
 * Find guest by email
 */
export async function findGuestByEmail(email: string): Promise<Guest[]> {
  return findGuestByEmailAddress(email);
}
