import { getRooms as fetchRooms, getRoom as fetchRoom, getAvailableRooms as fetchAvailableRooms } from '../api';

export interface Room {
  id: string;
  room_number: string;
  room_type_id: string;
  floor: number;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  room_types?: {
    id: string;
    name: string;
    description?: string;
    base_price: number;
    max_occupancy: number;
    amenities?: string[];
  };
}

/**
 * Get all rooms
 */
export async function getRooms(): Promise<Room[]> {
  return fetchRooms();
}

/**
 * Get a single room by ID
 */
export async function getRoom(id: string): Promise<Room> {
  return fetchRoom(id);
}

/**
 * Get available rooms for a date range
 */
export async function getAvailableRooms(
  checkIn: string,
  checkOut: string
): Promise<Room[]> {
  return fetchAvailableRooms(checkIn, checkOut);
}
