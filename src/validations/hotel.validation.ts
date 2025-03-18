import { z } from "zod";

// Base hotel schema with common fields
const baseHotelSchema = z.object({
  name: z.string().min(1, "Hotel name is required").trim(),
  description: z.string().min(1, "Hotel description is required").trim(),
  city: z.string().min(1, "City is required").trim(),
  country: z.string().min(1, "Country is required").trim(),
  address: z.string().min(1, "Address is required").trim(),
  postalCode: z.string().min(1, "Postal code is required").trim(),
  starRating: z
    .number()
    .min(1, "Star rating must be at least 1")
    .max(5, "Star rating must be at most 5"),
  amenities: z.array(z.string()).optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

// Schema for creating a new hotel
export const createHotelSchema = baseHotelSchema;

// Schema for updating a hotel (all fields optional)
export const updateHotelSchema = baseHotelSchema.partial();

// Schema for hotel search parameters
export const searchParamsSchema = z.object({
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  minRating: z.coerce.number().min(1).max(5).nullable().optional(),
  maxPrice: z.coerce.number().min(0).nullable().optional(),
  limit: z.coerce.number().min(1).max(100).nullable().optional(),
  offset: z.coerce.number().min(0).nullable().optional(),
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
 * Validator for hotel-related operations
 */
export class HotelValidator {
  /**
   * Validates required fields for hotel creation
   */
  static validateRequiredFields(
    data: z.infer<typeof createHotelSchema>
  ): ValidationResult {
    try {
      createHotelSchema.parse(data);
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
   * Validates hotel search parameters
   */
  static validateSearchParams(
    params: z.infer<typeof searchParamsSchema>
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
   * Validates hotel update data
   */
  static validateUpdateData(
    data: z.infer<typeof updateHotelSchema>
  ): ValidationResult {
    try {
      updateHotelSchema.parse(data);
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
        errors: ["Invalid update data"],
      };
    }
  }
}
