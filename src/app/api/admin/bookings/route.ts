"use server";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/middleware";
import { BookingController } from "@/controllers/booking.controller";

/**
 * GET handler for retrieving all bookings (admin only)
 */
export async function GET() {
  try {
    // Check if the user is admin
    const adminCheck = await requireAdmin();
    if (adminCheck) return adminCheck; // Returns 401 if not admin

    // Use the controller to get all bookings
    return BookingController.getAllBookings();
  } catch (error) {
    console.error("Error in GET /api/admin/bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
} 