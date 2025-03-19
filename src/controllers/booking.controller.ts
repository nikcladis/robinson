import { NextRequest, NextResponse } from "next/server";
import { BookingValidator, updateBookingStatusSchema } from "@/validations/booking.validation";
import { BookingService } from "@/services/booking.service";
import { z } from "zod";

/**
 * BookingController handles all booking-related operations in the admin panel
 */
export class BookingController {
  /**
   * Get all bookings with optional filtering
   */
  static async getAllBookings(): Promise<NextResponse> {
    try {
      const bookings = await BookingService.getAllBookings();
      // Serialize to remove any Prisma-specific properties or methods
      return NextResponse.json(JSON.parse(JSON.stringify(bookings)));
    } catch (error) {
      console.error("Error fetching all bookings:", error);
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 }
      );
    }
  }

  /**
   * Get bookings for a specific user
   */
  static async getUserBookings(userId: string): Promise<NextResponse> {
    try {
      if (!userId) {
        return NextResponse.json(
          { error: "User ID is required" },
          { status: 400 }
        );
      }

      const bookings = await BookingService.getUserBookings(userId);
      // Serialize to remove any Prisma-specific properties or methods
      return NextResponse.json(JSON.parse(JSON.stringify(bookings)));
    } catch (error) {
      console.error(`Error fetching bookings for user ${userId}:`, error);
      return NextResponse.json(
        { error: "Failed to fetch user bookings" },
        { status: 500 }
      );
    }
  }

  /**
   * Create a new booking
   */
  static async createBooking(data: {
    userId: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    totalPrice: number;
    status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
    paymentStatus?: "PAID" | "UNPAID" | "REFUNDED";
  }): Promise<any> {
    try {
      // Validate booking data
      const validationResult = BookingValidator.validateCreateBooking(data);
      if (!validationResult.isValid) {
        return NextResponse.json(
          { error: "Invalid booking data", details: validationResult.errors },
          { status: 400 }
        );
      }
      
      console.log("BookingController.createBooking: Validation passed, creating booking");
      
      // Create the booking in the database
      const booking = await BookingService.createBooking(data);
      
      console.log("BookingController.createBooking: Booking created successfully", booking.id);
      
      // Serialize to remove any Prisma-specific properties or methods
      return JSON.parse(JSON.stringify(booking));
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  }

  /**
   * Get a single booking by ID
   */
  static async getBookingById(booking_id: string): Promise<NextResponse> {
    try {
      if (!booking_id) {
        return NextResponse.json(
          { error: "Booking ID is required" },
          { status: 400 }
        );
      }

      const booking = await BookingService.getBookingById(booking_id);

      if (!booking) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      }

      // Serialize to remove any Prisma-specific properties or methods
      return NextResponse.json(JSON.parse(JSON.stringify(booking)));
    } catch (error) {
      console.error(`Error fetching booking ${booking_id}:`, error);
      return NextResponse.json(
        { error: "Failed to fetch booking" },
        { status: 500 }
      );
    }
  }

  /**
   * Update a booking's status
   */
  static async updateBookingStatus(booking_id: string, data: unknown): Promise<NextResponse> {
    try {
      if (!booking_id) {
        return NextResponse.json(
          { error: "Booking ID is required" },
          { status: 400 }
        );
      }

      // Validate the request data
      const validationResult = BookingValidator.validateStatusUpdate(data);
      if (!validationResult.isValid) {
        return NextResponse.json(
          { error: "Invalid booking status", details: validationResult.errors },
          { status: 400 }
        );
      }

      // Check if booking exists
      const bookingExists = await BookingService.bookingExists(booking_id);

      if (!bookingExists) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      }

      // Type assertion is safe here because we've already validated the data
      const typedData = data as z.infer<typeof updateBookingStatusSchema>;

      // Update booking status
      const updatedBooking = await BookingService.updateBookingStatus(booking_id, typedData.status);

      // Serialize to remove any Prisma-specific properties or methods
      return NextResponse.json(JSON.parse(JSON.stringify(updatedBooking)));
    } catch (error) {
      console.error(`Error updating booking ${booking_id}:`, error);
      return NextResponse.json(
        { error: "Failed to update booking status" },
        { status: 500 }
      );
    }
  }

  /**
   * Delete a booking
   */
  static async deleteBooking(booking_id: string): Promise<NextResponse> {
    try {
      if (!booking_id) {
        return NextResponse.json(
          { error: "Booking ID is required" },
          { status: 400 }
        );
      }

      // Check if booking exists
      const bookingExists = await BookingService.bookingExists(booking_id);

      if (!bookingExists) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      }

      // Delete the booking
      await BookingService.deleteBooking(booking_id);

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      console.error(`Error deleting booking ${booking_id}:`, error);
      return NextResponse.json(
        { error: "Failed to delete booking" },
        { status: 500 }
      );
    }
  }
}
