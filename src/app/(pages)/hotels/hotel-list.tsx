"use client";

import { useState, useEffect } from "react";
import { Hotel } from "@/models";
import { HotelService } from "@/services/hotel.service";
import HotelCard from "./hotel-card";
import HotelSkeleton from "./hotel-skeleton";

const HOTELS_PER_PAGE = 6;

export default function HotelList() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async (offset: number = 0) => {
    try {
      const data = await HotelService.getAllHotels({
        limit: HOTELS_PER_PAGE,
        offset,
      });

      if (offset === 0) {
        setHotels(data);
      } else {
        setHotels((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === HOTELS_PER_PAGE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setLoading(true);
    fetchHotels(hotels.length);
  };

  if (loading && hotels.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="h-8 w-48 bg-gray-300 rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <HotelSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6">Our Hotels</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
