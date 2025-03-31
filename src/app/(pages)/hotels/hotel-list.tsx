"use client";

import { useState, useEffect, useCallback } from "react";
import { Hotel } from "@/models/hotel";
import { HotelService } from "@/services/hotel.service";
import HotelCard from "./hotel-card";
import HotelSkeleton from "./hotel-skeleton";

const HOTELS_PER_PAGE = 6;

interface HotelListProps {
  initialHotels?: Hotel[];
  initialHasMore?: boolean;
  error?: string;
  featuredLimit?: number;
}

export default function HotelList({ 
  initialHotels = [], 
  initialHasMore = false, 
  error: initialError,
  featuredLimit
}: HotelListProps) {
  const [hotels, setHotels] = useState<Hotel[]>(initialHotels);
  const [loading, setLoading] = useState(!initialHotels.length);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [error, setError] = useState<string | null>(initialError || null);

  // Fetch additional hotels - wrapped in useCallback
  const fetchHotels = useCallback(async (offset: number = 0) => {
    try {
      setLoading(true);
      const limit = featuredLimit || HOTELS_PER_PAGE;
      const data = await HotelService.getAllHotels({
        limit,
        offset,
      });

      // Update the list of hotels
      setHotels((prev) => offset === 0 ? data : [...prev, ...data]);

      // Check if there are more hotels to load
      setHasMore(!featuredLimit && data.length === limit);
    } catch (err) {
      console.error("Failed to fetch hotels:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [featuredLimit]);

  // Fetch hotels on component mount if no initial hotels provided
  useEffect(() => {
    if (initialHotels.length === 0 && !initialError) {
      fetchHotels(0);
    }
  }, [initialHotels.length, initialError, fetchHotels]);

  const handleLoadMore = () => {
    fetchHotels(hotels.length);
  };

  if (loading && hotels.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="h-8 w-48 bg-gray-300 rounded mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(featuredLimit || 6)].map((_, i) => (
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
      <h1 className="text-2xl font-bold mb-6">{featuredLimit ? 'Featured Hotels' : 'Our Hotels'}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels && hotels.map((hotel: Hotel) => (
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
