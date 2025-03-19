"use client";

import { useEffect } from "react";
import AdminLayout from "../../layout";
import { useBooking } from "../hooks/use-bookings";
import { 
  BookingCard, 
  BookingActions, 
  ErrorMessage, 
  LoadingSpinner 
} from "../components";

export default function BookingDetailPage({ params }: { params: { booking_id: string } }) {
  const booking_id = params.booking_id;
  const { 
    booking, 
    isLoading, 
    isUpdating, 
    error, 
    fetchBookingById, 
    updateBookingStatus, 
    deleteBooking,
    backToBookingsList,
    clearError
  } = useBooking();

  useEffect(() => {
    fetchBookingById(booking_id);
  }, [booking_id]);

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Booking Details</h1>
          <button
            onClick={backToBookingsList}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Back to Bookings
          </button>
        </div>

        <ErrorMessage message={error} onDismiss={clearError} />

        {isLoading ? (
          <LoadingSpinner text="Loading booking details..." />
        ) : booking ? (
          <>
            <BookingCard booking={booking} />
            
            <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Actions</h3>
              <BookingActions 
                bookingId={booking.id}
                status={booking.status}
                isUpdating={isUpdating}
                onUpdate={updateBookingStatus}
                onDelete={deleteBooking}
                vertical={true}
              />
              <p className="text-sm text-gray-500 mt-3">
                Created: {new Date(booking.createdAt).toLocaleString()}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center p-10 bg-gray-50 rounded-md">
            <p className="text-gray-600">Booking not found.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 