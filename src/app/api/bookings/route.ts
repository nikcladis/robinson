"use server";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/app/api/auth/[...nextauth]/options";
import { BookingController } from "@/controllers/booking.controller";

/**
 * GET handler for retrieving user's bookings
 */
export async function GET() {
  try {
    const authOptions = await getAuthOptions();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const bookings = await BookingController.getUserBookings(session.user.id);
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating new bookings
 */
export async function POST(request: Request) {
  try {
    const authOptions = await getAuthOptions();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    
    // Add status field if not provided - this is required by the validation schema
    const bookingData = {
      userId: session.user.id,
      ...body,
      status: body.status || "CONFIRMED", // Default to CONFIRMED if not provided
    };
    
    console.log("Creating booking with data:", JSON.stringify(bookingData));

    const bookingResult = await BookingController.createBooking(bookingData);
    
    // Manually extract only the data we need to return to the client
    // to avoid Prisma serialization issues
    const safeBooking = {
      id: bookingResult.id,
      userId: bookingResult.userId,
      roomId: bookingResult.roomId,
      checkInDate: bookingResult.checkInDate,
      checkOutDate: bookingResult.checkOutDate,
      numberOfGuests: bookingResult.numberOfGuests,
      totalPrice: bookingResult.totalPrice,
      status: bookingResult.status,
      paymentStatus: bookingResult.paymentStatus,
      createdAt: bookingResult.createdAt,
    };
    
    console.log("Booking created successfully:", safeBooking.id);

    return NextResponse.json(safeBooking);
  } catch (error) {
    console.error("[BOOKING_POST]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal error",
      { status: error instanceof Error ? 400 : 500 }
    );
  }
}
