import { HotelService, CreateHotelParams } from "@/services/hotel.service";
import { HotelValidator } from "@/validations/hotel.validation";
import type { TransformedHotel, TransformedReview } from "@/models/hotel";
import type { TransformedUser } from "@/models/user";
import { Hotel, Review, User, Room } from "@prisma/client";
import { ErrorHandler } from "@/utils/error-handler";
import { ValidationError, NotFoundError } from "@/errors";

/**
 * Controller for managing hotel-related business logic and flow
 */
export class HotelController {
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
  }): Promise<TransformedHotel[]> {
    return ErrorHandler.wrapAsync(
      async () => {
        console.log('Controller getAllHotels called with params:', params);
        // Validate search parameters
        const validation = HotelValidator.validateSearchParams(params || {});
        if (!validation.isValid) {
          throw new ValidationError(validation.errors.join(", "));
        }

        const hotels = await HotelService.getAllHotels(params);
        console.log(`Controller received ${hotels.length} hotels from service`);
        
        // Transform each hotel to match the expected TransformedHotel type
        const transformedHotels = hotels.map((hotel) => this.transformHotel(hotel as Hotel & {
          reviews?: (Review & { user: Pick<User, "firstName" | "lastName"> })[];
          rooms?: Room[];
        }));
        
        console.log(`Controller transformed ${transformedHotels.length} hotels`);
        return transformedHotels;
      },
      (error) => ErrorHandler.handleControllerError(error, "getAllHotels")
    );
  }

  /**
   * Retrieves a specific hotel by ID
   */
  static async getHotelById(id: string): Promise<TransformedHotel> {
    return ErrorHandler.wrapAsync(
      async () => {
        const hotel = await HotelService.getHotel(id);
        if (!hotel) {
          throw new NotFoundError(`Hotel with ID ${id} not found`);
        }

        return this.transformHotel(hotel as Hotel & {
          reviews?: (Review & { user: Pick<User, "firstName" | "lastName"> })[];
          rooms?: Room[];
        });
      }, 
      (error) => ErrorHandler.handleControllerError(error, `getHotelById(${id})`)
    );
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
    return ErrorHandler.wrapAsync(
      async () => {
        // Validate required fields
        const validation = HotelValidator.validateRequiredFields(data);
        if (!validation.isValid) {
          throw new ValidationError(validation.errors.join(", "));
        }

        // Format data before sending to service
        const formattedData: CreateHotelParams = {
          name: data.name.trim(),
          description: data.description.trim(),
          city: data.city.trim(),
          country: data.country.trim(),
          address: data.address.trim(),
          postalCode: data.postalCode.trim(),
          starRating: data.starRating,
          amenities: data.amenities || [],
          imageUrl: data.imageUrl?.trim() || "",
        };

        const hotel = await HotelService.createHotel(formattedData);
        
        return this.transformHotel(hotel as Hotel & {
          reviews?: (Review & { user: Pick<User, "firstName" | "lastName"> })[];
          rooms?: Room[];
        });
      },
      (error) => ErrorHandler.handleControllerError(error, "createHotel")
    );
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
      postalCode?: string;
      starRating?: number;
      amenities?: string[];
      imageUrl?: string;
    }
  ) {
    return ErrorHandler.wrapAsync(
      async () => {
        if (!id?.trim()) {
          throw new ValidationError("Hotel ID is required");
        }

        // Validate update data
        const validation = HotelValidator.validateUpdateData(data);
        if (!validation.isValid) {
          throw new ValidationError(validation.errors.join(", "));
        }

        // Format data before updating
        const formattedData: Partial<CreateHotelParams> = {
          name: data.name?.trim(),
          description: data.description?.trim(),
          city: data.city?.trim(),
          country: data.country?.trim(),
          address: data.address?.trim(),
          postalCode: data.postalCode?.trim(),
          starRating: data.starRating,
          amenities: data.amenities,
          imageUrl: data.imageUrl?.trim(),
        };
        
        const hotel = await HotelService.updateHotel(id, formattedData);
        if (!hotel) {
          throw new NotFoundError(`Hotel with ID ${id} not found`);
        }

        return this.transformHotel(hotel as Hotel & {
          reviews?: (Review & { user: Pick<User, "firstName" | "lastName"> })[];
          rooms?: Room[];
        });
      },
      (error) => ErrorHandler.handleControllerError(error, `updateHotel(${id})`)
    );
  }

  /**
   * Deletes a hotel
   */
  static async deleteHotel(id: string) {
    return ErrorHandler.wrapAsync(
      async () => {
        if (!id?.trim()) {
          throw new ValidationError("Hotel ID is required");
        }

        // Call deleteHotel which returns void
        await HotelService.deleteHotel(id);
        
        // Return success as deleteHotel doesn't return a hotel object
        return { success: true, id };
      },
      (error) => ErrorHandler.handleControllerError(error, `deleteHotel(${id})`)
    );
  }
  
  /**
   * Checks if a hotel exists without throwing a notFound error
   * @param id - The hotel ID to check
   * @returns Promise resolving to true if the hotel exists, false otherwise
   */
  static async hotelExists(id: string): Promise<boolean> {
    try {
      const hotel = await HotelService.getHotel(id);
      return !!hotel;
    } catch {
      return false;
    }
  }

  /**
   * Calculates average room price for a hotel
   */
  static calculateAverageRoomPrice(rooms: { price: number }[]): number {
    if (!rooms.length) return 0;
    const total = rooms.reduce((sum, room) => sum + room.price, 0);
    return Math.round(total / rooms.length);
  }

  /**
   * Checks if a hotel has available rooms
   */
  static hasAvailableRooms(rooms: { available: boolean }[]): boolean {
    return rooms.some((room) => room.available);
  }

  /**
   * Transforms a hotel object to match the expected type
   */
  private static transformHotel(
    hotel: Hotel & {
      reviews?: (Review & {
        user: Pick<User, "firstName" | "lastName">;
      })[];
      rooms?: Room[];
    }
  ): TransformedHotel {
    const reviews = hotel.reviews || [];
    const totalRatings = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const averageRating =
      reviews.length > 0 ? totalRatings / reviews.length : 0;

    const transformedReviews: TransformedReview[] = reviews.map((review) => ({
      ...review,
      user: {
        name: `${review.user.firstName} ${review.user.lastName}`.trim(),
        image: null,
      } as TransformedUser,
    }));

    const transformedRooms = (hotel.rooms || []).map((room) => ({
      ...room,
      hotel: hotel,
    })) as unknown as Room[];

    return {
      ...hotel,
      rooms: transformedRooms,
      reviews: transformedReviews,
      averageRating,
    };
  }
}
