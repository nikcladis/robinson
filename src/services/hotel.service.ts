import { ErrorHandler } from "@/utils/error-handler";
import { AppError, NotFoundError } from "@/errors";
import type { Hotel, Room } from "@/models/hotel";
// Note: Formatting functions (formatPrice, getAmenityLabel, etc.) have been moved to src/utils/format-utils.ts

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
 * Interface for hotel creation parameters
 */
export interface CreateHotelParams {
  name: string;
  description: string;
  city: string;
  country: string;
  address: string;
  postalCode: string;
  starRating: number;
  amenities: string[];
  imageUrl: string; // Use consistent naming across components
}

/**
 * Service class for managing hotel-related operations
 * Provides methods for CRUD operations on hotels, room management,
 * and utility functions for formatting and displaying hotel information
 * 
 * Note: UI formatting utilities like formatPrice(), getAmenityLabel(), etc. 
 * have been moved to src/utils/format-utils.ts
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
    return ErrorHandler.wrapAsync(
      async () => {
        // Check if we're in a browser environment
        const isBrowser = typeof window !== 'undefined';
        
        if (isBrowser) {
          // Client-side: use fetch API
          const queryParams = new URLSearchParams();
          if (params?.city) queryParams.append("city", params.city);
          if (params?.country) queryParams.append("country", params.country);
          if (params?.minRating)
            queryParams.append("minRating", params.minRating.toString());
          if (params?.maxPrice)
            queryParams.append("maxPrice", params.maxPrice.toString());
          if (params?.limit) queryParams.append("limit", params.limit.toString());
          if (params?.offset) queryParams.append("offset", params.offset.toString());

          try {
            console.log(`Fetching hotels from: /api/hotels?${queryParams.toString()}`);
            const response = await fetch(`/api/hotels?${queryParams.toString()}`);
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
              throw new AppError(
                errorData?.message || "Failed to fetch hotels",
                "API_ERROR",
                response.status
              );
            }
            
            return response.json();
          } catch (error) {
            console.error("Error fetching hotels:", error);
            throw new AppError(
              error instanceof Error ? error.message : "Network error when fetching hotels",
              "NETWORK_ERROR",
              500
            );
          }
        } else {
          // Server-side: use repository directly
          console.log("Server-side hotel fetch, using repository directly");
          const { HotelRepository } = await import("@/repositories/hotel.repository");
          return HotelRepository.getAllHotels(params);
        }
      },
      (error) => ErrorHandler.handleServiceError(error, "getAllHotels")
    );
  }

  /**
   * Retrieves a specific hotel by ID
   * @param id - ID of the hotel to retrieve
   * @returns Promise resolving to the hotel object
   * @throws Error if the hotel is not found or if the request fails
   */
  static async getHotel(id: string): Promise<Hotel> {
    return ErrorHandler.wrapAsync(
      async () => {
        // Check if we're in a browser environment
        const isBrowser = typeof window !== 'undefined';
        
        if (isBrowser) {
          // Client-side: use fetch API
          try {
            console.log(`Fetching hotel from: /api/hotels/${id}`);
            const response = await fetch(`/api/hotels/${id}`);
            
            if (!response.ok) {
              if (response.status === 404) {
                throw new NotFoundError(`Hotel with ID ${id} not found`);
              }
              const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
              throw new AppError(
                errorData?.message || "Failed to fetch hotel",
                "API_ERROR",
                response.status
              );
            }
            
            return response.json();
          } catch (error) {
            console.error("Error fetching hotel:", error);
            throw new AppError(
              error instanceof Error ? error.message : `Network error when fetching hotel ${id}`,
              "NETWORK_ERROR",
              500
            );
          }
        } else {
          // Server-side: use repository directly
          console.log(`Server-side hotel fetch for ID ${id}, using repository directly`);
          const { HotelRepository } = await import("@/repositories/hotel.repository");
          return HotelRepository.getHotelById(id);
        }
      },
      (error) => ErrorHandler.handleServiceError(error, `getHotel(${id})`)
    );
  }

  /**
   * Retrieves a specific room by ID
   * @param roomId - ID of the room to retrieve
   * @returns Promise resolving to the room object
   * @throws Error if the room is not found or if the request fails
   */
  static async getRoom(roomId: string): Promise<Room> {
    return ErrorHandler.wrapAsync(
      async () => {
        // Check if we're in a browser environment
        const isBrowser = typeof window !== 'undefined';
        
        if (isBrowser) {
          // Client-side: use fetch API
          try {
            console.log(`Fetching room from: /api/rooms/${roomId}`);
            const response = await fetch(`/api/rooms/${roomId}`);
            
            if (!response.ok) {
              if (response.status === 404) {
                throw new NotFoundError(`Room with ID ${roomId} not found`);
              }
              const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
              throw new AppError(
                errorData?.message || "Failed to fetch room",
                "API_ERROR",
                response.status
              );
            }
            
            return response.json();
          } catch (error) {
            console.error("Error fetching room:", error);
            throw new AppError(
              error instanceof Error ? error.message : `Network error when fetching room ${roomId}`,
              "NETWORK_ERROR",
              500
            );
          }
        } else {
          // Server-side: use repository directly
          console.log(`Server-side room fetch for ID ${roomId}, using repository directly`);
          const { RoomRepository } = await import("@/repositories/room.repository");
          return RoomRepository.getRoomById(roomId);
        }
      },
      (error) => ErrorHandler.handleServiceError(error, `getRoom(${roomId})`)
    );
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
    return ErrorHandler.wrapAsync(
      async () => {
        const searchParams = new URLSearchParams({
          checkIn,
          checkOut,
        });

        const response = await fetch(
          `/api/rooms/${roomId}/availability?${searchParams.toString()}`
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new AppError(
            errorData?.message || "Failed to check room availability",
            "API_ERROR",
            response.status
          );
        }
        const data = await response.json();
        return data.available;
      },
      (error) => ErrorHandler.handleServiceError(error, `checkRoomAvailability(${roomId})`)
    );
  }

  /**
   * Searches for hotels based on specified criteria
   * @param params - Search parameters including city, dates, guests, and price range
   * @returns Promise resolving to an array of matching hotels
   * @throws Error if the search request fails
   */
  static async searchHotels(params: SearchHotelsParams): Promise<Hotel[]> {
    return ErrorHandler.wrapAsync(
      async () => {
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
          const errorData = await response.json().catch(() => null);
          throw new AppError(
            errorData?.message || "Failed to search hotels",
            "API_ERROR",
            response.status
          );
        }
        return response.json();
      },
      (error) => ErrorHandler.handleServiceError(error, "searchHotels")
    );
  }

  /**
   * Creates a new hotel in the system
   * @param hotelData - Data for the new hotel
   * @returns Promise resolving to the created hotel
   * @throws Error if the creation request fails
   */
  static async createHotel(hotelData: CreateHotelParams): Promise<Hotel> {
    return ErrorHandler.wrapAsync(
      async () => {
        const response = await fetch("/api/hotels", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(hotelData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new AppError(
            errorData?.message || "Failed to create hotel",
            "API_ERROR",
            response.status
          );
        }

        return response.json();
      },
      (error) => ErrorHandler.handleServiceError(error, "createHotel")
    );
  }

  /**
   * Updates an existing hotel
   * @param hotelId - ID of the hotel to update
   * @param hotelData - Updated hotel data
   * @returns Promise resolving to the updated hotel
   * @throws Error if the update request fails
   */
  static async updateHotel(
    hotelId: string,
    hotelData: Partial<CreateHotelParams>
  ): Promise<Hotel> {
    return ErrorHandler.wrapAsync(
      async () => {
        // Check if we're in a browser environment
        const isBrowser = typeof window !== 'undefined';
        
        if (isBrowser) {
          // Client-side: use fetch API
          try {
            const url = `/api/hotels/${hotelId}`;
            
            const response = await fetch(url, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(hotelData),
            });
  
            if (!response.ok) {
              if (response.status === 404) {
                throw new NotFoundError(`Hotel with ID ${hotelId} not found`);
              }
              
              // Try to get detailed error information
              const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
              throw new AppError(
                errorData?.message || "Failed to update hotel",
                "API_ERROR",
                response.status
              );
            }
  
            return response.json();
          } catch (error) {
            // Handle network and parsing errors
            if (error instanceof NotFoundError || error instanceof AppError) {
              throw error; // Re-throw application errors
            }
            
            console.error('Hotel update error:', error);
            throw new AppError(
              error instanceof Error 
                ? `Failed to update hotel: ${error.message}` 
                : "Failed to update hotel - network or parsing error",
              "NETWORK_ERROR",
              500
            );
          }
        } else {
          // Server-side: use repository directly
          const { HotelRepository } = await import("@/repositories/hotel.repository");
          return HotelRepository.updateHotel(hotelId, hotelData);
        }
      },
      (error) => ErrorHandler.handleServiceError(error, `updateHotel(${hotelId})`)
    );
  }

  /**
   * Deletes a hotel from the system
   * @param hotelId - ID of the hotel to delete
   * @throws Error if the deletion request fails
   */
  static async deleteHotel(hotelId: string): Promise<void> {
    return ErrorHandler.wrapAsync(
      async () => {
        // Check if we're in a browser environment
        const isBrowser = typeof window !== 'undefined';
        
        if (isBrowser) {
          // Client-side: use fetch API
          try {
            const url = `/api/hotels/${hotelId}`;
            
            const response = await fetch(url, {
              method: "DELETE",
            });
  
            if (!response.ok) {
              if (response.status === 404) {
                throw new NotFoundError(`Hotel with ID ${hotelId} not found`);
              }
              const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
              throw new AppError(
                errorData?.message || "Failed to delete hotel",
                "API_ERROR",
                response.status
              );
            }
          } catch (error) {
            // Handle network and parsing errors
            if (error instanceof NotFoundError || error instanceof AppError) {
              throw error; // Re-throw application errors
            }
            
            console.error('Hotel delete error:', error);
            throw new AppError(
              error instanceof Error 
                ? `Failed to delete hotel: ${error.message}` 
                : "Failed to delete hotel - network or parsing error",
              "NETWORK_ERROR",
              500
            );
          }
        } else {
          // Server-side: use repository directly
          const { HotelRepository } = await import("@/repositories/hotel.repository");
          await HotelRepository.deleteHotel(hotelId);
        }
      },
      (error) => ErrorHandler.handleServiceError(error, `deleteHotel(${hotelId})`)
    );
  }

  /**
   * Gets all rooms for a specific hotel
   * @param hotelId - ID of the hotel
   * @returns Promise resolving to an array of rooms
   * @throws Error if the request fails
   */
  static async getHotelRooms(hotelId: string): Promise<Room[]> {
    return ErrorHandler.wrapAsync(
      async () => {
        const response = await fetch(`/api/hotels/${hotelId}/rooms`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new NotFoundError(`Hotel with ID ${hotelId} not found`);
          }
          const errorData = await response.json().catch(() => null);
          throw new AppError(
            errorData?.message || "Failed to fetch hotel rooms",
            "API_ERROR",
            response.status
          );
        }

        return response.json();
      },
      (error) => ErrorHandler.handleServiceError(error, `getHotelRooms(${hotelId})`)
    );
  }
}
