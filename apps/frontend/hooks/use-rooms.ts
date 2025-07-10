import { useState, useEffect } from 'react';
import { getAvailableRooms } from '@/lib/api';

export function useAvailableRooms(checkIn: string | null, checkOut: string | null) {
  const [rooms, setRooms] = useState<any[]>([]);
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
        const availableRooms = await getAvailableRooms(checkIn, checkOut);
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
