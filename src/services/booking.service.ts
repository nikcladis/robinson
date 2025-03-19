import { getPrismaClientSync } from "@/helpers/prisma";
import { Booking, PrismaClient } from "@prisma/client";

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
 * BookingService handles database operations and business logic for bookings
 */
export class BookingService {
  /**
   * Get a Prisma client instance
   * @returns Promise resolving to a Prisma client or null
   */
  private static async getPrisma(): Promise<PrismaClient | null> {
    return await getPrismaClientSync();
  }

  /**
   * Fetch all bookings with related entities
   */
  static async getAllBookings() {
    const prisma = await BookingService.getPrisma();
    if (!prisma) throw new Error("Database client not available");
    
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        room: {
          include: {
            hotel: {
              select: {
                id: true,
                name: true,
                city: true,
                country: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    // Convert Prisma model instances to plain objects
    return JSON.parse(JSON.stringify(bookings));
  }

  /**
   * Fetch a single booking by ID with related entities
   */
  static async getBookingById(bookingId: string) {
    const prisma = await BookingService.getPrisma();
    if (!prisma) throw new Error("Database client not available");
    
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        room: {
          include: {
            hotel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    
    if (!booking) return null;
    
    // Convert Prisma model instance to plain object
    return JSON.parse(JSON.stringify(booking));
  }

  /**
   * Update a booking's status
   */
  static async updateBookingStatus(bookingId: string, status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED") {
    const prisma = await BookingService.getPrisma();
    if (!prisma) throw new Error("Database client not available");
    
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        room: {
          include: {
            hotel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    
    // Convert Prisma model instance to plain object
    return JSON.parse(JSON.stringify(updated));
  }

  /**
   * Delete a booking
   */
  static async deleteBooking(bookingId: string) {
    const prisma = await BookingService.getPrisma();
    if (!prisma) throw new Error("Database client not available");
    
    return prisma.booking.delete({
      where: { id: bookingId },
    });
  }

  /**
   * Check if a booking exists
   */
  static async bookingExists(bookingId: string) {
    const prisma = await BookingService.getPrisma();
    if (!prisma) throw new Error("Database client not available");
    
    const count = await prisma.booking.count({
      where: { id: bookingId },
    });
    return count > 0;
  }

  /**
   * Calculate nights between two dates
   */
  static calculateNights(checkInDate: string, checkOutDate: string): number {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Creates a new booking in the database
   * @param bookingData - Booking details including userId, roomId, dates, guests, and price
   * @returns Promise resolving to the created booking
   * @throws Error if the booking creation fails
   */
  static async createBooking(data: {
    userId: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    totalPrice: number;
    specialRequests?: string;
    status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
    paymentStatus?: "PAID" | "UNPAID" | "REFUNDED";
  }): Promise<Booking> {
    const prisma = await BookingService.getPrisma();
    if (!prisma) throw new Error("Database client not available");
    
    try {
      console.log("BookingService.createBooking called with:", JSON.stringify(data));
      
      // Create the booking with PENDING status by default
      const booking = await prisma.booking.create({
        data: {
          userId: data.userId,
          roomId: data.roomId,
          checkInDate: new Date(data.checkInDate),
          checkOutDate: new Date(data.checkOutDate),
          numberOfGuests: data.numberOfGuests,
          totalPrice: data.totalPrice,
          specialRequests: data.specialRequests || "",
          status: data.status || "PENDING", // Use provided status or default to PENDING
          paymentStatus: data.paymentStatus || "UNPAID", // Use provided payment status or default to UNPAID
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          room: {
            include: {
              hotel: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                  country: true,
                },
              },
            },
          },
        },
      });
      
      console.log("Booking created successfully:", booking.id);
      
      // Convert to plain object to avoid Prisma serialization issues
      return JSON.parse(JSON.stringify(booking));
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
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

  /**
   * Fetch bookings for a specific user
   */
  static async getUserBookings(userId: string) {
    const prisma = await BookingService.getPrisma();
    if (!prisma) throw new Error("Database client not available");
    
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        room: {
          include: {
            hotel: {
              select: {
                id: true,
                name: true,
                city: true,
                country: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    // Convert Prisma model instances to plain objects
    return JSON.parse(JSON.stringify(bookings));
  }

  /**
   * Fetch a single booking by ID for a user
   */
  static async getBooking(bookingId: string) {
    const prisma = await BookingService.getPrisma();
    if (!prisma) throw new Error("Database client not available");
    
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        room: {
          include: {
            hotel: {
              select: {
                id: true,
                name: true,
                city: true,
                country: true,
              },
            },
          },
        },
      },
    });
    
    if (!booking) return null;
    
    // Convert Prisma model instance to plain object
    return JSON.parse(JSON.stringify(booking));
  }
}
