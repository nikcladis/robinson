import { z } from "zod";
import { RoomType } from "@prisma/client";

/**
 * Schema for creating a new room
 */
export const createRoomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  roomType: z.enum(
    ["SINGLE", "DOUBLE", "TWIN", "SUITE", "DELUXE", "PENTHOUSE"] as [string, ...string[]],
    {
      errorMap: () => ({ message: "Invalid room type" }),
    }
  ),
  price: z.number().min(1, "Price must be positive"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  available: z.boolean().default(true),
  amenities: z.array(z.string()).optional().default([]),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

/**
 * Schema for updating a room
 */
export const updateRoomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required").optional(),
  roomType: z.enum(
    ["SINGLE", "DOUBLE", "TWIN", "SUITE", "DELUXE", "PENTHOUSE"] as [string, ...string[]],
    {
      errorMap: () => ({ message: "Invalid room type" }),
    }
  ).optional(),
  price: z.number().min(1, "Price must be positive").optional(),
  capacity: z.number().min(1, "Capacity must be at least 1").optional(),
  available: z.boolean().optional(),
  amenities: z.array(z.string()).optional(),
  imageUrl: z.string().url("Invalid image URL").optional().nullable(),
});

/**
 * Validator class for room related validations
 */
export class RoomValidator {
  /**
   * Validates required fields for room creation
   */
  static validateRequiredFields(data: any): { isValid: boolean; errors: string[] } {
    try {
      createRoomSchema.parse(data);
      return { isValid: true, errors: [] };
    } catch (error) {
      const zodError = error as z.ZodError;
      const errors = zodError.errors.map((e) => e.message);
      return { isValid: false, errors };
    }
  }

  /**
   * Validates data for room updates
   */
  static validateUpdateData(data: any): { isValid: boolean; errors: string[] } {
    try {
      updateRoomSchema.parse(data);
      return { isValid: true, errors: [] };
    } catch (error) {
      const zodError = error as z.ZodError;
      const errors = zodError.errors.map((e) => e.message);
      return { isValid: false, errors };
    }
  }
} 