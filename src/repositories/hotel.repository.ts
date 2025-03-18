import { prisma } from "@/helpers/prisma";
import { Prisma } from "@prisma/client";
import { DatabaseError } from "@/errors/database.error";

/**
 * Repository for handling hotel-related database operations
 */
export class HotelRepository {
  /**
   * Handles database operation errors
   */
  private static handleError(error: unknown, operation: string): never {
    console.error(`Database error during ${operation}:`, error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002":
          throw new DatabaseError("Hotel with this name already exists");
        case "P2025":
          throw new DatabaseError("Hotel not found");
        default:
          throw new DatabaseError(`Database error: ${error.message}`, error);
      }
    }

    throw new DatabaseError("Unexpected database error", error);
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
      console.error('Error in getAllHotels repository method:', error);
      throw error;
    }
  }

  /**
   * Retrieves a specific hotel by ID
   */
  static async getHotelById(id: string) {
    try {
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
        throw new DatabaseError("Hotel not found");
      }

      return hotel;
    } catch (error) {
      return this.handleError(error, "getHotelById");
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
      return await prisma.hotel.create({
        data,
        include: {
          rooms: true,
        },
      });
    } catch (error) {
      return this.handleError(error, "createHotel");
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
      return await prisma.hotel.update({
        where: { id },
        data,
        include: {
          rooms: true,
        },
      });
    } catch (error) {
      return this.handleError(error, "updateHotel");
    }
  }

  /**
   * Deletes a hotel
   */
  static async deleteHotel(id: string) {
    try {
      return await prisma.hotel.delete({
        where: { id },
      });
    } catch (error) {
      return this.handleError(error, "deleteHotel");
    }
  }
}
