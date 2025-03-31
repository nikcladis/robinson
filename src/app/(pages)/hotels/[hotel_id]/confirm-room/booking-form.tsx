"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays, differenceInDays } from "date-fns";
import Image from "next/image";

interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  price: number;
  capacity: number;
  amenities: string[];
  imageUrl?: string;
  hotel: {
    name: string;
    city: string;
    country: string;
  };
}

export default function BookingForm() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room_id");

  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [roomData, setRoomData] = useState<Room | null>(null);

  // Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        if (!roomId) {
          throw new Error("Room ID is required");
        }

        const response = await fetch(`/api/rooms/${roomId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch room details");
        }
        const data = await response.json();
        
        // Handle missing hotel data instead of throwing error
        if (!data) {
          throw new Error("Invalid room data structure");
        }
        
        // If hotel data is missing, create a default hotel object
        if (!data.hotel) {
          console.warn("Room data missing hotel information, using defaults");
          // Set a default hotel object with the hotel_id from the URL
          const hotelId = window.location.pathname.split('/')[2];
          data.hotel = {
            name: "Hotel Information Unavailable",
            city: "Unknown",
            country: "Unknown",
            id: hotelId
          };
        }
        
        setRoomData(data);
      } catch (err) {
        console.error("Error fetching room:", err);
        setError(err instanceof Error ? err.message : "Failed to load room data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const calculateTotalPrice = () => {
    if (!checkInDate || !checkOutDate || !roomData || typeof roomData.price !== 'number') {
      return 0;
    }
    const nights = differenceInDays(checkOutDate, checkInDate);
    if (nights <= 0) return 0;
    return nights * roomData.price;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInDate || !checkOutDate) {
      setError("Please select check-in and check-out dates");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: roomData?.id,
          checkInDate: checkInDate.toISOString(),
          checkOutDate: checkOutDate.toISOString(),
          numberOfGuests,
          totalPrice: calculateTotalPrice(),
          status: "CONFIRMED",
          paymentStatus: "PAID",
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create booking");
      }

      const booking = await response.json();
      console.log("Booking created:", booking);
      
      // Redirect to bookings list instead of a specific booking
      // This avoids Prisma serialization issues
      router.push('/bookings');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent rendering the form until data is loaded
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error || !roomData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Room</h2>
          <p className="text-red-600">{error || "Room data could not be loaded."}</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const today = new Date();
  const minCheckOutDate = checkInDate ? addDays(checkInDate, 1) : today;
  
  return (
    <>
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Hotel
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Room Details */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {roomData.imageUrl && (
                  <div className="relative h-64">
                    <Image
                      src={roomData.imageUrl}
                      alt={roomData.roomType}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {roomData?.roomType || "Booking Details"}
                  </h1>
                  <p className="text-gray-600 mb-4">
                    {roomData?.hotel?.name ? (
                      <>
                        {roomData.hotel.name} - {roomData.hotel.city},{" "}
                        {roomData.hotel.country}
                      </>
                    ) : (
                      "Loading hotel details..."
                    )}
                  </p>
                  <div className="border-t pt-4">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Room Type:</span>
                      <span className="font-medium">{roomData?.roomType || "Standard"}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Price per night:</span>
                      <span className="font-medium">${roomData?.price?.toFixed(2) || "0.00"}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">{roomData?.capacity || 1} guests</span>
                    </div>
                    
                    <h2 className="font-semibold text-lg mt-4 mb-2">
                      Room Amenities
                    </h2>
                    {roomData?.amenities && roomData.amenities.length > 0 ? (
                      <ul className="grid grid-cols-2 gap-2">
                        {roomData.amenities.map((amenity, index) => (
                          <li
                            key={index}
                            className="flex items-center text-gray-600"
                          >
                            <svg
                              className="w-4 h-4 text-green-500 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {amenity}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No amenities listed</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Form */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6">Complete Your Booking</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Date
                    </label>
                    <DatePicker
                      selected={checkInDate}
                      onChange={(date) => setCheckInDate(date)}
                      selectsStart
                      startDate={checkInDate}
                      endDate={checkOutDate}
                      minDate={today}
                      dateFormat="MMM d, yyyy"
                      placeholderText="Select check-in date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out Date
                    </label>
                    <DatePicker
                      selected={checkOutDate}
                      onChange={(date) => setCheckOutDate(date)}
                      selectsEnd
                      startDate={checkInDate}
                      endDate={checkOutDate}
                      minDate={minCheckOutDate}
                      dateFormat="MMM d, yyyy"
                      placeholderText="Select check-out date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Guests
                  </label>
                  <select
                    value={numberOfGuests}
                    onChange={(e) => setNumberOfGuests(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from(
                      { length: roomData.capacity },
                      (_, i) => i + 1
                    ).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded">
                    {error}
                  </div>
                )}

                <div className="border-t pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Price per night</span>
                      <span>${roomData?.price ? roomData.price.toFixed(2) : '0.00'}</span>
                    </div>
                    {checkInDate && checkOutDate && (
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>
                          {differenceInDays(checkOutDate, checkInDate)} nights
                        </span>
                        <span>
                          $
                          {(
                            (roomData?.price || 0) *
                            differenceInDays(checkOutDate, checkInDate)
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total Price</span>
                      <span className="text-2xl text-blue-600">
                        ${calculateTotalPrice().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !checkInDate || !checkOutDate}
                    className="mt-6 w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Processing..." : "Confirm Booking"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 