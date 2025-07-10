# Frontend-Backend Integration Guide

This guide explains how to use the Supabase backend with your Next.js frontend.

## Setup

### 1. Environment Variables

The frontend is already configured to connect to Supabase. The configuration is in:
- `.env.local` - Contains the Supabase URLs and keys
- `lib/supabase.ts` - Base Supabase client configuration
- `lib/api.ts` - API functions for data access
- `lib/services/` - Service files for different data types

### 2. Environment Variables

The following environment variables are configured in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Usage

### Fetching Data

Use the service functions to fetch data from Supabase:

```typescript
import { getRooms } from '@/lib/services/rooms';
import { getBookings } from '@/lib/services/bookings';
import { getGuests } from '@/lib/services/guests';
import { getSettings } from '@/lib/services/settings';

// In your component
const rooms = await getRooms();
const bookings = await getBookings();
```

### Example Component

See `components/rooms-list.tsx` for a complete example of how to use the API services.

### Available Services

1. **Rooms Service** (`lib/services/rooms.ts`)
   - `getRooms()` - Get all rooms
   - `getRoom(id)` - Get a single room
   - `getAvailableRooms(checkIn, checkOut)` - Get available rooms

2. **Bookings Service** (`lib/services/bookings.ts`)
   - `getBookings()` - Get all bookings
   - `getBooking(id)` - Get a single booking
   - `createBooking(data)` - Create a new booking
   - `updateBooking(id, data)` - Update a booking
   - `cancelBooking(id)` - Cancel a booking

3. **Guests Service** (`lib/services/guests.ts`)
   - `getGuests()` - Get all guests
   - `getGuest(id)` - Get a single guest
   - `createGuest(data)` - Create a new guest
   - `updateGuest(id, data)` - Update a guest
   - `findGuestByEmail(email)` - Find guest by email

4. **Settings Service** (`lib/services/settings.ts`)
   - `getSettings()` - Get pension settings

## Troubleshooting

### API Errors
Check:
1. The Supabase project is running
2. The environment variables in `.env.local` are correct
3. The Supabase tables and RLS policies are properly configured

### Authentication
If you need authentication:
1. Use the Supabase auth methods in your application
2. Set up appropriate RLS policies in your Supabase project
3. Use the authenticated client for authenticated requests

## Next Steps

1. Create more components using the service functions
2. Add error handling and loading states
3. Implement caching for better performance
4. Add TypeScript types for better type safety
5. Create custom hooks for data fetching
