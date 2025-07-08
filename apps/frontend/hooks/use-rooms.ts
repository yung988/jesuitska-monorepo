import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { RoomsAPI } from '@shared/api/rooms';
import type { Room } from '@shared/types';

export function useAvailableRooms(checkIn: string | null, checkOut: string | null) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRooms() {
      if (!checkIn || !checkOut) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Použití sdíleného RoomsAPI k načtení dostupných pokojů
        const roomsApi = new RoomsAPI(supabase);
        const availableRooms = await roomsApi.getAvailable(checkIn, checkOut);
        
        setRooms(availableRooms || []);
      } catch (err) {
        setError('Nepodařilo se načíst dostupné pokoje');
        console.error('Error fetching rooms:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRooms();
  }, [checkIn, checkOut]);

  return { rooms, loading, error };
}
