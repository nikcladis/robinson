import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/middleware";
import { BookingController } from "@/controllers/booking.controller";

/**
 * GET handler for retrieving a single booking by ID (admin only)
 */
export async function GET(
  request: NextRequest,
  context: { params: { booking_id: string } }
) {
  try {
    // Check if the user is admin
    const adminCheck = await requireAdmin();
    if (adminCheck) return adminCheck; // Returns 401 if not admin

    const { booking_id } = context.params;
    if (!booking_id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Use the controller to get the booking
    return BookingController.getBookingById(booking_id);
  } catch (error) {
    console.error("Error in GET /api/admin/bookings/[booking_id]:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler for updating a booking's status (admin only)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: { booking_id: string } }
) {
  try {
    // Check if the user is admin
    const adminCheck = await requireAdmin();
    if (adminCheck) return adminCheck; // Returns 401 if not admin

    const { booking_id } = context.params;
    if (!booking_id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await request.json();

    // Use the controller to update the booking status
    return BookingController.updateBookingStatus(booking_id, body);
  } catch (error) {
    console.error("Error in PATCH /api/admin/bookings/[booking_id]:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for removing a booking (admin only)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: { booking_id: string } }
) {
  try {
    // Check if the user is admin
    const adminCheck = await requireAdmin();
    if (adminCheck) return adminCheck; // Returns 401 if not admin

    const { booking_id } = context.params;
    if (!booking_id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Use the controller to delete the booking
    return BookingController.deleteBooking(booking_id);
  } catch (error) {
    console.error("Error in DELETE /api/admin/bookings/[booking_id]:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}