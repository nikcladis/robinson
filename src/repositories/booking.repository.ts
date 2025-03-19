import { getPrismaClientSync } from "@/helpers/prisma";
import { Prisma, PrismaClient } from "@prisma/client";
import { DatabaseError } from "@/errors/database.error";

/**
 * Repository for handling booking-related database operations
 */
export class BookingRepository {
  /**
   * Get a Prisma client instance
   * @returns Promise resolving to a Prisma client or null
   */
  private static async getPrisma(): Promise<PrismaClient | null> {
    return await getPrismaClientSync();
  }

  /**
   * Handles database operation errors
   */
  private static handleError(error: unknown, operation: string): never {
    console.error(`Database error during ${operation}:`, error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known Prisma errors
      switch (error.code) {
        case "P2002":
          throw new DatabaseError("Duplicate booking entry");
        case "P2025":
          throw new DatabaseError("Booking not found");
        case "P2003":
          throw new DatabaseError("Invalid reference (room or user not found)");
        default:
          throw new DatabaseError(`Database error: ${error.message}`, error);
      }
    }

    throw new DatabaseError("Unexpected database error", error);
  }

  /**
   * Retrieves all bookings for a specific user
   * @param userId - ID of the user
   * @returns Array of bookings with related data
   */
  static async getUserBookings(userId: string) {
    try {
      const prisma = await this.getPrisma();
      if (!prisma) throw new Error("Database client not available");
      
      return await prisma.booking.findMany({
        where: {
          userId,
        },
        include: {
          room: {
            include: {
              hotel: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      throw new DatabaseError("Failed to get user bookings", error);
    }
  }

  /**
   * Creates a new booking in the database
   * @param bookingData - Data for the new booking
   * @returns Created booking with related data
   */
  static async createBooking(data: {
    userId: string;
    roomId: string;
    checkInDate: Date;
    checkOutDate: Date;
    numberOfGuests: number;
    totalPrice: number;
  }) {
    try {
      const prisma = await this.getPrisma();
      if (!prisma) throw new Error("Database client not available");
      
      return await prisma.booking.create({
        data: {
          userId: data.userId,
          roomId: data.roomId,
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          numberOfGuests: data.numberOfGuests,
          totalPrice: data.totalPrice,
          status: "CONFIRMED",
          paymentStatus: "PAID",
        },
        include: {
          room: {
            include: {
              hotel: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError("Failed to create booking", error);
    }
  }

  /**
   * Gets a specific booking by ID with all related data
   */
  static async getBookingById(bookingId: string) {
    try {
      const prisma = await this.getPrisma();
      if (!prisma) throw new Error("Database client not available");
      
      return await prisma.booking.findUnique({
        where: {
          id: bookingId,
        },
        include: {
          room: {
            include: {
              hotel: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError("Failed to get booking", error);
    }
  }

  /**
   * Updates a booking with new data
   */
  static async updateBooking(
    bookingId: string,
    data: Partial<{
      status: "CONFIRMED" | "CANCELLED";
      paymentStatus: "PAID" | "REFUNDED";
    }>
  ) {
    try {
      const prisma = await this.getPrisma();
      if (!prisma) throw new Error("Database client not available");
      
      return await prisma.booking.update({
        where: {
          id: bookingId,
        },
        data,
        include: {
          room: {
            include: {
              hotel: true,
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError("Failed to update booking", error);
    }
  }

  /**
   * Checks if a room is available for the given dates
   */
  static async checkRoomAvailability(
    roomId: string,
    checkInDate: Date,
    checkOutDate: Date
  ) {
    try {
      const prisma = await this.getPrisma();
      if (!prisma) throw new Error("Database client not available");
      
      const existingBooking = await prisma.booking.findFirst({
        where: {
          roomId,
          status: "CONFIRMED",
          OR: [
            {
              AND: [
                { checkInDate: { lte: checkInDate } },
                { checkOutDate: { gt: checkInDate } },
              ],
            },
            {
              AND: [
                { checkInDate: { lt: checkOutDate } },
                { checkOutDate: { gte: checkOutDate } },
              ],
            },
            {
              AND: [
                { checkInDate: { gte: checkInDate } },
                { checkOutDate: { lte: checkOutDate } },
              ],
            },
          ],
        },
      });

      return !existingBooking;
    } catch (error) {
      throw new DatabaseError("Failed to check room availability", error);
    }
  }
}
