import { Hotel, Room } from "@/models";

/**
 * Parameters for searching hotels with optional filters
 * @interface SearchHotelsParams
 */
export interface SearchHotelsParams {
  /** Filter hotels by city name */
  city?: string;
  /** Check-in date in ISO string format */
  checkIn?: string;
  /** Check-out date in ISO string format */
  checkOut?: string;
  /** Minimum number of guests the hotel can accommodate */
  guests?: number;
  /** Minimum price per night in USD */
  minPrice?: number;
  /** Maximum price per night in USD */
  maxPrice?: number;
}

/**
 * Required parameters for creating a new hotel
 * @interface CreateHotelParams
 */
export interface CreateHotelParams {
  /** Name of the hotel */
  name: string;
  /** Detailed description of the hotel */
  description: string;
  /** City where the hotel is located */
  city: string;
  /** Country where the hotel is located */
  country: string;
  /** Full address of the hotel */
  address: string;
  /** URL or path to the hotel's main image */
  image: string;
}

/**
 * Service class for managing hotel-related operations
 * Provides methods for CRUD operations on hotels, room management,
 * and utility functions for formatting and displaying hotel information
 */
export class HotelService {
  /**
   * Retrieves all hotels in the system
   * @returns Promise resolving to an array of all hotels
   * @throws Error if the request fails
   */
  static async getAllHotels(params?: {
    city?: string;
    country?: string;
    minRating?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  }): Promise<Hotel[]> {
    const queryParams = new URLSearchParams();
    if (params?.city) queryParams.append("city", params.city);
    if (params?.country) queryParams.append("country", params.country);
    if (params?.minRating)
      queryParams.append("minRating", params.minRating.toString());
    if (params?.maxPrice)
      queryParams.append("maxPrice", params.maxPrice.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const response = await fetch(`/api/hotels?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to fetch hotels");
    }
    return response.json();
  }

  /**
   * Retrieves a specific hotel by ID
   * @param id - ID of the hotel to retrieve
   * @returns Promise resolving to the hotel object
   * @throws Error if the hotel is not found or if the request fails
   */
  static async getHotel(id: string): Promise<Hotel> {
    const response = await fetch(`/api/hotels/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch hotel");
    }
    return response.json();
  }

  /**
   * Retrieves a specific room by ID
   * @param roomId - ID of the room to retrieve
   * @returns Promise resolving to the room object
   * @throws Error if the room is not found or if the request fails
   */
  static async getRoom(roomId: string): Promise<Room> {
    const response = await fetch(`/api/rooms/${roomId}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to fetch room");
    }
    return response.json();
  }

  /**
   * Checks if a room is available for the specified dates
   * @param roomId - ID of the room to check
   * @param checkIn - Check-in date in ISO string format
   * @param checkOut - Check-out date in ISO string format
   * @returns Promise resolving to a boolean indicating availability
   * @throws Error if the availability check fails
   */
  static async checkRoomAvailability(
    roomId: string,
    checkIn: string,
    checkOut: string
  ): Promise<boolean> {
    const searchParams = new URLSearchParams({
      checkIn,
      checkOut,
    });

    const response = await fetch(
      `/api/rooms/${roomId}/availability?${searchParams.toString()}`
    );
    if (!response.ok) {
      throw new Error("Failed to check room availability");
    }
    const data = await response.json();
    return data.available;
  }

  /**
   * Formats a number as a USD price string
   * @param price - Price to format
   * @returns Formatted price string (e.g., "$100.00")
   */
  static formatPrice(price: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  }

  /**
   * Converts a room type code to a human-readable label
   * @param type - Room type code
   * @returns Human-readable room type label
   */
  static getRoomTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      STANDARD: "Standard Room",
      DELUXE: "Deluxe Room",
      SUITE: "Suite",
      EXECUTIVE: "Executive Suite",
      FAMILY: "Family Room",
    };
    return labels[type] || type;
  }

  /**
   * Calculates the total price for a stay
   * @param pricePerNight - Price per night in USD
   * @param checkIn - Check-in date
   * @param checkOut - Check-out date
   * @returns Total price for the entire stay
   */
  static calculateTotalPrice(
    pricePerNight: number,
    checkIn: Date,
    checkOut: Date
  ): number {
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    return pricePerNight * nights;
  }

  /**
   * Gets the icon identifier for a given amenity
   * @param amenity - Amenity code
   * @returns Icon identifier string
   */
  static getAmenityIcon(amenity: string): string {
    const icons: Record<string, string> = {
      WIFI: "wifi",
      POOL: "pool",
      SPA: "spa",
      GYM: "gym",
      RESTAURANT: "restaurant",
      PARKING: "parking",
      ROOM_SERVICE: "room-service",
      BAR: "bar",
      AIR_CONDITIONING: "ac",
      LAUNDRY: "laundry",
    };
    return icons[amenity] || "default";
  }

  /**
   * Converts an amenity code to a human-readable label
   * @param amenity - Amenity code
   * @returns Human-readable amenity label
   */
  static getAmenityLabel(amenity: string): string {
    const labels: Record<string, string> = {
      WIFI: "Wi-Fi",
      POOL: "Swimming Pool",
      SPA: "Spa & Wellness",
      GYM: "Fitness Center",
      RESTAURANT: "Restaurant",
      PARKING: "Parking",
      ROOM_SERVICE: "Room Service",
      BAR: "Bar/Lounge",
      AIR_CONDITIONING: "Air Conditioning",
      LAUNDRY: "Laundry Service",
    };
    return labels[amenity] || amenity;
  }

  /**
   * Searches for hotels based on specified criteria
   * @param params - Search parameters including city, dates, guests, and price range
   * @returns Promise resolving to an array of matching hotels
   * @throws Error if the search request fails
   */
  static async searchHotels(params: SearchHotelsParams): Promise<Hotel[]> {
    const searchParams = new URLSearchParams();

    if (params.city) searchParams.append("city", params.city);
    if (params.checkIn) searchParams.append("checkIn", params.checkIn);
    if (params.checkOut) searchParams.append("checkOut", params.checkOut);
    if (params.guests) searchParams.append("guests", params.guests.toString());
    if (params.minPrice)
      searchParams.append("minPrice", params.minPrice.toString());
    if (params.maxPrice)
      searchParams.append("maxPrice", params.maxPrice.toString());

    const response = await fetch(
      `/api/hotels/search?${searchParams.toString()}`
    );
    if (!response.ok) {
      throw new Error("Failed to search hotels");
    }
    return response.json();
  }

  /**
   * Creates a new hotel in the system
   * @param hotelData - Hotel details required for creation
   * @returns Promise resolving to the created hotel
   * @throws Error if the creation fails
   */
  static async createHotel(hotelData: CreateHotelParams): Promise<Hotel> {
    const response = await fetch("/api/hotels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hotelData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to create hotel");
    }

    return response.json();
  }

  /**
   * Updates an existing hotel's information
   * @param hotelId - ID of the hotel to update
   * @param hotelData - Partial hotel data to update
   * @returns Promise resolving to the updated hotel
   * @throws Error if the update fails
   */
  static async updateHotel(
    hotelId: string,
    hotelData: Partial<CreateHotelParams>
  ): Promise<Hotel> {
    const response = await fetch(`/api/hotels/${hotelId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hotelData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to update hotel");
    }

    return response.json();
  }

  /**
   * Deletes a hotel from the system
   * @param hotelId - ID of the hotel to delete
   * @throws Error if the deletion fails
   */
  static async deleteHotel(hotelId: string): Promise<void> {
    const response = await fetch(`/api/hotels/${hotelId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to delete hotel");
    }
  }

  /**
   * Retrieves all rooms for a specific hotel
   * @param hotelId - ID of the hotel
   * @returns Promise resolving to an array of rooms
   * @throws Error if the request fails
   */
  static async getHotelRooms(hotelId: string): Promise<Room[]> {
    const response = await fetch(`/api/hotels/${hotelId}/rooms`);
    if (!response.ok) {
      throw new Error("Failed to fetch hotel rooms");
    }
    return response.json();
  }
}
