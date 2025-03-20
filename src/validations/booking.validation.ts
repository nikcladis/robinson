import { z } from "zod";
import { getPrismaClientSync } from "@/helpers/prisma";

// ==========================================
// Schema Definitions
// ==========================================

/**
 * Schema for date validation
 */
export const dateSchema = z
  .object({
    checkInDate: z.string().min(1, "Check-in date is required"),
    checkOutDate: z.string().min(1, "Check-out date is required"),
  })
  .refine((data) => new Date(data.checkInDate) < new Date(data.checkOutDate), {
    message: "Check-out date must be after check-in date",
    path: ["checkOutDate"],
  });

/**
 * Base booking schema with common fields
 */
const baseBookingSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  roomId: z.string().min(1, "Room ID is required"),
  checkInDate: z.string().min(1, "Check-in date is required"),
  checkOutDate: z.string().min(1, "Check-out date is required"),
  numberOfGuests: z.number().min(1, "Number of guests must be at least 1"),
  totalPrice: z.number().min(1, "Total price must be positive"),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"], {
    errorMap: () => ({ message: "Invalid booking status" })
  }).optional(),
  paymentStatus: z.enum(["PAID", "UNPAID", "REFUNDED"], {
    errorMap: () => ({ message: "Invalid payment status" })
  }).optional()
});

/**
 * Schema for creating a new booking
 */
export const createBookingSchema = baseBookingSchema;

/**
 * Schema for updating a booking (all fields optional)
 */
export const updateBookingSchema = baseBookingSchema.partial();

/**
 * Schema for just updating booking status
 */
export const updateBookingStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"], {
    errorMap: () => ({ message: "Invalid booking status" })
  })
});

/**
 * Schema for booking search parameters
 */
export const searchParamsSchema = z.object({
  userId: z.string().optional(),
  roomId: z.string().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
});

// ==========================================
// Form Data & Utilities
// ==========================================

/**
 * Helper function for handling Zod validation in forms and API requests
 * 
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns Object with validation result and field-specific error messages
 */
export const validateBookingData = <T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { isValid: boolean; errors: Record<string, string> } => {
  try {
    schema.parse(data);
    return { isValid: true, errors: {} };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      err.errors.forEach(error => {
        if (error.path[0]) {
          errors[error.path[0].toString()] = error.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { _form: "Invalid data format" } };
  }
};

// ==========================================
// Validator Class for API Validation
// ==========================================

/**
 * Type definition for validation results used by the API
 */
type ValidationResult =
  | { isValid: true }
  | { isValid: false; errors: string[] };

/**
 * Validator class for booking-related operations in the API
 */
export class BookingValidator {
  /**
   * Get Prisma client
   */
  private static async getPrisma() {
    return await getPrismaClientSync();
  }

  /**
   * Validates required fields for booking creation
   * 
   * @param data - The booking data to validate
   * @returns Validation result with array of errors if invalid
   */
  static validateCreateBooking(
    data: unknown
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
        errors: ["Invalid data format"],
      };
    }
  }

  /**
   * Validates booking search parameters
   * 
   * @param params - The search parameters to validate
   * @returns Validation result with array of errors if invalid
   */
  static validateSearchParams(
    params: unknown
  ): ValidationResult {
    try {
      searchParamsSchema.parse(params);
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
        errors: ["Invalid search parameters"],
      };
    }
  }

  /**
   * Validates booking status update
   * 
   * @param data - The booking status data to validate
   * @returns Validation result with array of errors if invalid
   */
  static validateStatusUpdate(
    data: unknown
  ): ValidationResult {
    try {
      updateBookingStatusSchema.parse(data);
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
        errors: ["Invalid booking status"],
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

      const prisma = await this.getPrisma();
      if (!prisma) {
        return {
          isValid: false,
          errors: ["Database client not available"],
        };
      }

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
        errors: ["Failed to validate room availability"],
      };
    }
  }
}
