import { getPrismaClientSync } from "@/helpers/prisma";
import { Booking, PrismaClient, BookingStatus, PaymentStatus } from "@prisma/client";
import { ErrorHandler } from "@/utils/error-handler";
import { DatabaseError, NotFoundError } from "@/errors";
// Note: Formatting functions (formatDate, getStatusBadgeClass, etc.) have been moved to src/utils/format-utils.ts

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
 * Note: UI formatting utilities like formatDate(), getStatusBadgeClass(), etc. 
 * have been moved to src/utils/format-utils.ts
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
  static async getAllBookings(params?: {
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
    fromDate?: Date;
    toDate?: Date;
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Booking[]> {
    return ErrorHandler.wrapAsync(
      async () => {
        const prisma = await BookingService.getPrisma();
        if (!prisma) throw new DatabaseError("Database client not available");
        
        // Build the where clause based on params
        const where: any = {};
        if (params) {
          if (params.status) where.status = params.status;
          if (params.paymentStatus) where.paymentStatus = params.paymentStatus;
          if (params.userId) where.userId = params.userId;
          
          // Date filtering
          if (params.fromDate || params.toDate) {
            where.checkInDate = {};
            if (params.fromDate) where.checkInDate.gte = params.fromDate;
            if (params.toDate) where.checkOutDate = { lte: params.toDate };
          }
        }
        
        const bookings = await prisma.booking.findMany({
          where,
          take: params?.limit,
          skip: params?.offset,
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
      },
      (error) => ErrorHandler.handleServiceError(error, "getAllBookings")
    );
  }

  /**
   * Fetch a single booking by ID with related entities
   */
  static async getBookingById(bookingId: string): Promise<Booking | null> {
    return ErrorHandler.wrapAsync(
      async () => {
        const prisma = await BookingService.getPrisma();
        if (!prisma) throw new DatabaseError("Database client not available");
        
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
      },
      (error) => ErrorHandler.handleServiceError(error, `getBookingById(${bookingId})`)
    );
  }

  /**
   * Update a booking's status
   */
  static async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
    return ErrorHandler.wrapAsync(
      async () => {
        const prisma = await BookingService.getPrisma();
        if (!prisma) throw new DatabaseError("Database client not available");
        
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
      },
      (error) => ErrorHandler.handleServiceError(error, `updateBookingStatus(${bookingId}, ${status})`)
    );
  }

  /**
   * Update a booking's payment status
   */
  static async updateBookingPaymentStatus(bookingId: string, paymentStatus: PaymentStatus): Promise<Booking> {
    return ErrorHandler.wrapAsync(
      async () => {
        const prisma = await BookingService.getPrisma();
        if (!prisma) throw new DatabaseError("Database client not available");
        
        const updated = await prisma.booking.update({
          where: { id: bookingId },
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
      },
      (error) => ErrorHandler.handleServiceError(error, `updateBookingPaymentStatus(${bookingId}, ${paymentStatus})`)
    );
  }

  /**
   * Delete a booking
   */
  static async deleteBooking(bookingId: string): Promise<Booking> {
    return ErrorHandler.wrapAsync(
      async () => {
        const prisma = await BookingService.getPrisma();
        if (!prisma) throw new DatabaseError("Database client not available");
        
        const deleted = await prisma.booking.delete({
          where: { id: bookingId },
        });
        
        return deleted;
      },
      (error) => ErrorHandler.handleServiceError(error, `deleteBooking(${bookingId})`)
    );
  }

  /**
   * Check if a booking exists
   */
  static async bookingExists(bookingId: string): Promise<boolean> {
    try {
      const prisma = await BookingService.getPrisma();
      if (!prisma) throw new DatabaseError("Database client not available");
      
      const count = await prisma.booking.count({
        where: { id: bookingId },
      });
      return count > 0;
    } catch (error) {
      console.error(`Error checking if booking ${bookingId} exists:`, error);
      return false;
    }
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
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
  }): Promise<Booking> {
    return ErrorHandler.wrapAsync(
      async () => {
        const prisma = await BookingService.getPrisma();
        if (!prisma) throw new DatabaseError("Database client not available");
        
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
      },
      (error) => ErrorHandler.handleServiceError(error, "createBooking")
    );
  }

  /**
   * Cancel a booking by setting its status to CANCELLED
   */
  static async cancelBooking(bookingId: string): Promise<Booking> {
    return ErrorHandler.wrapAsync(
      async () => {
        const booking = await BookingService.getBookingById(bookingId);
        if (!booking) {
          throw new NotFoundError(`Booking with ID ${bookingId} not found`);
        }
        
        if (!BookingService.isBookingCancellable(booking)) {
          throw new Error("This booking cannot be cancelled");
        }
        
        return await BookingService.updateBookingStatus(bookingId, "CANCELLED");
      },
      (error) => ErrorHandler.handleServiceError(error, `cancelBooking(${bookingId})`)
    );
  }

  /**
   * Check if a booking can be cancelled
   */
  static isBookingCancellable(booking: Booking): boolean {
    // A booking can only be cancelled if it's in PENDING or CONFIRMED status
    // and it's not in the past
    if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
      return false;
    }
    
    const checkInDate = new Date(booking.checkInDate);
    const now = new Date();
    
    return checkInDate > now;
  }

  /**
   * Fetch bookings for a specific user
   */
  static async getUserBookings(userId: string): Promise<Booking[]> {
    return ErrorHandler.wrapAsync(
      async () => {
        const prisma = await BookingService.getPrisma();
        if (!prisma) throw new DatabaseError("Database client not available");
        
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
      },
      (error) => ErrorHandler.handleServiceError(error, `getUserBookings(${userId})`)
    );
  }

  /**
   * Fetch a single booking by ID for a user
   */
  static async getBooking(bookingId: string): Promise<Booking | null> {
    return ErrorHandler.wrapAsync(
      async () => {
        const prisma = await BookingService.getPrisma();
        if (!prisma) throw new DatabaseError("Database client not available");
        
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
      },
      (error) => ErrorHandler.handleServiceError(error, `getBooking(${bookingId})`)
    );
  }
}
