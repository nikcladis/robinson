import { getPrismaClientSync } from "@/helpers/prisma";
import { Prisma, PrismaClient } from "@prisma/client";
import { ErrorHandler } from "@/utils/error-handler";
import { NotFoundError } from "@/errors";

/**
 * Repository for handling hotel-related database operations
 */
export class HotelRepository {
  /**
   * Get a Prisma client instance
   * @returns Promise resolving to a Prisma client or null
   */
  private static async getPrisma(): Promise<PrismaClient | null> {
    return await getPrismaClientSync();
  }

  /**
   * Retrieves all hotels with optional filtering
   */
  static async getAllHotels(params?: {
    city?: string;
    country?: string;
    minRating?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  }) {
    try {
      console.log('Repository getAllHotels called with params:', params);
      const prisma = await this.getPrisma();
      if (!prisma) throw new Error("Database client not available");
      
      const hotels = await prisma.hotel.findMany({
        where: {
          ...(params?.city && { city: params.city }),
          ...(params?.country && { country: params.country }),
          ...(params?.minRating && { starRating: { gte: params.minRating } }),
          ...(params?.maxPrice && {
            rooms: {
              some: {
                price: { lte: params.maxPrice },
              },
            },
          }),
        },
        include: {
          rooms: {
            select: {
              id: true,
              hotelId: true,
              roomNumber: true,
              roomType: true,
              price: true,
              capacity: true,
              available: true,
              amenities: true,
              imageUrl: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          reviews: {
            select: {
              id: true,
              userId: true,
              hotelId: true,
              rating: true,
              comment: true,
              createdAt: true,
              updatedAt: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        take: params?.limit || undefined,
        skip: params?.offset || 0,
      });

      console.log(`Retrieved ${hotels.length} hotels from database`);
      return hotels;
    } catch (error) {
      return ErrorHandler.handleRepositoryError(error, "getAllHotels");
    }
  }

  /**
   * Retrieves a specific hotel by ID
   */
  static async getHotelById(id: string) {
    try {
      const prisma = await this.getPrisma();
      if (!prisma) throw new Error("Database client not available");
      
      const hotel = await prisma.hotel.findUnique({
        where: { id },
        include: {
          rooms: {
            select: {
              id: true,
              hotelId: true,
              roomNumber: true,
              roomType: true,
              price: true,
              available: true,
              capacity: true,
              amenities: true,
              imageUrl: true,
              createdAt: true,
              updatedAt: true,
              bookings: {
                where: {
                  NOT: {
                    status: "CANCELLED",
                  },
                },
                select: {
                  id: true,
                  userId: true,
                  roomId: true,
                  checkInDate: true,
                  checkOutDate: true,
                  numberOfGuests: true,
                  totalPrice: true,
                  status: true,
                  paymentStatus: true,
                  specialRequests: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            },
          },
          reviews: {
            select: {
              id: true,
              userId: true,
              hotelId: true,
              rating: true,
              comment: true,
              createdAt: true,
              updatedAt: true,
              user: {
                select: {
                  id: true,
                  email: true,
                  password: true,
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                  role: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!hotel) {
        throw new NotFoundError(`Hotel with ID ${id} not found`);
      }

      return hotel;
    } catch (error) {
      return ErrorHandler.handleRepositoryError(error, "getHotelById");
    }
  }

  /**
   * Creates a new hotel
   */
  static async createHotel(data: {
    name: string;
    description: string;
    city: string;
    country: string;
    address: string;
    postalCode: string;
    starRating: number;
    amenities?: string[];
    imageUrl?: string;
  }) {
    try {
      const prisma = await this.getPrisma();
      if (!prisma) throw new Error("Database client not available");
      
      return await prisma.hotel.create({
        data,
        include: {
          rooms: true,
        },
      });
    } catch (error) {
      return ErrorHandler.handleRepositoryError(error, "createHotel");
    }
  }

  /**
   * Updates an existing hotel
   */
  static async updateHotel(
    id: string,
    data: {
      name?: string;
      description?: string;
      city?: string;
      country?: string;
      address?: string;
      starRating?: number;
      amenities?: string[];
      imageUrl?: string;
    }
  ) {
    try {
      const prisma = await this.getPrisma();
      if (!prisma) throw new Error("Database client not available");
      
      // Check if hotel exists first
      const exists = await prisma.hotel.findUnique({ where: { id } });
      if (!exists) {
        throw new NotFoundError(`Hotel with ID ${id} not found`);
      }
      
      return await prisma.hotel.update({
        where: { id },
        data,
        include: {
          rooms: true,
        },
      });
    } catch (error) {
      return ErrorHandler.handleRepositoryError(error, "updateHotel");
    }
  }

  /**
   * Deletes a hotel
   */
  static async deleteHotel(id: string) {
    try {
      const prisma = await this.getPrisma();
      if (!prisma) throw new Error("Database client not available");
      
      // Check if hotel exists first
      const exists = await prisma.hotel.findUnique({ where: { id } });
      if (!exists) {
        throw new NotFoundError(`Hotel with ID ${id} not found`);
      }
      
      return await prisma.hotel.delete({
        where: { id },
      });
    } catch (error) {
      return ErrorHandler.handleRepositoryError(error, "deleteHotel");
    }
  }
  
  /**
   * Checks if a hotel exists
   */
  static async hotelExists(id: string): Promise<boolean> {
    try {
      const hotel = await this.getHotelById(id);
      return !!hotel;
    } catch (error) {
      return false;
    }
  }
}
