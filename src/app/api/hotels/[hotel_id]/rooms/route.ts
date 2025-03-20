"use server";

import { NextRequest } from "next/server";
import { RoomController } from "@/controllers/room.controller";
import { HotelController } from "@/controllers/hotel.controller";
import { requireAdmin } from "@/middleware";
import { createRoomSchema } from "@/validations/room.validation";
import { ApiResponse } from "@/utils/api-response";
import { ValidationError, NotFoundError, AuthorizationError } from "@/errors";

/**
 * Get all rooms for a hotel
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { hotel_id: string } }
) {
  const { hotel_id } = params;
  
  return ApiResponse.handle(async () => {
    console.log(`API GET /api/hotels/${hotel_id}/rooms called`);

    if (!hotel_id) {
      throw new ValidationError("Hotel ID is required");
    }

    // Check if hotel exists
    const hotelExists = await HotelController.hotelExists(hotel_id);
    if (!hotelExists) {
      throw new NotFoundError(`Hotel with ID ${hotel_id} not found`);
    }

    const rooms = await RoomController.getRoomsByHotelId(hotel_id);
    console.log(`API GET /api/hotels/${hotel_id}/rooms returning ${rooms.length} rooms`);
    
    return rooms;
  }, "Failed to fetch rooms");
}

/**
 * Create a new room for a hotel
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { hotel_id: string } }
) {
  const { hotel_id } = params;
  
  return ApiResponse.handle(async () => {
    console.log(`API POST /api/hotels/${hotel_id}/rooms called`);
    
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

    // Parse and validate request body
    const body = await request.json();
    const validatedBody = createRoomSchema.parse(body);
    
    // Create the room
    const room = await RoomController.createRoom(hotel_id, validatedBody);
    console.log(`API POST /api/hotels/${hotel_id}/rooms - Room created successfully with ID: ${room.id}`);
    
    // Return created response with the new room
    return ApiResponse.created(room);
  }, "Failed to create room");
} 