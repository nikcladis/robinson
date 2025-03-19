import { BookingService } from "@/services/booking.service";
import ClientBookingList from "./client";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import { getPrismaClientSync } from "@/helpers/prisma";

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
      // Get direct Prisma access
      const prisma = await getPrismaClientSync();
      if (!prisma) {
        console.error("Prisma client not available");
        return <ClientBookingList 
          initialBookings={[]} 
          error="Database connection failed" 
        />;
      }
      
      console.log("Fetching bookings for user:", session.user.id);
      
      // Fetch bookings directly with Prisma
      const rawBookings = await prisma.booking.findMany({
        where: { 
          userId: session.user.id 
        },
        select: {
          id: true,
          userId: true,
          roomId: true,
          checkInDate: true,
          checkOutDate: true,
          numberOfGuests: true,
          totalPrice: true,
          status: true,
          paymentStatus: true,
          specialRequests: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          room: {
            select: {
              id: true,
              roomNumber: true,
              roomType: true,
              price: true,
              hotel: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                  country: true,
                },
              },
            },
          },
        },
      });
      
      console.log(`Found ${rawBookings.length} bookings`);
      
      // Manually transform dates to strings to avoid serialization issues
      const safeBookings = rawBookings.map(booking => ({
        ...booking,
        checkInDate: booking.checkInDate.toISOString(),
        checkOutDate: booking.checkOutDate.toISOString(),
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
      }));
      
      console.log("Successfully serialized bookings data");
      
      return <ClientBookingList initialBookings={safeBookings} />;
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
