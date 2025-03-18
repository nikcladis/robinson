"use server";

import { NextResponse } from "next/server";
import { HotelController } from "@/controllers/hotel.controller";
import { requireAdmin, handleError } from "@/middleware";
import {
  searchParamsSchema,
  createHotelSchema,
  updateHotelSchema,
} from "@/validations/hotel.validation";

export async function GET(request: Request) {
  try {
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
      Object.entries(parsedParams).filter(([v]) => v !== null)
    );

    const hotels = await HotelController.getAllHotels(params);
    return NextResponse.json(hotels);
  } catch (error) {
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

export async function PUT(request: Request) {
  try {
    // Check admin authorization
    const authError = await requireAdmin();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Hotel ID is required" },
        { status: 400 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validatedBody = updateHotelSchema.parse(body);

    const hotel = await HotelController.updateHotel(id, validatedBody);
    return NextResponse.json(hotel);
  } catch (error) {
    return handleError(error, "Failed to update hotel");
  }
}

export async function DELETE(request: Request) {
  try {
    // Check admin authorization
    const authError = await requireAdmin();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Hotel ID is required" },
        { status: 400 }
      );
    }

    await HotelController.deleteHotel(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleError(error, "Failed to delete hotel");
  }
}
