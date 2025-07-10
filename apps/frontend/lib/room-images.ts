// Central configuration for room images
// Maps room numbers to their image paths

export const roomImageConfig: Record<string, string[]> = {
  // Pokoj 101
  "101": [
    "/images/rooms/pokoj.png",
    "/images/rooms/koupelna.png",
    "/images/gallery/terasa.png",
  ],
  // Pokoj 102
  "102": [
    "/images/rooms/pokoj.png",
    "/images/rooms/koupelna.png",
    "/images/gallery/balkon.png",
  ],
  // Pokoj 103
  "103": [
    "/images/rooms/pokoj.png",
    "/images/rooms/koupelna.png",
    "/images/hero/hero.png",
  ],
  // Pokoj 201
  "201": [
    "/images/rooms/pokoj.png",
    "/images/rooms/koupelna.png",
    "/images/gallery/terasa.png",
  ],
  // Pokoj 202
  "202": [
    "/images/rooms/pokoj.png",
    "/images/rooms/koupelna.png",
    "/images/gallery/balkon.png",
  ],
  // Pokoj 203
  "203": [
    "/images/rooms/pokoj.png",
    "/images/rooms/koupelna.png",
    "/images/hero/hero.png",
  ],
  // Pokoj 301
  "301": [
    "/images/rooms/pokoj.png",
    "/images/rooms/koupelna.png",
    "/images/gallery/terasa.png",
  ],
  // Pokoj 302
  "302": [
    "/images/rooms/pokoj.png",
    "/images/rooms/koupelna.png",
    "/images/gallery/balkon.png",
  ],
};

// Default images for rooms that don't have specific configuration
export const defaultRoomImages = [
  "/images/rooms/pokoj.png",
  "/images/rooms/koupelna.png",
  "/images/gallery/terasa.png",
  "/images/gallery/balkon.png",
  "/images/hero/hero.png",
];

// Function to get images for a specific room
export function getRoomImages(roomNumber: string): string[] {
  return roomImageConfig[roomNumber] || defaultRoomImages;
}

// Function to get the main image for a room (first image)
export function getRoomMainImage(roomNumber: string): string {
  const images = getRoomImages(roomNumber);
  return images[0] || "/images/rooms/pokoj.png";
}

// Function to get image count for a room
export function getRoomImageCount(roomNumber: string): number {
  return getRoomImages(roomNumber).length;
}
