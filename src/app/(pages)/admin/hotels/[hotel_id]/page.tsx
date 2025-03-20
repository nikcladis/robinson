import { Suspense } from "react";
import EditHotelForm from "./edit/client";

interface HotelDetailPageProps {
  params: {
    hotel_id: string;
  };
}

export default function HotelDetailPage({ params }: HotelDetailPageProps) {
  const { hotel_id } = params;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Edit Hotel</h1>
            <p className="text-gray-600 mt-2">Update hotel information and settings</p>
          </div>
          <a 
            href="/admin/hotels" 
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          >
            Back to Hotels
          </a>
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