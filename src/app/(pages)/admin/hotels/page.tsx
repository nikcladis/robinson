"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../layout";
import type { Hotel } from "@/models/hotel";

export default function HotelsManagementPage() {
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHotels() {
      try {
        console.log('Fetching hotels...');
        const response = await fetch('/api/hotels');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch hotels: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Hotels data received:', data);
        setHotels(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching hotels:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setIsLoading(false);
      }
    }
    
    fetchHotels();
  }, []);

  const handleAddHotel = () => {
    router.push('/admin/hotels/new');
  };

  const handleEditHotel = (id: string) => {
    router.push(`/admin/hotels/${id}`);
  };

  const handleDeleteHotel = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/hotels/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete hotel: ${response.statusText}`);
      }
      
      // Remove the deleted hotel from the state
      setHotels(hotels.filter(hotel => hotel.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete hotel');
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Hotel Management</h1>
          <button
            onClick={handleAddHotel}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Add New Hotel
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-600 mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : hotels.length === 0 ? (
          <div className="text-center p-10 bg-gray-50 rounded-md">
            <p className="text-gray-600">No hotels found. Create your first hotel!</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hotel
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hotels.map((hotel) => (
                  <tr key={hotel.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {hotel.imageUrl ? (
                          <img 
                            src={hotel.imageUrl} 
                            alt={hotel.name}
                            className="h-10 w-10 rounded-full object-cover mr-3"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://via.placeholder.com/40?text=Hotel";
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <span className="text-gray-500 text-sm">No img</span>
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{hotel.city}, {hotel.country}</div>
                      <div className="text-sm text-gray-500">{hotel.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {Array.from({ length: Math.floor(hotel.starRating) }).map((_, i) => (
                          <span key={i} className="text-yellow-400">★</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(hotel.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditHotel(hotel.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteHotel(hotel.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 