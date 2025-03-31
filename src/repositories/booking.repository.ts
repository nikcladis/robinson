import { getPrismaClientSync } from "@/helpers/prisma";
import { PrismaClient, Booking, BookingStatus, PaymentStatus } from "@prisma/client";
import { ErrorHandler } from "@/utils/error-handler";
import { NotFoundError } from "@/errors";

/**
 * Repository for booking-related database operations
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
   * Retrieves all bookings with optional filtering
   */
  static async getAllBookings(params?: {
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
    fromDate?: Date;
    toDate?: Date;
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Booking[]> {
    try {
      const prisma = await this.getPrisma();
      if (!prisma) throw new Error("Database client not available");

      type WhereClause = {
        status?: BookingStatus;
        paymentStatus?: PaymentStatus;
        userId?: string;
        OR?: Array<{
          checkInDate?: { gte?: Date; lte?: Date };
          checkOutDate?: { gte?: Date; lte?: Date };
        }>;
      };

      const whereClause: WhereClause = {};

      if (params?.status) {
        whereClause.status = params.status;
      }

      if (params?.paymentStatus) {
        whereClause.paymentStatus = params.paymentStatus;
      }

      if (params?.userId) {
        whereClause.userId = params.userId;
      }

      if (params?.fromDate || params?.toDate) {
        whereClause.OR = [
          // Check-in falls between fromDate and toDate
          {
            checkInDate: {
              ...(params?.fromDate && { gte: params.fromDate }),
              ...(params?.toDate && { lte: params.toDate }),
            },
          },
          // Check-out falls between fromDate and toDate
          {
            checkOutDate: {
              ...(params?.fromDate && { gte: params.fromDate }),
              ...(params?.toDate && { lte: params.toDate }),
            },
          },
          // Booking spans over the entire period
          {
            ...(params?.fromDate && {
              checkInDate: { lte: params.fromDate },
            }),
            ...(params?.toDate && {
              checkOutDate: { gte: params.toDate },
            }),
          },
        ];
      }

      return await prisma.booking.findMany({
        where: whereClause,
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
            select: {
              id: true,
              roomNumber: true,
              roomType: true,
              price: true,
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
        take: params?.limit,
        skip: params?.offset,
      });
    } catch (error) {
      return ErrorHandler.handleRepositoryError(error, "getAllBookings");
    }
  }

  /**
   * Retrieves bookings for a specific user
   */
  static async getBookingsByUserId(userId: string): Promise<Booking[]> {
    try {
      const prisma = await this.getPrisma();
      if (!prisma) throw new Error("Database client not available");

      return await prisma.booking.findMany({
        where: { userId },
        include: {
          room: {
            select: {
              id: true,
              roomNumber: true,
              roomType: true,
              price: true,
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
    } catch (error) {
      return ErrorHandler.handleRepositoryError(error, "getBookingsByUserId");
    }
  }

  /**
   * Retrieves a specific booking by ID
   */
  static async getBookingById(id: string): Promise<Booking | null> {
    try {
      const prisma = await this.getPrisma();
      if (!prisma) throw new Error("Database client not available");

      const booking = await prisma.booking.findUnique({
        where: { id },
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
            select: {
              id: true,
              roomNumber: true,
              roomType: true,
              price: true,
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

      return booking;
    } catch (error) {
      return ErrorHandler.handleRepositoryError(error, "getBookingById");
    }
  }

  /**
   * Creates a new booking
   */
  static async createBooking(data: {
    userId: string;
    roomId: string;
    checkInDate: string | Date;
    checkOutDate: string | Date;
    numberOfGuests: number;
    totalPrice: number;
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
    specialRequests?: string;
  }): Promise<Booking> {
    try {
      const prisma = await this.getPrisma();
      if (!prisma) throw new Error("Database client not available");

      // Format dates if they're passed as strings
      const formattedData = {
        ...data,
        checkInDate: typeof data.checkInDate === "string" ? new Date(data.checkInDate) : data.checkInDate,
        checkOutDate: typeof data.checkOutDate === "string" ? new Date(data.checkOutDate) : data.checkOutDate,
        status: data.status || "PENDING",
        paymentStatus: data.paymentStatus || "UNPAID",
      };

      return await prisma.booking.create({
        data: formattedData,
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
            select: {
              id: true,
              roomNumber: true,
              roomType: true,
              price: true,
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
    } catch (error) {
      return ErrorHandler.handleRepositoryError(error, "createBooking");
    }
  }

  /**
   * Updates a booking's status
   */
  static async updateBookingStatus(
    id: string,
    status: BookingStatus
  ): Promise<Booking> {
    try {
      const prisma = await this.getPrisma();
      if (!prisma) throw new Error("Database client not available");

      // Check if booking exists first
      const exists = await prisma.booking.findUnique({ where: { id } });
      if (!exists) {
        throw new NotFoundError(`Booking with ID ${id} not found`);
      }

      return await prisma.booking.update({
        where: { id },
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
            select: {
              id: true,
              roomNumber: true,
              roomType: true,
              price: true,
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
    } catch (error) {
      return ErrorHandler.handleRepositoryError(error, "updateBookingStatus");
    }
  }

  /**
   * Updates a booking's payment status
   */
  static async updateBookingPaymentStatus(
    id: string,
    paymentStatus: PaymentStatus
  ): Promise<Booking> {
    try {
      const prisma = await this.getPrisma();
      if (!prisma) throw new Error("Database client not available");

      // Check if booking exists first
      const exists = await prisma.booking.findUnique({ where: { id } });
      if (!exists) {
        throw new NotFoundError(`Booking with ID ${id} not found`);
      }

      return await prisma.booking.update({
        where: { id },
        data: { paymentStatus },
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
            select: {
              id: true,
              roomNumber: true,
              roomType: true,
              price: true,
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
    } catch (error) {
      return ErrorHandler.handleRepositoryError(error, "updateBookingPaymentStatus");
    }
  }

  /**
   * Deletes a booking
   */
  static async deleteBooking(id: string): Promise<Booking> {
    try {
      const prisma = await this.getPrisma();
      if (!prisma) throw new Error("Database client not available");

      // Check if booking exists first
      const exists = await prisma.booking.findUnique({ where: { id } });
      if (!exists) {
        throw new NotFoundError(`Booking with ID ${id} not found`);
      }

      return await prisma.booking.delete({
        where: { id },
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
            select: {
              id: true,
              roomNumber: true,
              roomType: true,
              price: true,
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
    } catch (error) {
      return ErrorHandler.handleRepositoryError(error, "deleteBooking");
    }
  }

  /**
   * Checks if a booking exists
   */
  static async bookingExists(id: string): Promise<boolean> {
    try {
      const booking = await this.getBookingById(id);
      return !!booking;
    } catch {
      return false;
    }
  }
}
