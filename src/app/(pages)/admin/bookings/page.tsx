"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../layout";

interface Booking {
  id: string;
  roomId: string;
  userId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  room: {
    name: string;
    hotel: {
      id: string;
      name: string;
    };
  };
}

export default function BookingsManagementPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await fetch('/api/admin/bookings');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch bookings: ${response.statusText}`);
        }
        
        const data = await response.json();
        setBookings(data);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setIsLoading(false);
      }
    }
    
    fetchBookings();
  }, []);

  const handleViewBooking = (id: string) => {
    router.push(`/admin/bookings/${id}`);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update booking status: ${response.statusText}`);
      }
      
      // Update booking status in the state
      setBookings(bookings.map(booking => 
        booking.id === id ? { ...booking, status: status as "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" } : booking
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking status');
    }
  };

  const filteredBookings = activeFilter === "all" 
    ? bookings 
    : bookings.filter(booking => booking.status === activeFilter);

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    COMPLETED: "bg-blue-100 text-blue-800",
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Booking Management</h1>
          <p className="text-gray-600 mt-2">View and manage all customer bookings</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-600 mb-6">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter("PENDING")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeFilter === "PENDING"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveFilter("CONFIRMED")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeFilter === "CONFIRMED"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setActiveFilter("CANCELLED")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeFilter === "CANCELLED"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cancelled
            </button>
            <button
              onClick={() => setActiveFilter("COMPLETED")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeFilter === "COMPLETED"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center p-10 bg-gray-50 rounded-md">
            <p className="text-gray-600">No bookings found matching your filter.</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hotel / Room
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.user.firstName} {booking.user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{booking.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.room.hotel.name}</div>
                        <div className="text-sm text-gray-500">{booking.room.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">{booking.numberOfGuests} guests</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${booking.totalPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewBooking(booking.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          View
                        </button>
                        {booking.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(booking.id, "CONFIRMED")}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(booking.id, "CANCELLED")}
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {booking.status === "CONFIRMED" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(booking.id, "COMPLETED")}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(booking.id, "CANCELLED")}
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 