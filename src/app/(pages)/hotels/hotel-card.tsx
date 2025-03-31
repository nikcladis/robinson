import { Hotel } from "@/models/hotel";
import Image from "next/image";
import Link from "next/link";
import { formatPrice, getAmenityLabel, getRoomTypeLabel } from "@/utils/format-utils";

interface HotelCardProps {
  hotel: Hotel;
}

export default function HotelCard({ hotel }: HotelCardProps) {
  // Calculate average rating from reviews
  const averageRating =
    hotel.reviews && hotel.reviews.length > 0
      ? hotel.reviews.reduce((acc, review) => acc + review.rating, 0) /
        hotel.reviews.length
      : null;

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow">
      <Link href={`/hotels/${hotel.id}`} className="block">
        <div className="relative h-48 bg-gray-200">
          {hotel.imageUrl ? (
            <Image
              src={hotel.imageUrl}
              alt={hotel.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-300">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-semibold text-gray-900">
              {hotel.name}
            </h2>
            <div className="flex items-center">
              <span className="text-yellow-500">★</span>
              <span className="ml-1 text-gray-700">
                {averageRating?.toFixed(1) || "N/A"}
              </span>
            </div>
          </div>
          <p className="text-gray-600 mt-1">
            {hotel.city}, {hotel.country}
          </p>
          <p className="mt-2 text-sm text-gray-700">
            {hotel.description.substring(0, 150)}...
          </p>
          <div className="mt-3">
            <h3 className="font-medium text-gray-900">Amenities:</h3>
            <div className="flex flex-wrap mt-1">
              {hotel.amenities.slice(0, 4).map((amenity, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 mb-2"
                >
                  {getAmenityLabel(amenity)}
                </span>
              ))}
              {hotel.amenities.length > 4 && (
                <span className="text-xs text-gray-500 py-1">
                  +{hotel.amenities.length - 4} more
                </span>
              )}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-medium text-gray-900">Available Rooms:</h3>
            <div className="mt-2 space-y-2">
              {hotel.rooms
                ?.filter((room) => room.available)
                .slice(0, 2)
                .map((room) => (
                  <div
                    key={room.id}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <div>
                      <div className="font-medium">
                        {getRoomTypeLabel(room.roomType)}
                      </div>
                      <div className="text-sm">
                        Up to {room.capacity} guests
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {formatPrice(room.price)}
                      </div>
                      <div className="text-sm">per night</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <span className="block w-full text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
              View Details
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
