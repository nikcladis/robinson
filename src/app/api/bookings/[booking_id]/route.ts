"use server";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { BookingController } from "@/controllers/booking.controller";

// Define params as a Promise type
type Params = Promise<{ booking_id: string }>;

/**
 * Validates a UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function GET(
  request: Request,
  context: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Await the params
    const params = await context.params;
    const booking_id = params.booking_id;

    if (!isValidUUID(booking_id)) {
      return new NextResponse("Invalid booking ID format", { status: 400 });
    }

    const booking = await BookingController.getBooking(
      booking_id,
      session.user.id
    );
    return NextResponse.json(booking);
  } catch (error) {
    console.error("[BOOKING_GET]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: error instanceof Error ? 400 : 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Params }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Await the params
    const params = await context.params;
    const booking_id = params.booking_id;

    if (!isValidUUID(booking_id)) {
      return new NextResponse("Invalid booking ID format", { status: 400 });
    }

    const booking = await BookingController.cancelBooking(
      booking_id,
      session.user.id
    );
    return NextResponse.json(booking);
  } catch (error) {
    console.error("[BOOKING_PATCH]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: error instanceof Error ? 400 : 500 }
    );
  }
}
