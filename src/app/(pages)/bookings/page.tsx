import { BookingService } from "@/services/booking.service";
import ClientBookingList from "./client";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

export default async function BookingsPage() {
  try {
    // Get the auth options and current user session
    const authOptions = await getAuthOptions();
    const session = await getServerSession(authOptions);
    
    // If user is not logged in, redirect to login
    if (!session?.user?.id) {
      return redirect("/api/auth/signin?callbackUrl=/bookings");
    }

    // Fetch bookings for the current user
    const bookings = await BookingService.getUserBookings(session.user.id);
    
    // Serialize the bookings to handle Date objects
    const serializedBookings = bookings.map(booking => ({
      ...booking,
      checkInDate: booking.checkInDate instanceof Date ? booking.checkInDate.toISOString() : booking.checkInDate,
      checkOutDate: booking.checkOutDate instanceof Date ? booking.checkOutDate.toISOString() : booking.checkOutDate,
      createdAt: booking.createdAt instanceof Date ? booking.createdAt.toISOString() : booking.createdAt,
      updatedAt: booking.updatedAt instanceof Date ? booking.updatedAt.toISOString() : booking.updatedAt
    }));

    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <ClientBookingList bookings={serializedBookings} />
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <ClientBookingList 
          bookings={[]} 
          error={error instanceof Error ? error.message : "An error occurred"} 
        />
      </div>
    );
  }
}
