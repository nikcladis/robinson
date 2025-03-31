"use server";

import { NextRequest } from "next/server";
import { RoomController } from "@/controllers/room.controller";
import { requireAdmin } from "@/middleware";
import { updateRoomSchema } from "@/validations/room.validation";
import { ApiResponse } from "@/utils/api-response";
import { ValidationError, NotFoundError, AuthorizationError } from "@/errors";

// Define params as a Promise type
type Params = Promise<{ hotel_id: string; room_id: string }>;

/**
 * Get a single room by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Params }
) {
  // Await the params
  const params = await context.params;
  const { hotel_id, room_id } = params;
  
  return ApiResponse.handle(async () => {
    console.log(`API GET /api/hotels/${hotel_id}/rooms/${room_id} called`);

    if (!hotel_id || !room_id) {
      throw new ValidationError("Hotel ID and Room ID are required");
    }

    // Check if room exists
    const roomExists = await RoomController.roomExists(room_id);
    if (!roomExists) {
      throw new NotFoundError(`Room with ID ${room_id} not found`);
    }

    return await RoomController.getRoomById(room_id);
  }, "Failed to fetch room");
}

/**
 * Update a room
 */
export async function PUT(
  request: NextRequest,
  context: { params: Params }
) {
  // Await the params
  const params = await context.params;
  const { hotel_id, room_id } = params;
  
  return ApiResponse.handle(async () => {
    console.log(`API PUT /api/hotels/${hotel_id}/rooms/${room_id} called`);
    
    // Check admin authorization
    const authError = await requireAdmin();
    if (authError) {
      throw new AuthorizationError("Admin access required");
    }

    if (!hotel_id || !room_id) {
      throw new ValidationError("Hotel ID and Room ID are required");
    }

    // Check if room exists
    const roomExists = await RoomController.roomExists(room_id);
    if (!roomExists) {
      throw new NotFoundError(`Room with ID ${room_id} not found`);
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedBody = updateRoomSchema.parse(body);
    
    // Handle null imageUrl correctly
    const updateData = {
      ...validatedBody,
      imageUrl: validatedBody.imageUrl === null ? null : validatedBody.imageUrl
    };

    const room = await RoomController.updateRoom(room_id, updateData);
    console.log(`API PUT /api/hotels/${hotel_id}/rooms/${room_id} - Room updated successfully`);
    
    return room;
  }, "Failed to update room");
}

/**
 * Delete a room
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Params }
) {
  // Await the params
  const params = await context.params;
  const { hotel_id, room_id } = params;
  
  return ApiResponse.handle(async () => {
    console.log(`API DELETE /api/hotels/${hotel_id}/rooms/${room_id} called`);
    
    // Check admin authorization
    const authError = await requireAdmin();
    if (authError) {
      throw new AuthorizationError("Admin access required");
    }

    if (!hotel_id || !room_id) {
      throw new ValidationError("Hotel ID and Room ID are required");
    }

    // Check if room exists 
    const roomExists = await RoomController.roomExists(room_id);
    if (!roomExists) {
      throw new NotFoundError(`Room with ID ${room_id} not found`);
    }
    
    const room = await RoomController.deleteRoom(room_id);
    if (!room) {
      throw new Error(`Failed to delete room with ID ${room_id}`);
    }
    
    console.log(`API DELETE /api/hotels/${hotel_id}/rooms/${room_id} - Room deleted successfully`);
    return { success: true };
  }, "Failed to delete room");
} 