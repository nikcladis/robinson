/**
 * Utility functions for formatting and displaying data
 */

/**
 * Formats a date string for display
 * @param dateString Date to format (ISO string or Date object)
 * @returns Formatted date string
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a number as a price in USD
 * @param price Number to format as currency
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

/**
 * Gets the appropriate CSS class for a booking status badge
 * @param status Booking status
 * @returns CSS class string
 */
export function getStatusBadgeClass(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
  };
  
  return statusMap[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Gets the appropriate CSS class for a payment status badge
 * @param status Payment status
 * @returns CSS class string
 */
export function getPaymentStatusBadgeClass(status: string): string {
  const statusMap: Record<string, string> = {
    PAID: 'bg-green-100 text-green-800',
    UNPAID: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-blue-100 text-blue-800',
  };
  
  return statusMap[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Gets the icon identifier for an amenity
 * @param amenity Amenity code
 * @returns Icon identifier
 */
export function getAmenityIcon(amenity: string): string {
  const icons: Record<string, string> = {
    WIFI: "wifi",
    POOL: "pool",
    SPA: "spa",
    GYM: "gym",
    RESTAURANT: "restaurant",
    PARKING: "parking",
    ROOM_SERVICE: "room-service",
    BAR: "bar",
    AIR_CONDITIONING: "ac",
    LAUNDRY: "laundry",
  };
  return icons[amenity] || "default";
}

/**
 * Gets the human-readable label for an amenity
 * @param amenity Amenity code
 * @returns Human-readable label
 */
export function getAmenityLabel(amenity: string): string {
  const labels: Record<string, string> = {
    WIFI: "Wi-Fi",
    POOL: "Swimming Pool",
    SPA: "Spa & Wellness",
    GYM: "Fitness Center",
    RESTAURANT: "Restaurant",
    PARKING: "Parking",
    ROOM_SERVICE: "Room Service",
    BAR: "Bar/Lounge",
    AIR_CONDITIONING: "Air Conditioning",
    LAUNDRY: "Laundry Service",
  };
  return labels[amenity] || amenity;
}

/**
 * Gets the human-readable label for a room type
 * @param type Room type code
 * @returns Human-readable label
 */
export function getRoomTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    STANDARD: "Standard Room",
    DELUXE: "Deluxe Room",
    SUITE: "Suite",
    EXECUTIVE: "Executive Suite",
    FAMILY: "Family Room",
  };
  return labels[type] || type;
}

/**
 * Calculates the number of nights between two dates
 * @param checkIn Check-in date (ISO string or Date object)
 * @param checkOut Check-out date (ISO string or Date object)
 * @returns Number of nights
 */
export function calculateNights(checkIn: string | Date, checkOut: string | Date): number {
  const start = typeof checkIn === 'string' ? new Date(checkIn) : checkIn;
  const end = typeof checkOut === 'string' ? new Date(checkOut) : checkOut;
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculates the total price for a stay
 * @param pricePerNight Price per night
 * @param checkIn Check-in date
 * @param checkOut Check-out date
 * @returns Total price for the stay
 */
export function calculateTotalPrice(
  pricePerNight: number, 
  checkIn: Date, 
  checkOut: Date
): number {
  const nights = calculateNights(checkIn, checkOut);
  return pricePerNight * nights;
} 