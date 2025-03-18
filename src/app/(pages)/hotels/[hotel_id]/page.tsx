import { HotelController } from "@/controllers/hotel.controller";
import HotelDetails from "./hotel-details";

interface HotelPageProps {
  params: Promise<{
    hotel_id: string;
  }>;
}

export default async function HotelPage({ params }: HotelPageProps) {
  const { hotel_id } = await params;
  const hotel = await HotelController.getHotelById(hotel_id);

  return (
    <>
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <HotelDetails hotel={hotel} />
      </div>
    </>
  );
}
