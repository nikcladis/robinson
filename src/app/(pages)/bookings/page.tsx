import ClientBookingList, { SerializedBooking } from "./client";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import { BookingController } from "@/controllers/booking.controller";

export default async function BookingsPage() {
  try {
    console.log("Starting bookings page fetch");
    // Get the current user session
    const authOptions = await getAuthOptions();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log("No user session found");
      return <ClientBookingList 
        initialBookings={[]} 
        error="You must be logged in to view your bookings" 
      />;
    }
    
    console.log("User authenticated:", session.user.id);
    
    try {
      console.log("Fetching bookings for user:", session.user.id);
      
      // Fetch bookings using the controller
      const rawBookings = await BookingController.getUserBookings(session.user.id);
      
      console.log(`Found ${rawBookings.length} bookings`);
      
      // Serialize the bookings to ensure we're working with string dates for the client
      const serializedBookings: SerializedBooking[] = rawBookings.map(booking => ({
        ...booking,
        checkInDate: booking.checkInDate instanceof Date ? booking.checkInDate.toISOString() : String(booking.checkInDate),
        checkOutDate: booking.checkOutDate instanceof Date ? booking.checkOutDate.toISOString() : String(booking.checkOutDate),
        createdAt: booking.createdAt instanceof Date ? booking.createdAt.toISOString() : String(booking.createdAt),
        updatedAt: booking.updatedAt instanceof Date ? booking.updatedAt.toISOString() : String(booking.updatedAt),
      }));
      
      return <ClientBookingList initialBookings={serializedBookings} />;
    } catch (dbError) {
      console.error("Database error:", dbError);
      return <ClientBookingList 
        initialBookings={[]} 
        error="Error fetching booking data from database" 
      />;
    }
  } catch (error) {
    console.error("Top-level error in bookings page:", error);
    return <ClientBookingList initialBookings={[]} error="Failed to load bookings" />;
  }
}
