import { requireAdmin } from "@/middleware";
import { BookingController } from "@/controllers/booking.controller";
import { ApiResponse } from "@/utils/api-response";
import { AuthorizationError } from "@/errors";

/**
 * GET handler for retrieving all bookings (admin only)
 */
export async function GET() {
  return ApiResponse.handle(async () => {
    console.log("API GET /api/admin/bookings called");

    // Check if the user is admin
    const authError = await requireAdmin();
    if (authError) {
      throw new AuthorizationError("Admin access required");
    }

    // Get all bookings
    const bookings = await BookingController.getAllBookings();
    console.log(
      `API GET /api/admin/bookings returning ${bookings.length} bookings`
    );

    return bookings;
  }, "Failed to fetch bookings");
}
