"use server";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { BookingController } from "@/controllers/booking.controller";

/**
 * GET handler for retrieving user's bookings
 */
export async function GET() {
  try {
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
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    const booking = await BookingController.createBooking({
      userId: session.user.id,
      ...body,
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("[BOOKING_POST]", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal error",
      { status: error instanceof Error ? 400 : 500 }
    );
  }
}
