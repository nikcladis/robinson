import { useState } from 'react';
import { Booking } from '@/models/booking';
import { useRouter } from 'next/navigation';

export function useBooking() {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all bookings
  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/bookings');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      // Check if responseData is an object with a data property or directly an array
      let bookingsData;
      if (Array.isArray(responseData)) {
        bookingsData = responseData;
      } else if (responseData && typeof responseData === 'object') {
        // If it's an API response object with 'data' property
        bookingsData = responseData.data || [];
      } else {
        bookingsData = [];
        console.error('Unexpected response format:', responseData);
      }
      
      // Convert Prisma objects to plain JavaScript objects to avoid serialization issues
      setBookings(Array.isArray(bookingsData) ? JSON.parse(JSON.stringify(bookingsData)) : []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'An error occurred fetching bookings');
      // Ensure bookings is always an array even on error
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch a single booking by ID
  const fetchBookingById = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/bookings/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch booking: ${response.statusText}`);
      }
      
      const data = await response.json();
      // Convert Prisma object to plain JavaScript object to avoid serialization issues
      setBooking(JSON.parse(JSON.stringify(data)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred fetching booking');
    } finally {
      setIsLoading(false);
    }
  };

  // Update a booking's status
  const updateBookingStatus = async (id: string, status: string) => {
    try {
      setIsUpdating(true);
      setError(null);
      
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
      
      const data = await response.json();
      // Convert Prisma object to plain JavaScript object to avoid serialization issues
      const updatedBooking = JSON.parse(JSON.stringify(data));
      
      // Update local state based on which view we're in
      if (booking && booking.id === id) {
        setBooking(updatedBooking);
      }
      
      setBookings(prevBookings => 
        prevBookings.map(b => b.id === id ? updatedBooking : b)
      );
      
      return updatedBooking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking status');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete a booking
  const deleteBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return false;
    }
    
    try {
      setIsUpdating(true);
      setError(null);
      
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete booking: ${response.statusText}`);
      }
      
      // Update local state
      if (booking && booking.id === id) {
        setBooking(null);
        // Navigate back to the bookings list
        router.push('/admin/bookings');
      }
      
      setBookings(prevBookings => prevBookings.filter(b => b.id !== id));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete booking');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Navigate to booking detail view
  const viewBookingDetails = (id: string) => {
    router.push(`/admin/bookings/${id}`);
  };

  // Navigate back to bookings list
  const backToBookingsList = () => {
    router.push('/admin/bookings');
  };

  // Clear any errors
  const clearError = () => {
    setError(null);
  };

  return {
    // State
    booking,
    bookings,
    isLoading,
    isUpdating,
    error,
    
    // Actions
    fetchBookings,
    fetchBookingById,
    updateBookingStatus,
    deleteBooking,
    viewBookingDetails,
    backToBookingsList,
    clearError,
  };
} 