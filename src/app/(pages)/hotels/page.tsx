import HotelList from "./hotel-list";
import { HotelService } from "@/services/hotel.service";

export default async function HotelsPage() {
  try {
    // Fetch initial hotels on the server
    const initialHotels = await HotelService.getAllHotels({
      limit: 6,
      offset: 0,
    });

    const initialHasMore = initialHotels.length === 6;

    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <header className="mb-10 text-center bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-4xl font-bold mb-2">Browse Hotels</h1>
          <p className="text-gray-600">Find and book your perfect stay</p>
        </header>

        <HotelList initialHotels={initialHotels} initialHasMore={initialHasMore} />
      </div>
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <header className="mb-10 text-center bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-4xl font-bold mb-2">Browse Hotels</h1>
          <p className="text-gray-600">Find and book your perfect stay</p>
        </header>

        <HotelList initialHotels={[]} initialHasMore={false} error={errorMessage} />
      </div>
    );
  }
}
