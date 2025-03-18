"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Booking } from "@/models";
import { BookingService } from "@/services/booking.service";

interface BookingPageProps {
  params: Promise<{ booking_id: string }>;
}

export default function BookingPage({ params }: BookingPageProps) {
  const { booking_id } = use(params);
  const { status } = useSession();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await BookingService.getBooking(booking_id);
        setBooking(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchBooking();
    }
  }, [booking_id, status]);

  const handleCancelBooking = async () => {
    try {
      setCancelling(true);
      const updatedBooking = await BookingService.cancelBooking(booking_id);
      setBooking(updatedBooking);
      setShowCancelModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <>
        <div className="container mx-auto py-8 px-4 sm:px-6">
          <div className="text-center p-10">Loading...</div>
        </div>
      </>
    );
  }

  if (status === "unauthenticated") {
    return null; // Will redirect in useEffect
  }

  if (error) {
    return (
      <>
        <div className="container mx-auto py-8 px-4 sm:px-6">
          <div className="text-center text-red-500 p-10">Error: {error}</div>
        </div>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <div className="container mx-auto py-8 px-4 sm:px-6">
          <div className="text-center p-10">Booking not found</div>
        </div>
      </>
    );
  }

  const canCancel = BookingService.isBookingCancellable(booking);

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
            Back to Bookings
          </button>

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
                    Check-in: {BookingService.formatDate(booking.checkInDate)}
                  </p>
                  <p className="text-gray-600">
                    Check-out: {BookingService.formatDate(booking.checkOutDate)}
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
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${BookingService.getStatusBadgeClass(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${BookingService.getPaymentStatusBadgeClass(
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
