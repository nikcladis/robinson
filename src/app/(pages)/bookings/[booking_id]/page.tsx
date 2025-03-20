import { BookingService } from "@/services/booking.service";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import { getPrismaClientSync } from "@/helpers/prisma";
import { redirect } from "next/navigation";
import BookingDetailClient from "./client";

export default async function BookingPage({ 
  params 
}: { 
  params: { booking_id: string } 
}) {
  // Get the current user session
  const authOptions = await getAuthOptions();
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    // Redirect to sign in if not authenticated
    redirect("/auth/signin");
  }
  
  try {
    // Get Prisma client
    const prisma = await getPrismaClientSync();
    if (!prisma) {
      return <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="text-center p-10">Database connection failed</div>
      </div>;
    }
    
    // Fetch booking directly with Prisma
    const booking = await prisma.booking.findUnique({
      where: { 
        id: params.booking_id,
        userId: session.user.id // Only allow viewing own bookings
      },
      include: {
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
    
    if (!booking) {
      return <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="text-center p-10">Booking not found</div>
      </div>;
    }
    
    // Serialize booking for client component
    const serializedBooking = {
      ...booking,
      checkInDate: booking.checkInDate.toISOString(),
      checkOutDate: booking.checkOutDate.toISOString(),
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString()
    };
    
    // Pass the serialized booking to client component
    return <BookingDetailClient booking={serializedBooking} />;
  } catch (error) {
    console.error("Error fetching booking:", error);
    return <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="text-center text-red-500 p-10">Error loading booking details</div>
    </div>;
  }
}
