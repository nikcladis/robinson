import { Suspense } from "react";
import EditHotelForm from "./edit/client";
import Link from "next/link";

// Define params as a Promise type
type Params = Promise<{ hotel_id: string }>;

export default async function HotelDetailPage({ params }: { params: Params }) {
  // Await the params
  const resolvedParams = await params;
  const hotel_id = resolvedParams.hotel_id;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Edit Hotel</h1>
            <p className="text-gray-600 mt-2">Update hotel information and settings</p>
          </div>
          <Link 
            href="/admin/hotels" 
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          >
            Back to Hotels
          </Link>
        </div>
      </div>
      
      <Suspense fallback={
        <div className="text-center p-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      }>
        <EditHotelForm hotelId={hotel_id} />
      </Suspense>
    </div>
  );
} 