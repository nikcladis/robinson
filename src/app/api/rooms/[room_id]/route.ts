"use server";

import { NextRequest } from "next/server";
import { RoomController } from "@/controllers/room.controller";
import { requireAdmin } from "@/middleware";
import { updateRoomSchema } from "@/validations/room.validation";
import { ApiResponse } from "@/utils/api-response";
import { ValidationError, NotFoundError, AuthorizationError } from "@/errors";

// Define Params type as a Promise
type Params = Promise<{ room_id: string }>;

/**
 * Get a single room by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Params }
) {
  const params = await context.params;
  const room_id = params.room_id;

  return ApiResponse.handle(async () => {
    if (!room_id) {
      throw new ValidationError("Room ID is required");
    }

    const room = await RoomController.getRoomById(room_id);
    if (!room) {
      throw new NotFoundError(`Room with ID ${room_id} not found`);
    }

    // Ensure hotel data is included in the response
    // If for some reason the hotel relation is missing, prevent API from failing
    interface RoomWithHotel {
      id: string;
      roomNumber: string;
      roomType: string;
      price: number;
      capacity: number;
      amenities: string[];
      hotel?: {
        id: string;
        name: string;
        city: string;
        country: string;
      };
    }

    const roomWithHotel = room as RoomWithHotel;
    if (!roomWithHotel.hotel) {
      console.error(`Room ${room_id} found but hotel relation is missing`);
      // Add a placeholder hotel to the response
      roomWithHotel.hotel = {
        id: "unknown",
        name: "Hotel Information Unavailable",
        city: "Unknown",
        country: "Unknown"
      };
    }

    return roomWithHotel;
  }, "Failed to fetch room");
}

/**
 * Update a room by ID
 */
export async function PUT(
  request: NextRequest,
  context: { params: Params }
) {
  const params = await context.params;
  const room_id = params.room_id;

  return ApiResponse.handle(async () => {
    // Check admin authorization
    const authError = await requireAdmin();
    if (authError) {
      throw new AuthorizationError("Admin access required");
    }

    if (!room_id) {
      throw new ValidationError("Room ID is required");
    }

    const body = await request.json();
    const validatedData = updateRoomSchema.safeParse(body);
    
    if (!validatedData.success) {
      throw new ValidationError("Invalid room data", validatedData.error.format());
    }

    // Check if room exists
    const roomExists = await RoomController.roomExists(room_id);
    if (!roomExists) {
      throw new NotFoundError(`Room with ID ${room_id} not found`);
    }

    const updatedRoom = await RoomController.updateRoom(room_id, validatedData.data);
    return updatedRoom;
  }, "Failed to update room");
}

/**
 * Delete a room by ID
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Params }
) {
  const params = await context.params;
  const room_id = params.room_id;

  return ApiResponse.handle(async () => {
    // Check admin authorization
    const authError = await requireAdmin();
    if (authError) {
      throw new AuthorizationError("Admin access required");
    }

    if (!room_id) {
      throw new ValidationError("Room ID is required");
    }

    // Check if room exists
    const roomExists = await RoomController.roomExists(room_id);
    if (!roomExists) {
      throw new NotFoundError(`Room with ID ${room_id} not found`);
    }

    await RoomController.deleteRoom(room_id);
    return { success: true };
  }, "Failed to delete room");
}
