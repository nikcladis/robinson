import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/middleware";
import { BookingController } from "@/controllers/booking.controller";

// Define params as a Promise type
type Params = Promise<{ booking_id: string }>;

/**
 * GET handler for retrieving a single booking by ID (admin only)
 */
export async function GET(
  request: NextRequest,
  context: { params: Params }
) {
  try {
    // Check if the user is admin
    const adminCheck = await requireAdmin();
    if (adminCheck) return adminCheck; // Returns 401 if not admin

    // Await the params
    const params = await context.params;
    const booking_id = params.booking_id;
    
    if (!booking_id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Get booking by ID
    const booking = await BookingController.getBookingById(booking_id);
    
    // Return booking data
    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler for updating a booking (admin only)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Params }
) {
  try {
    // Check if the user is admin
    const adminCheck = await requireAdmin();
    if (adminCheck) return adminCheck; // Returns 401 if not admin

    // Await the params
    const params = await context.params;
    const booking_id = params.booking_id;
    
    if (!booking_id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Parse the request body
    const data = await request.json();
    
    if (!data || !data.status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Update booking using controller
    const updatedBooking = await BookingController.updateBookingStatus(
      booking_id,
      data.status
    );
    
    // Return updated booking
    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error in PATCH /api/admin/bookings/[booking_id]:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for deleting a booking (admin only)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Params }
) {
  try {
    // Check if the user is admin
    const adminCheck = await requireAdmin();
    if (adminCheck) return adminCheck; // Returns 401 if not admin

    // Await the params
    const params = await context.params;
    const booking_id = params.booking_id;
    
    if (!booking_id) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Delete booking using controller
    await BookingController.deleteBooking(booking_id);
    
    // Return success message
    return NextResponse.json({ 
      success: true, 
      message: "Booking deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}