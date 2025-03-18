import { z } from "zod";
import { prisma } from "@/helpers/prisma";

// Schema for date validation
const dateSchema = z
  .object({
    checkInDate: z.string().min(1, "Check-in date is required"),
    checkOutDate: z.string().min(1, "Check-out date is required"),
  })
  .refine((data) => new Date(data.checkInDate) < new Date(data.checkOutDate), {
    message: "Check-out date must be after check-in date",
    path: ["checkOutDate"],
  });

// Schema for booking creation
export const createBookingSchema = z
  .object({
    roomId: z.string().min(1, "Room ID is required"),
    checkInDate: z.string().min(1, "Check-in date is required"),
    checkOutDate: z.string().min(1, "Check-out date is required"),
    numberOfGuests: z.number().min(1, "Number of guests must be at least 1"),
    totalPrice: z.number().min(0, "Total price cannot be negative"),
  })
  .refine((data) => new Date(data.checkInDate) < new Date(data.checkOutDate), {
    message: "Check-out date must be after check-in date",
    path: ["checkOutDate"],
  });

type ValidationResult =
  | {
      isValid: true;
    }
  | {
      isValid: false;
      errors: string[];
    };

/**
 * Validator for booking-related operations
 */
export class BookingValidator {
  /**
   * Validates required fields for booking creation
   */
  static validateRequiredFields(
    data: z.infer<typeof createBookingSchema>
  ): ValidationResult {
    try {
      createBookingSchema.parse(data);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map((err) => err.message),
        };
      }
      return {
        isValid: false,
        errors: ["Invalid booking data format"],
      };
    }
  }

  /**
   * Checks if a room is available for the given dates
   */
  static async validateRoomAvailability(
    roomId: string,
    checkInDate: string,
    checkOutDate: string
  ): Promise<ValidationResult> {
    try {
      // Validate dates
      dateSchema.parse({ checkInDate, checkOutDate });

      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          bookings: {
            where: {
              OR: [
                {
                  AND: [
                    { checkInDate: { lte: new Date(checkInDate) } },
                    { checkOutDate: { gt: new Date(checkInDate) } },
                  ],
                },
                {
                  AND: [
                    { checkInDate: { lt: new Date(checkOutDate) } },
                    { checkOutDate: { gte: new Date(checkOutDate) } },
                  ],
                },
              ],
              NOT: {
                status: "CANCELLED",
              },
            },
          },
        },
      });

      if (!room) {
        return {
          isValid: false,
          errors: ["Room not found"],
        };
      }

      if (!room.available) {
        return {
          isValid: false,
          errors: ["Room is not available"],
        };
      }

      if (room.bookings.length > 0) {
        return {
          isValid: false,
          errors: ["Room is already booked for these dates"],
        };
      }

      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map((err) => err.message),
        };
      }
      return {
        isValid: false,
        errors: ["Invalid date format"],
      };
    }
  }
}
