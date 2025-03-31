"use client";

import { useEffect, useState } from "react";
import { useBooking } from "../hooks/use-bookings";
import { StatusBadge, BookingActions, ErrorMessage, LoadingSpinner } from "./index";
import { FilterButton } from "./filter-button";

export default function BookingsContent() {
  const { 
    bookings, 
    isLoading, 
    isUpdating, 
    error, 
    fetchBookings, 
    updateBookingStatus, 
    deleteBooking,
    viewBookingDetails,
    clearError
  } = useBooking();
  
  const [activeFilter, setActiveFilter] = useState<string>("all");
  
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = activeFilter === "all" 
    ? bookings 
    : bookings.filter(booking => booking.status === activeFilter);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Booking Management</h1>
        <p className="text-gray-600 mt-2">View and manage all customer bookings</p>
      </div>

      <ErrorMessage message={error} onDismiss={clearError} />

      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <FilterButton 
            label="All" 
            isActive={activeFilter === "all"} 
            onClick={() => setActiveFilter("all")} 
          />
          <FilterButton 
            label="Pending" 
            isActive={activeFilter === "PENDING"} 
            onClick={() => setActiveFilter("PENDING")} 
          />
          <FilterButton 
            label="Confirmed" 
            isActive={activeFilter === "CONFIRMED"} 
            onClick={() => setActiveFilter("CONFIRMED")} 
          />
          <FilterButton 
            label="Cancelled" 
            isActive={activeFilter === "CANCELLED"} 
            onClick={() => setActiveFilter("CANCELLED")} 
          />
          <FilterButton 
            label="Completed" 
            isActive={activeFilter === "COMPLETED"} 
            onClick={() => setActiveFilter("COMPLETED")} 
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner text="Loading bookings..." />
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
                        {booking.user && `${booking.user.firstName} ${booking.user.lastName}`}
                      </div>
                      <div className="text-sm text-gray-500">{booking.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.room?.hotel?.name}</div>
                      <div className="text-sm text-gray-500">{booking.room?.roomNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">{booking.numberOfGuests} guests</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={booking.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${booking.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <BookingActions
                        bookingId={booking.id}
                        status={booking.status}
                        isUpdating={isUpdating}
                        onUpdate={updateBookingStatus}
                        onDelete={deleteBooking}
                        onView={viewBookingDetails}
                        showViewButton={true}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 