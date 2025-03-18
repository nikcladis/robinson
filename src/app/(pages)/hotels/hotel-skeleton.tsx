export default function HotelSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg bg-white animate-pulse">
      <div className="h-48 bg-gray-300" />
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="h-6 w-2/3 bg-gray-300 rounded" />
          <div className="h-6 w-12 bg-gray-300 rounded" />
        </div>
        <div className="h-4 w-1/3 bg-gray-300 rounded mt-2" />
        <div className="h-16 bg-gray-300 rounded mt-2" />
        <div className="mt-3">
          <div className="h-5 w-24 bg-gray-300 rounded" />
          <div className="flex flex-wrap mt-1 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-6 w-16 bg-gray-300 rounded" />
            ))}
          </div>
        </div>
        <div className="mt-4">
          <div className="h-5 w-32 bg-gray-300 rounded" />
          <div className="mt-2 space-y-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 rounded" />
            ))}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="h-10 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  );
}
