"use server";

import { NextRequest } from "next/server";
import { HotelController } from "@/controllers/hotel.controller";
import { requireAdmin } from "@/middleware";
import { updateHotelSchema } from "@/validations/hotel.validation";
import { ApiResponse } from "@/utils/api-response";
import { ValidationError, NotFoundError, AuthorizationError } from "@/errors";

// Define Params type as a Promise
type Params = Promise<{ hotel_id: string }>;

/**
 * Get a single hotel by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Params }
) {
  const params = await context.params;
  const hotel_id = params.hotel_id;

  return ApiResponse.handle(async () => {
    if (!hotel_id) {
      throw new ValidationError("Hotel ID is required");
    }

    const hotel = await HotelController.getHotelById(hotel_id);
    
    if (!hotel) {
      throw new NotFoundError(`Hotel with ID ${hotel_id} not found`);
    }
    
    return {
      ...hotel,
      // Ensure these fields are always present with fallbacks
      description: hotel.description || '',
      address: hotel.address || '',
      city: hotel.city || '',
      country: hotel.country || '',
      postalCode: hotel.postalCode || '',
      amenities: Array.isArray(hotel.amenities) ? hotel.amenities : [],
      imageUrl: hotel.imageUrl || ''
    };
  }, "Failed to fetch hotel");
}

/**
 * Update a hotel by ID
 */
export async function PUT(
  request: NextRequest,
  context: { params: Params }
) {
  const params = await context.params;
  const hotel_id = params.hotel_id;

  return ApiResponse.handle(async () => {
    // Check admin authorization
    const authError = await requireAdmin();
    if (authError) {
      throw new AuthorizationError("Admin access required");
    }

    if (!hotel_id) {
      throw new ValidationError("Hotel ID is required");
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedBody = updateHotelSchema.parse(body);

    // Check if hotel exists
    const hotelExists = await HotelController.hotelExists(hotel_id);
    if (!hotelExists) {
      throw new NotFoundError(`Hotel with ID ${hotel_id} not found`);
    }

    const hotel = await HotelController.updateHotel(hotel_id, validatedBody);
    return hotel;
  }, "Failed to update hotel");
}

/**
 * Delete a hotel by ID
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Params }
) {
  const params = await context.params;
  const hotel_id = params.hotel_id;

  return ApiResponse.handle(async () => {
    // Check admin authorization
    const authError = await requireAdmin();
    if (authError) {
      throw new AuthorizationError("Admin access required");
    }

    if (!hotel_id) {
      throw new ValidationError("Hotel ID is required");
    }

    // Check if hotel exists
    const hotelExists = await HotelController.hotelExists(hotel_id);
    if (!hotelExists) {
      throw new NotFoundError(`Hotel with ID ${hotel_id} not found`);
    }

    await HotelController.deleteHotel(hotel_id);
    return { success: true };
  }, "Failed to delete hotel");
}