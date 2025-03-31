import { BookingService } from "@/services/booking.service";
import { BookingValidator } from "@/validations/booking.validation";
import { Booking, BookingStatus, PaymentStatus } from "@prisma/client";
import { ErrorHandler } from "@/utils/error-handler";
import { ValidationError, NotFoundError } from "@/errors";

/**
 * Controller for booking-related business logic
 */
export class BookingController {
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
    return ErrorHandler.wrapAsync(
      async () => {
        // Validate filter params if provided
        if (params) {
          const validation = BookingValidator.validateSearchParams(params);
          if (!validation.isValid) {
            throw new ValidationError(validation.errors.join(", "));
          }
        }

        return await BookingService.getAllBookings(params);
      },
      (error) => ErrorHandler.handleControllerError(error, "getAllBookings")
    );
  }

  /**
   * Retrieves bookings for a specific user
   */
  static async getUserBookings(userId: string): Promise<Booking[]> {
    return ErrorHandler.wrapAsync(
      async () => {
        if (!userId) {
          throw new ValidationError("User ID is required");
        }

        return await BookingService.getUserBookings(userId);
      },
      (error) => ErrorHandler.handleControllerError(error, `getUserBookings(${userId})`)
    );
  }

  /**
   * Creates a new booking
   */
  static async createBooking(data: {
    userId: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    totalPrice: number;
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
    specialRequests?: string;
  }): Promise<Booking> {
    return ErrorHandler.wrapAsync(
      async () => {
        // Validate booking data
        const validation = BookingValidator.validateCreateBooking(data);
        if (!validation.isValid) {
          throw new ValidationError(validation.errors.join(", "));
        }
        
        console.log("BookingController.createBooking: Validation passed, creating booking");
        
        // Create the booking using the service
        const booking = await BookingService.createBooking(data);
        
        console.log("BookingController.createBooking: Booking created successfully", booking.id);
        
        return booking;
      },
      (error) => ErrorHandler.handleControllerError(error, "createBooking")
    );
  }

  /**
   * Retrieves a specific booking by ID
   */
  static async getBookingById(bookingId: string): Promise<Booking> {
    return ErrorHandler.wrapAsync(
      async () => {
        if (!bookingId) {
          throw new ValidationError("Booking ID is required");
        }

        const booking = await BookingService.getBookingById(bookingId);

        if (!booking) {
          throw new NotFoundError(`Booking with ID ${bookingId} not found`);
        }

        return booking;
      },
      (error) => ErrorHandler.handleControllerError(error, `getBookingById(${bookingId})`)
    );
  }

  /**
   * Retrieves a booking for a specific user
   */
  static async getBooking(bookingId: string, userId: string): Promise<Booking> {
    return ErrorHandler.wrapAsync(
      async () => {
        if (!bookingId) {
          throw new ValidationError("Booking ID is required");
        }
        
        if (!userId) {
          throw new ValidationError("User ID is required");
        }

        const booking = await BookingService.getBooking(bookingId);

        if (!booking) {
          throw new NotFoundError(`Booking with ID ${bookingId} not found`);
        }

        // Check if the booking belongs to the user
        if (booking.userId !== userId) {
          throw new ValidationError("You don't have permission to view this booking");
        }

        return booking;
      },
      (error) => ErrorHandler.handleControllerError(error, `getBooking(${bookingId}, ${userId})`)
    );
  }

  /**
   * Updates a booking's status
   */
  static async updateBookingStatus(
    bookingId: string,
    status: BookingStatus
  ): Promise<Booking> {
    return ErrorHandler.wrapAsync(
      async () => {
        if (!bookingId) {
          throw new ValidationError("Booking ID is required");
        }

        // Validate the status using the status update validator
        const validation = BookingValidator.validateStatusUpdate({ status });
        if (!validation.isValid) {
          throw new ValidationError(`Invalid booking status: ${status}`);
        }

        // Check if booking exists
        const bookingExists = await BookingService.bookingExists(bookingId);
        if (!bookingExists) {
          throw new NotFoundError(`Booking with ID ${bookingId} not found`);
        }

        return await BookingService.updateBookingStatus(bookingId, status);
      },
      (error) => ErrorHandler.handleControllerError(error, `updateBookingStatus(${bookingId}, ${status})`)
    );
  }

  /**
   * Updates a booking's payment status
   */
  static async updateBookingPaymentStatus(
    bookingId: string,
    paymentStatus: PaymentStatus
  ): Promise<Booking> {
    return ErrorHandler.wrapAsync(
      async () => {
        if (!bookingId) {
          throw new ValidationError("Booking ID is required");
        }

        // Validate using the updateBookingSchema or implementing a separate validator
        if (!["PAID", "UNPAID", "REFUNDED"].includes(paymentStatus)) {
          throw new ValidationError(`Invalid payment status: ${paymentStatus}`);
        }

        // Check if booking exists
        const bookingExists = await BookingService.bookingExists(bookingId);
        if (!bookingExists) {
          throw new NotFoundError(`Booking with ID ${bookingId} not found`);
        }

        return await BookingService.updateBookingPaymentStatus(bookingId, paymentStatus);
      },
      (error) => ErrorHandler.handleControllerError(error, `updateBookingPaymentStatus(${bookingId}, ${paymentStatus})`)
    );
  }

  /**
   * Cancels a booking
   */
  static async cancelBooking(bookingId: string, userId: string): Promise<Booking> {
    return ErrorHandler.wrapAsync(
      async () => {
        if (!bookingId) {
          throw new ValidationError("Booking ID is required");
        }

        // Get the booking to check ownership
        const booking = await BookingService.getBookingById(bookingId);
        if (!booking) {
          throw new NotFoundError(`Booking with ID ${bookingId} not found`);
        }

        // Check if the booking belongs to the user
        if (booking.userId !== userId) {
          throw new ValidationError("You don't have permission to cancel this booking");
        }

        return await BookingService.cancelBooking(bookingId);
      },
      (error) => ErrorHandler.handleControllerError(error, `cancelBooking(${bookingId})`)
    );
  }

  /**
   * Deletes a booking
   */
  static async deleteBooking(bookingId: string): Promise<Booking> {
    return ErrorHandler.wrapAsync(
      async () => {
        if (!bookingId) {
          throw new ValidationError("Booking ID is required");
        }

        // Check if booking exists
        const bookingExists = await BookingService.bookingExists(bookingId);
        if (!bookingExists) {
          throw new NotFoundError(`Booking with ID ${bookingId} not found`);
        }

        return await BookingService.deleteBooking(bookingId);
      },
      (error) => ErrorHandler.handleControllerError(error, `deleteBooking(${bookingId})`)
    );
  }

  /**
   * Checks if a booking exists
   */
  static async bookingExists(bookingId: string): Promise<boolean> {
    try {
      return await BookingService.bookingExists(bookingId);
    } catch {
      return false;
    }
  }
}
