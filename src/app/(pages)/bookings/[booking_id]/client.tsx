"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Define the type for serialized booking data
type SerializedBooking = {
  id: string;
  userId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  specialRequests: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  room?: {
    id: string;
    roomNumber: string;
    roomType: string;
    price: number;
    hotel?: {
      id: string;
      name: string;
      city: string;
      country: string;
    } | null;
  } | null;
};

interface BookingDetailClientProps {
  booking: SerializedBooking;
}

export default function BookingDetailClient({ booking }: BookingDetailClientProps) {
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancelBooking = async () => {
    try {
      setCancelling(true);
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      // Refresh the page to show updated status
      router.refresh();
      setShowCancelModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  // Check if booking can be cancelled (not already cancelled and before check-in date)
  const canCancel = 
    booking.status !== "CANCELLED" && 
    new Date(booking.checkInDate) > new Date();

  return (
    <>
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push("/bookings")}
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
            Back to Bookings
          </button>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-500 rounded-md">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Booking Details
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    Booking ID: {booking?.id}
                  </p>
                </div>
                {canCancel && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Hotel Information
                </h2>
                <div className="space-y-3">
                  <p className="text-lg font-medium">
                    {booking.room?.hotel?.name}
                  </p>
                  <p className="text-gray-600">
                    Room {booking.room?.roomNumber} ({booking.room?.roomType})
                  </p>
                  <p className="text-gray-600">
                    {booking.room?.hotel?.city}, {booking.room?.hotel?.country}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Guest Information
                </h2>
                <div className="space-y-3">
                  <p className="text-lg font-medium">
                    {booking.user?.firstName} {booking.user?.lastName}
                  </p>
                  <p className="text-gray-600">{booking.user?.email}</p>
                  <p className="text-gray-600">
                    {booking.numberOfGuests}{" "}
                    {booking.numberOfGuests === 1 ? "guest" : "guests"}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Dates</h2>
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Check-in: {formatDate(booking.checkInDate)}
                  </p>
                  <p className="text-gray-600">
                    Check-out: {formatDate(booking.checkOutDate)}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                <div className="space-y-3">
                  <p className="text-lg font-medium">
                    Total: ${booking.totalPrice.toFixed(2)}
                  </p>
                  <div className="flex space-x-4">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${getPaymentStatusBadgeClass(
                        booking.paymentStatus
                      )}`}
                    >
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Cancel Booking</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this booking? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={cancelling}
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper functions
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    case "COMPLETED":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getPaymentStatusBadgeClass(status: string): string {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-800";
    case "UNPAID":
      return "bg-red-100 text-red-800";
    case "REFUNDED":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
} 