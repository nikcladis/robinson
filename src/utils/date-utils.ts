/**
 * Formats a date string or Date object into a human-readable format
 * @param dateString - Date to format (ISO string or Date object)
 * @returns Formatted date string (e.g., "January 1, 2024")
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formats a date string or Date object into a short format
 * @param dateString - Date to format (ISO string or Date object)
 * @returns Formatted date string (e.g., "Jan 1, 2024")
 */
export function formatShortDate(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Calculates the number of nights between two dates
 * @param checkInDate - Check-in date (ISO string or Date object)
 * @param checkOutDate - Check-out date (ISO string or Date object)
 * @returns Number of nights
 */
export function calculateNights(checkInDate: string | Date, checkOutDate: string | Date): number {
  const checkIn = typeof checkInDate === "string" ? new Date(checkInDate) : checkInDate;
  const checkOut = typeof checkOutDate === "string" ? new Date(checkOutDate) : checkOutDate;
  const diffTime = checkOut.getTime() - checkIn.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
} 