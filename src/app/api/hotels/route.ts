"use server";

import { NextResponse } from "next/server";
import { HotelController } from "@/controllers/hotel.controller";
import { requireAdmin, handleError } from "@/middleware";
import {
  searchParamsSchema,
  createHotelSchema,
} from "@/validations/hotel.validation";

export async function GET(request: Request) {
  try {
    console.log('API GET /api/hotels called');
    const { searchParams } = new URL(request.url);

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
      Object.entries(parsedParams).filter(([_, v]) => v !== null)
    );
    
    console.log('API GET /api/hotels with params:', params);
    const hotels = await HotelController.getAllHotels(params);
    console.log(`API GET /api/hotels returning ${hotels.length} hotels`);
    return NextResponse.json(hotels);
  } catch (error) {
    console.error('Error in API GET /api/hotels:', error);
    return handleError(error, "Failed to fetch hotels");
  }
}

export async function POST(request: Request) {
  try {
    // Check admin authorization
    const authError = await requireAdmin();
    if (authError) return authError;

    // Validate request body
    const body = await request.json();
    const validatedBody = createHotelSchema.parse(body);

    const hotel = await HotelController.createHotel(validatedBody);
    return NextResponse.json(hotel);
  } catch (error) {
    return handleError(error, "Failed to create hotel");
  }
}
