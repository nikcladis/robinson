import { RoomType } from "@prisma/client";
import { ErrorHandler } from "@/utils/error-handler";

/**
 * Parameters for creating a room
 */
export interface CreateRoomParams {
  roomNumber: string;
  roomType: RoomType | string;
  price: number;
  capacity: number;
  available: boolean;
  amenities?: string[];
  imageUrl?: string;
}

/**
 * Parameters for updating a room
 */
export interface UpdateRoomParams {
  roomNumber?: string;
  roomType?: RoomType | string;
  price?: number;
  capacity?: number;
  available?: boolean;
  amenities?: string[];
  imageUrl?: string | null;
}

/**
 * Service for room-related operations
 */
export class RoomService {
  /**
   * Get all rooms for a hotel
   * @param hotelId - ID of the hotel to get rooms for
   * @returns Promise resolving to an array of rooms
   */
  static async getRoomsByHotelId(hotelId: string) {
    return ErrorHandler.wrapAsync(
      async () => {
        const response = await fetch(`/api/hotels/${hotelId}/rooms`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `Failed to fetch rooms for hotel: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result.data;
      },
      (error) => ErrorHandler.handleServiceError(error, `getRoomsByHotelId(${hotelId})`)
    );
  }

  /**
   * Get a single room by ID
   * @param hotelId - ID of the hotel the room belongs to
   * @param roomId - ID of the room to retrieve
   * @returns Promise resolving to the room object
   */
  static async getRoom(hotelId: string, roomId: string) {
    return ErrorHandler.wrapAsync(
      async () => {
        const response = await fetch(`/api/hotels/${hotelId}/rooms/${roomId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `Failed to fetch room: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result.data;
      },
      (error) => ErrorHandler.handleServiceError(error, `getRoom(${hotelId}, ${roomId})`)
    );
  }

  /**
   * Create a new room
   * @param hotelId - ID of the hotel to create the room for
   * @param data - Room data
   * @returns Promise resolving to the created room
   */
  static async createRoom(hotelId: string, data: CreateRoomParams) {
    return ErrorHandler.wrapAsync(
      async () => {
        const response = await fetch(`/api/hotels/${hotelId}/rooms`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `Failed to create room: ${response.statusText}`);
        }

        const result = await response.json();
        return result.data;
      },
      (error) => ErrorHandler.handleServiceError(error, `createRoom(${hotelId})`)
    );
  }

  /**
   * Update an existing room
   * @param hotelId - ID of the hotel the room belongs to
   * @param roomId - ID of the room to update
   * @param data - Updated room data
   * @returns Promise resolving to the updated room
   */
  static async updateRoom(hotelId: string, roomId: string, data: UpdateRoomParams) {
    return ErrorHandler.wrapAsync(
      async () => {
        const response = await fetch(`/api/hotels/${hotelId}/rooms/${roomId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `Failed to update room: ${response.statusText}`);
        }

        const result = await response.json();
        return result.data;
      },
      (error) => ErrorHandler.handleServiceError(error, `updateRoom(${hotelId}, ${roomId})`)
    );
  }

  /**
   * Delete a room
   * @param hotelId - ID of the hotel the room belongs to
   * @param roomId - ID of the room to delete
   * @returns Promise resolving when the room is deleted
   */
  static async deleteRoom(hotelId: string, roomId: string) {
    return ErrorHandler.wrapAsync(
      async () => {
        const response = await fetch(`/api/hotels/${hotelId}/rooms/${roomId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `Failed to delete room: ${response.statusText}`);
        }

        return true;
      },
      (error) => ErrorHandler.handleServiceError(error, `deleteRoom(${hotelId}, ${roomId})`)
    );
  }

  /**
   * Check if a room exists
   * @param hotelId - ID of the hotel the room belongs to
   * @param roomId - ID of the room to check
   * @returns Promise resolving to true if the room exists, false otherwise
   */
  static async roomExists(hotelId: string, roomId: string) {
    try {
      const response = await fetch(`/api/hotels/${hotelId}/rooms/${roomId}`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if a room is available for booking
   * @param roomId - ID of the room to check
   * @param checkInDate - Check-in date
   * @param checkOutDate - Check-out date
   * @returns Promise resolving to true if the room is available, false otherwise
   */
  static async isRoomAvailable(roomId: string, checkInDate: string, checkOutDate: string) {
    return ErrorHandler.wrapAsync(
      async () => {
        const params = new URLSearchParams({
          checkInDate,
          checkOutDate,
        });
        const response = await fetch(`/api/rooms/${roomId}/availability?${params}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `Failed to check room availability: ${response.statusText}`);
        }
        const result = await response.json();
        return result.data.available;
      },
      (error) => ErrorHandler.handleServiceError(error, `isRoomAvailable(${roomId})`)
    );
  }
} 