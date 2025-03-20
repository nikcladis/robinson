import { RoomRepository } from "@/repositories/room.repository";
import { Room, RoomType } from "@prisma/client";
import { CreateRoomParams, UpdateRoomParams } from "@/services/room.service";
import { RoomValidator } from "@/validations/room.validation";
import { ErrorHandler } from "@/utils/error-handler";
import { ValidationError, NotFoundError } from "@/errors";

/**
 * Controller for managing room-related business logic and flow in server components
 * This controller handles server-side operations and acts as a bridge between
 * the repository layer and the API routes
 */
export class RoomController {
  /**
   * Retrieves all rooms for a hotel
   */
  static async getRoomsByHotelId(hotelId: string): Promise<Room[]> {
    return ErrorHandler.wrapAsync(
      async () => {
        const rooms = await RoomRepository.getRoomsByHotelId(hotelId);
        return rooms;
      },
      (error) => ErrorHandler.handleControllerError(error, `getRoomsByHotelId(${hotelId})`)
    );
  }

  /**
   * Retrieves a specific room by ID
   */
  static async getRoomById(id: string): Promise<Room | null> {
    return ErrorHandler.wrapAsync(
      async () => {
        const room = await RoomRepository.getRoomById(id);
        return room;
      }, 
      (error) => ErrorHandler.handleControllerError(error, `getRoomById(${id})`)
    );
  }

  /**
   * Creates a new room
   */
  static async createRoom(hotelId: string, data: CreateRoomParams): Promise<Room> {
    return ErrorHandler.wrapAsync(
      async () => {
        // Validate room data
        const validation = RoomValidator.validateRequiredFields(data);
        if (!validation.isValid) {
          throw new ValidationError(validation.errors.join(", "));
        }
        
        // Format data before saving
        const formattedData = {
          ...data,
          roomNumber: data.roomNumber.trim(),
          roomType: data.roomType as RoomType,
          amenities: data.amenities?.filter(a => a.trim()) || [],
          imageUrl: data.imageUrl?.trim(),
        };
        
        const room = await RoomRepository.createRoom(hotelId, formattedData);
        if (!room) {
          throw new Error("Failed to create room");
        }
        return room;
      },
      (error) => ErrorHandler.handleControllerError(error, `createRoom(${hotelId})`)
    );
  }

  /**
   * Updates an existing room
   */
  static async updateRoom(
    id: string,
    data: UpdateRoomParams
  ): Promise<Room> {
    return ErrorHandler.wrapAsync(
      async () => {
        // Validate update data
        const validation = RoomValidator.validateUpdateData(data);
        if (!validation.isValid) {
          throw new ValidationError(validation.errors.join(", "));
        }
        
        // Format data before updating
        const formattedData: any = { ...data };
        if (data.roomNumber) formattedData.roomNumber = data.roomNumber.trim();
        if (data.roomType) formattedData.roomType = data.roomType as RoomType;
        if (data.amenities) formattedData.amenities = data.amenities.filter(a => a.trim());
        if (data.imageUrl !== undefined) {
          formattedData.imageUrl = data.imageUrl === null ? null : data.imageUrl.trim();
        }
        
        const room = await RoomRepository.updateRoom(id, formattedData);
        if (!room) {
          throw new NotFoundError(`Room with ID ${id} not found`);
        }
        return room;
      },
      (error) => ErrorHandler.handleControllerError(error, `updateRoom(${id})`)
    );
  }

  /**
   * Deletes a room
   */
  static async deleteRoom(id: string): Promise<Room> {
    return ErrorHandler.wrapAsync(
      async () => {
        const room = await RoomRepository.deleteRoom(id);
        if (!room) {
          throw new NotFoundError(`Room with ID ${id} not found`);
        }
        return room;
      },
      (error) => ErrorHandler.handleControllerError(error, `deleteRoom(${id})`)
    );
  }

  /**
   * Checks if a room exists
   */
  static async roomExists(id: string): Promise<boolean> {
    try {
      const room = await this.getRoomById(id);
      return !!room;
    } catch (error) {
      return false;
    }
  }
} 