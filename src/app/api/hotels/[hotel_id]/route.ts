import { NextRequest, NextResponse } from "next/server";
import { HotelController } from "@/controllers/hotel.controller";
import { requireAdmin, handleError } from "@/middleware";
import { updateHotelSchema } from "@/validations/hotel.validation";

export async function GET(
  request: NextRequest,
  { params }: { params: { hotel_id: string } }
) {
  try {
    const hotel_id = params.hotel_id;
    
    if (!hotel_id) {
      return NextResponse.json(
        { error: "Hotel ID is required" },
        { status: 400 }
      );
    }
    
    const hotel = await HotelController.getHotelById(hotel_id);
    return NextResponse.json(hotel);
  } catch (error) {
    return handleError(error, "Failed to fetch hotel");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { hotel_id: string } }
) {
  try {
    // Check admin authorization
    const authError = await requireAdmin();
    if (authError) return authError;

    const hotel_id = params.hotel_id;
    
    if (!hotel_id) {
      return NextResponse.json(
        { error: "Hotel ID is required" },
        { status: 400 }
      );
    }
    
    // Validate request body
    const body = await request.json();
    const validatedBody = updateHotelSchema.parse(body);

    const hotel = await HotelController.updateHotel(hotel_id, validatedBody);
    return NextResponse.json(hotel);
  } catch (error) {
    return handleError(error, "Failed to update hotel");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { hotel_id: string } }
) {
  try {
    // Check admin authorization
    const authError = await requireAdmin();
    if (authError) return authError;

    const hotel_id = params.hotel_id;
    
    if (!hotel_id) {
      return NextResponse.json(
        { error: "Hotel ID is required" },
        { status: 400 }
      );
    }
    
    await HotelController.deleteHotel(hotel_id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleError(error, "Failed to delete hotel");
  }
} 