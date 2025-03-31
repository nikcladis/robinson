import { getPrismaClientSync } from "@/helpers/prisma";
import { Room, PrismaClient, RoomType } from "@prisma/client";
import { ErrorHandler } from "@/utils/error-handler";
import { NotFoundError } from "@/errors";

/**
 * Repository for handling room-related database operations
 */
export class RoomRepository {
  /**
   * Get a Prisma client instance
   * @returns Promise resolving to a Prisma client or null
   */
  private static async getPrisma(): Promise<PrismaClient | null> {
    return await getPrismaClientSync();
  }

  /**
   * Retrieves all rooms for a hotel
   */
  static async getRoomsByHotelId(hotelId: string): Promise<Room[]> {
    try {
      const prisma = await this.getPrisma();
      if (!prisma) throw new Error("Database client not available");
      
      const rooms = await prisma.room.findMany({
        where: { hotelId },
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              city: true,
              country: true,
            },
          },
          bookings: {
            where: {
              NOT: {
                status: "CANCELLED",
              },
            },
          },
        },
      });

      return rooms;
    } catch (error) {
      return ErrorHandler.handleRepositoryError(error, "getRoomsByHotelId");
    }
  }

  /**
   * Retrieves a specific room by ID
   */
  static async getRoomById(id: string): Promise<Room | null> {
    try {
      const prisma = await this.getPrisma();
      if (!prisma) throw new Error("Database client not available");
      
      const room = await prisma.room.findUnique({
        where: { id },
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              city: true,
              country: true,
            },
          },
          bookings: {
            where: {
              NOT: {
                status: "CANCELLED",
              },
            },
          },
        },
      });

      return room;
    } catch (error) {
      return ErrorHandler.handleRepositoryError(error, "getRoomById");
    }
  }

  /**
   * Creates a new room
   */
  static async createRoom(hotelId: string, data: {
    roomNumber: string;
    roomType: string | RoomType;
    price: number;
    capacity: number;
    available: boolean;
    amenities?: string[];
    imageUrl?: string;
  }): Promise<Room> {
    try {
      const prisma = await this.getPrisma();
      if (!prisma) throw new Error("Database client not available");
      
      // Ensure roomType is a valid enum value
      const roomType = data.roomType as RoomType;
      
      return await prisma.room.create({
        data: {
          roomNumber: data.roomNumber,
          roomType: roomType,
          price: data.price,
          capacity: data.capacity,
          available: data.available,
          amenities: data.amenities || [],
          imageUrl: data.imageUrl,
          hotel: {
            connect: { id: hotelId }
          }
        },
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              city: true,
              country: true,
            },
          },
        },
      });
    } catch (error) {
      return ErrorHandler.handleRepositoryError(error, "createRoom");
    }
  }

  /**
   * Updates an existing room
   */
  static async updateRoom(
    id: string,
    data: {
      roomNumber?: string;
      roomType?: string | RoomType;
      price?: number;
      capacity?: number;
      available?: boolean;
      amenities?: string[];
      imageUrl?: string | null;
    }
  ): Promise<Room> {
    try {
      const prisma = await this.getPrisma();
      if (!prisma) throw new Error("Database client not available");
      
      // Check if room exists first
      const exists = await prisma.room.findUnique({ where: { id } });
      if (!exists) {
        throw new NotFoundError(`Room with ID ${id} not found`);
      }
      
      // Handle roomType specifically if it exists in the data
      const updateData = { 
        ...data,
        roomType: data.roomType ? data.roomType as RoomType : undefined
      };
      
      return await prisma.room.update({
        where: { id },
        data: updateData,
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              city: true,
              country: true,
            },
          },
        },
      });
    } catch (error) {
      return ErrorHandler.handleRepositoryError(error, "updateRoom");
    }
  }

  /**
   * Deletes a room
   */
  static async deleteRoom(id: string): Promise<Room> {
    try {
      const prisma = await this.getPrisma();
      if (!prisma) throw new Error("Database client not available");
      
      // Check if room exists first
      const exists = await prisma.room.findUnique({ where: { id } });
      if (!exists) {
        throw new NotFoundError(`Room with ID ${id} not found`);
      }
      
      return await prisma.room.delete({
        where: { id },
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              city: true,
              country: true,
            },
          },
        },
      });
    } catch (error) {
      return ErrorHandler.handleRepositoryError(error, "deleteRoom");
    }
  }
  
  /**
   * Checks if a room exists
   */
  static async roomExists(id: string): Promise<boolean> {
    try {
      const room = await this.getRoomById(id);
      return !!room;
    } catch {
      return false;
    }
  }
} 