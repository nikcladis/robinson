"use client";

import { useState } from "react";
import { TransformedHotel, Room } from "@/models";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SignInModal from "@/shared/auth/modals/sign-in";
import { HotelService } from "@/services/hotel.service";

interface HotelDetailsProps {
  hotel: TransformedHotel;
}

export default function HotelDetails({ hotel }: HotelDetailsProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  const averageRating =
    hotel.reviews.length > 0
      ? (
          hotel.reviews.reduce((acc, review) => acc + review.rating, 0) /
          hotel.reviews.length
        ).toFixed(1)
      : "N/A";

  const handleProceedToBooking = () => {
    if (status === "authenticated" && selectedRoom) {
      router.push(
        `/hotels/${hotel.id}/confirm-room?room_id=${selectedRoom.id}`
      );
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="relative min-h-screen pb-32">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Hotel Header */}
        <div className="relative h-96">
          {hotel.imageUrl ? (
            <Image
              src={hotel.imageUrl}
              alt={hotel.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>

        {/* Hotel Info */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{hotel.name}</h1>
              <p className="text-lg text-gray-600 mt-1">
                {hotel.city}, {hotel.country}
              </p>
            </div>
            <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
              <span className="text-yellow-500 mr-1">★</span>
              <span className="font-semibold text-blue-900">
                {averageRating}
              </span>
              <span className="text-blue-600 ml-1">
                ({hotel.reviews.length} reviews)
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="prose max-w-none mt-6">
            <h2 className="text-xl font-semibold mb-2">About this hotel</h2>
            <p className="text-gray-700">{hotel.description}</p>
          </div>

          {/* Amenities */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {hotel.amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-gray-700"
                >
                  <svg
                    className="w-5 h-5 text-blue-500"
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
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rooms */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Available Rooms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hotel.rooms.map((room) => (
                <div
                  key={room.id}
                  className={`border rounded-lg p-4 ${
                    selectedRoom?.id === room.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{room.roomType}</h3>
                      <p className="text-gray-600">
                        Up to {room.capacity} guests
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {HotelService.formatPrice(room.price)}
                      </div>
                      <div className="text-sm text-gray-500">per night</div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Room Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {room.amenities.map((amenity, index) => (
                        <li key={index} className="flex items-center">
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
                          {HotelService.getAmenityLabel(amenity)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => setSelectedRoom(room)}
                    className={`mt-4 w-full py-2 px-4 rounded-md font-medium ${
                      selectedRoom?.id === room.id
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } transition-colors`}
                  >
                    {selectedRoom?.id === room.id ? "Selected" : "Select Room"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Guest Reviews</h2>
            <div className="space-y-6">
              {hotel.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">
                          {review.user.name[0] || "?"}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h4 className="font-medium">{review.user.name}</h4>
                        <div className="ml-2 flex items-center">
                          <span className="text-yellow-500">★</span>
                          <span className="ml-1 text-gray-600">
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-gray-600">{review.comment}</p>
                      <span className="mt-2 text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Booking Toast */}
      <div
        className={`fixed bottom-0 left-0 right-0 p-4 z-40 transition-opacity duration-300 ${
          selectedRoom
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-full pointer-events-none"
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 transform transition-all duration-300 ease-in-out hover:translate-y-[-4px]">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-medium text-lg">
                  {selectedRoom?.roomType}
                </h3>
                <p className="text-sm text-gray-600">
                  {hotel.name} - {hotel.city}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {selectedRoom &&
                      HotelService.formatPrice(selectedRoom.price)}
                  </div>
                  <div className="text-sm text-gray-500">per night</div>
                </div>
                <button
                  onClick={handleProceedToBooking}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Proceed to Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <SignInModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSwitchToSignUp={() => router.push("/auth/signup")}
      />
    </div>
  );
}
