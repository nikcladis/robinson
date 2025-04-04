import { NextRequest, NextResponse } from "next/server";
import { HotelController } from "@/controllers/hotel.controller";
import { requireAdmin, handleError } from "@/middleware";
import { corsHeaders } from "@/config/cors";
import {
  searchParamsSchema,
  createHotelSchema,
} from "@/validations/hotel.validation";

/**
 * Get all hotels with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    console.log("API GET /api/hotels called with URL:", request.url);
    const { searchParams } = new URL(request.url);

    // Log all search params for debugging
    for (const [key, value] of searchParams.entries()) {
      console.log(`Parameter ${key}:`, value);
    }

    // Validate and parse query parameters
    const parsedParams = searchParamsSchema.parse({
      city: searchParams.get("city"),
      country: searchParams.get("country"),
      minRating: searchParams.get("minRating"),
      maxPrice: searchParams.get("maxPrice"),
      limit: searchParams.get("limit"),
      offset: searchParams.get("offset"),
    });

    // Remove null values
    const params = Object.fromEntries(
      Object.entries(parsedParams).filter(([, v]) => v !== null)
    );

    console.log("API GET /api/hotels with params:", params);
    try {
      const hotels = await HotelController.getAllHotels(params);
      console.log(`API GET /api/hotels returning ${hotels.length} hotels`);
      return NextResponse.json(hotels, {
        headers: corsHeaders,
      });
    } catch (controllerError) {
      console.error(
        "Controller error in API GET /api/hotels:",
        controllerError
      );
      return handleError(
        controllerError,
        "Failed to fetch hotels from controller"
      );
    }
  } catch (error) {
    console.error("Error in API GET /api/hotels:", error);
    return handleError(error, "Failed to fetch hotels");
  }
}

/**
 * Create a new hotel (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    console.log("API POST /api/hotels called");

    // Check admin authorization
    const authError = await requireAdmin();
    if (authError) {
      console.warn("API POST /api/hotels - Unauthorized access attempt");
      return authError;
    }

    // Parse and validate request body
    const body = await request.json();
    console.log(
      "API POST /api/hotels received body:",
      JSON.stringify(body).substring(0, 200) + "..."
    );

    try {
      const validatedBody = createHotelSchema.parse(body);
      const hotel = await HotelController.createHotel(validatedBody);
      console.log(
        `API POST /api/hotels - Hotel created successfully with ID: ${hotel.id}`
      );

      return NextResponse.json(hotel, {
        status: 201,
        headers: corsHeaders,
      });
    } catch (validationError) {
      console.warn("API POST /api/hotels - Validation error:", validationError);
      return handleError(validationError, "Invalid hotel data");
    }
  } catch (error) {
    console.error("Error in API POST /api/hotels:", error);
    return handleError(error, "Failed to create hotel");
  }
}
