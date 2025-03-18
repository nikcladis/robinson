import { BookingValidator } from "@/validations/booking.validation";
import { BookingRepository } from "@/repositories/booking.repository";
import { Booking } from "@/models";

/**
 * Controller for managing booking-related business logic and flow
 */
export class BookingController {
  /**
   * Retrieves all bookings for a user
   * @param userId - ID of the user
   * @returns Array of user's bookings
   * @throws Error if fetching fails
   */
  static async getUserBookings(userId: string): Promise<Booking[]> {
    return BookingRepository.getUserBookings(userId);
  }

  /**
   * Creates a new booking with validation and business rules
   * @param bookingData - Data for the new booking
   * @returns Created booking or error
   */
  static async createBooking(bookingData: {
    userId: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    totalPrice: number;
  }) {
    // 1. Validate required fields
    const fieldsValidation =
      BookingValidator.validateRequiredFields(bookingData);
    if (!fieldsValidation.isValid) {
      throw new Error(fieldsValidation.errors.join(", "));
    }

    // 2. Validate room availability
    const availabilityValidation =
      await BookingValidator.validateRoomAvailability(
        bookingData.roomId,
        bookingData.checkInDate,
        bookingData.checkOutDate
      );
    if (!availabilityValidation.isValid) {
      throw new Error(availabilityValidation.errors.join(", "));
    }

    // 3. Apply business rules
    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);

    // 3.1 Ensure check-in is not in the past
    if (checkIn < new Date()) {
      throw new Error("Check-in date cannot be in the past");
    }

    // 3.2 Ensure check-out is after check-in
    if (checkOut <= checkIn) {
      throw new Error("Check-out date must be after check-in date");
    }

    // 4. Create the booking
    return BookingRepository.createBooking({
      userId: bookingData.userId,
      roomId: bookingData.roomId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfGuests: bookingData.numberOfGuests,
      totalPrice: bookingData.totalPrice,
    });
  }

  /**
   * Retrieves a specific booking
   * Ensures the booking belongs to the user
   */
  static async getBooking(bookingId: string, userId: string) {
    const booking = await BookingRepository.getBookingById(bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.userId !== userId) {
      throw new Error("Unauthorized access to booking");
    }

    return booking;
  }

  /**
   * Cancels a booking
   * Validates cancellation rules and updates status
   */
  static async cancelBooking(bookingId: string, userId: string) {
    // 1. Get and validate booking
    const booking = await this.getBooking(bookingId, userId);

    // 2. Check if booking can be cancelled
    if (booking.status === "CANCELLED") {
      throw new Error("Booking is already cancelled");
    }

    // 3. Check if booking is in the future
    const now = new Date();
    const checkInDate = new Date(booking.checkInDate);

    if (checkInDate < now) {
      throw new Error("Cannot cancel past or current bookings");
    }

    // 4. Cancel the booking
    return BookingRepository.updateBooking(bookingId, {
      status: "CANCELLED",
      paymentStatus: "REFUNDED",
    });
  }

  /**
   * Calculates the total price for a booking
   * @param roomPrice - Price per night
   * @param checkInDate - Check-in date
   * @param checkOutDate - Check-out date
   * @returns Total price for the stay
   */
  static calculateTotalPrice(
    roomPrice: number,
    checkInDate: string,
    checkOutDate: string
  ): number {
    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);
    const numberOfNights = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return roomPrice * numberOfNights;
  }
}
