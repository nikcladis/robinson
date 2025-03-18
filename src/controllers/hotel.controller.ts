import { HotelRepository } from "@/repositories/hotel.repository";
import { HotelValidator } from "@/validations/hotel.validation";
import { notFound } from "next/navigation";
import type { TransformedHotel, TransformedReview } from "@/models/hotel";
import type { TransformedUser } from "@/models/user";
import { Hotel, Review, User, Room } from "@prisma/client";

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
    // Validate search parameters
    const validation = HotelValidator.validateSearchParams(params || {});
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    const hotels = await HotelRepository.getAllHotels(params);
    return hotels.map((hotel) => this.transformHotel(hotel));
  }

  /**
   * Retrieves a specific hotel by ID
   */
  static async getHotelById(id: string): Promise<TransformedHotel> {
    const hotel = await HotelRepository.getHotelById(id);
    if (!hotel) {
      notFound();
    }

    return this.transformHotel(hotel);
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
    // Validate hotel data
    const validation = HotelValidator.validateRequiredFields(data);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    // Format data before saving
    const formattedData = {
      ...data,
      name: data.name.trim(),
      description: data.description.trim(),
      city: data.city.trim(),
      country: data.country.trim(),
      address: data.address.trim(),
      postalCode: data.postalCode.trim(),
      amenities: data.amenities?.filter((a) => a.trim()) || [],
      imageUrl: data.imageUrl?.trim(),
    };

    const hotel = await HotelRepository.createHotel(formattedData);
    return this.transformHotel(hotel);
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
    if (!id?.trim()) {
      throw new Error("Hotel ID is required");
    }

    // Validate update data
    const validation = HotelValidator.validateUpdateData(data);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    // Format data before updating
    const formattedData = {
      ...data,
      name: data.name?.trim(),
      description: data.description?.trim(),
      city: data.city?.trim(),
      country: data.country?.trim(),
      address: data.address?.trim(),
      postalCode: data.postalCode?.trim(),
      amenities: data.amenities?.filter((a) => a.trim()),
      imageUrl: data.imageUrl?.trim(),
    };

    const hotel = await HotelRepository.updateHotel(id, formattedData);
    if (!hotel) {
      notFound();
    }

    return this.transformHotel(hotel);
  }

  /**
   * Deletes a hotel
   */
  static async deleteHotel(id: string) {
    if (!id?.trim()) {
      throw new Error("Hotel ID is required");
    }

    // Check if hotel exists before deletion
    await HotelRepository.getHotelById(id);

    const hotel = await HotelRepository.deleteHotel(id);
    if (!hotel) {
      notFound();
    }

    return this.transformHotel(hotel);
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
