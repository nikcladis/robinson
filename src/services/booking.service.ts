import { Booking } from "@/models";

/**
 * Parameters for creating a new booking
 * @interface CreateBookingParams
 */
export interface CreateBookingParams {
  /** ID of the room being booked */
  roomId: string;
  /** Check-in date in ISO string format */
  checkInDate: string;
  /** Check-out date in ISO string format */
  checkOutDate: string;
  /** Number of guests for the booking */
  numberOfGuests: number;
  /** Total price for the entire stay */
  totalPrice: number;
}

/**
 * Service class for managing booking-related operations
 * Provides methods for creating, retrieving, and managing bookings,
 * as well as utility functions for formatting and displaying booking information
 */
export class BookingService {
  /**
   * Retrieves a specific booking by its ID
   * @param bookingId - Unique identifier of the booking
   * @returns Promise resolving to the booking details
   * @throws Error if the booking cannot be found or the request fails
   */
  static async getBooking(bookingId: string): Promise<Booking> {
    const response = await fetch(`/api/bookings/${bookingId}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to fetch booking");
    }
    return response.json();
  }

  /**
   * Retrieves all bookings for the current user
   * @returns Promise resolving to an array of bookings
   * @throws Error if the request fails
   */
  static async getAllBookings(): Promise<Booking[]> {
    const response = await fetch("/api/bookings");
    if (!response.ok) {
      throw new Error("Failed to fetch bookings");
    }
    return response.json();
  }

  /**
   * Creates a new booking in the system
   * @param bookingData - Booking details including room, dates, guests, and price
   * @returns Promise resolving to the created booking
   * @throws Error if the booking creation fails
   */
  static async createBooking(
    bookingData: CreateBookingParams
  ): Promise<Booking> {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to create booking");
    }

    return response.json();
  }

  /**
   * Cancels an existing booking
   * @param bookingId - ID of the booking to cancel
   * @returns Promise resolving to the updated booking with cancelled status
   * @throws Error if the cancellation fails
   */
  static async cancelBooking(bookingId: string): Promise<Booking> {
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to cancel booking");
    }

    return response.json();
  }

  /**
   * Checks if a booking can be cancelled
   * A booking is cancellable if:
   * 1. It's not already cancelled
   * 2. The check-in date hasn't passed
   * @param booking - The booking to check
   * @returns Boolean indicating if the booking can be cancelled
   */
  static isBookingCancellable(booking: Booking): boolean {
    return (
      booking.status !== "CANCELLED" &&
      new Date(booking.checkInDate) > new Date()
    );
  }

  /**
   * Formats a date string or Date object into a human-readable format
   * @param dateString - Date to format (ISO string or Date object)
   * @returns Formatted date string (e.g., "January 1, 2024")
   */
  static formatDate(dateString: string | Date): string {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /**
   * Gets the CSS classes for styling a booking status badge
   * @param status - Booking status (CONFIRMED, PENDING, CANCELLED, COMPLETED)
   * @returns CSS classes for the status badge
   */
  static getStatusBadgeClass(status: string): string {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  /**
   * Gets the CSS classes for styling a payment status badge
   * @param status - Payment status (PAID, UNPAID, REFUNDED)
   * @returns CSS classes for the payment status badge
   */
  static getPaymentStatusBadgeClass(status: string): string {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "UNPAID":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }
}
