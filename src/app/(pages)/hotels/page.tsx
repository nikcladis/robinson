import HotelList from "@/app/(pages)/hotels/hotel-list";

export default function HotelsPage() {
  return (
    <>
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <header className="mb-10 text-center bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-4xl font-bold mb-2">Browse Hotels</h1>
          <p className="text-gray-600">Find and book your perfect stay</p>
        </header>

        <HotelList />
      </div>
    </>
  );
}
