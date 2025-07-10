'use client';

import { useEffect, useState } from 'react';
import { getRooms } from '@/lib/services/rooms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { getRoomMainImage } from '@/lib/room-images';

// Define room type based on the API response
interface Room {
  id: string;
  room_number: string;
  status: string;
  floor: number;
  room_types?: {
    id: string;
    name: string;
    description?: string;
    base_price: number;
    max_occupancy: number;
    amenities?: string[];
  };
}

export function RoomsList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const response = await getRooms();
        setRooms(response);
      } catch (err) {
        setError('Nepodařilo se načíst pokoje');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRooms();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Žádné pokoje nejsou k dispozici</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map((room) => (
        <Card key={room.id} className="hover:shadow-lg transition-shadow">
          <div className="relative h-48 w-full">
            <Image 
              src={getRoomMainImage(room.room_number)} 
              alt={`Pokoj ${room.room_number}`}
              fill
              className="object-cover"
            />
          </div>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Pokoj {room.room_number}</CardTitle>
                {room.room_types?.name && <CardDescription>{room.room_types.name}</CardDescription>}
              </div>
              <Badge variant="secondary">Patro {room.floor}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Kapacita: {room.room_types?.max_occupancy || 0} {room.room_types?.max_occupancy === 1 ? 'osoba' : (room.room_types?.max_occupancy || 0) < 5 ? 'osoby' : 'osob'}
              </p>
              <p className="text-lg font-semibold">
                {room.room_types?.base_price || 0} Kč / noc
              </p>
              {room.room_types?.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {room.room_types.description}
                </p>
              )}
              {room.room_types?.amenities && room.room_types.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {room.room_types.amenities.slice(0, 3).map((amenity, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                  {room.room_types.amenities.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{room.room_types.amenities.length - 3} další
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
