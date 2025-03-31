import { Booking } from "@/models/booking.d";
import StatusBadge from "./status-badge";
import BookingActions from "./booking-actions";
import { formatDate } from "@/utils/date-utils";

interface BookingCardProps {
  booking: Booking;
  isUpdating: boolean;
  onUpdate: (id: string, status: string) => Promise<boolean | void>;
  onDelete: (id: string) => Promise<boolean>;
}

export default function BookingCard({
  booking,
  isUpdating,
  onUpdate,
  onDelete,
}: BookingCardProps) {
  const {
    id,
    user,
    room,
    checkInDate,
    checkOutDate,
    numberOfGuests,
    totalPrice,
    status,
  } = booking;

  const calculateNights = () => {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const nights = calculateNights();

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {room?.hotel?.name}
            </h3>
            <p className="text-sm text-gray-600">
              Room {room?.roomNumber}, {room?.roomType}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="mb-4 border-t border-gray-100 pt-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Guest</span>
            <span className="text-sm font-medium">
              {user ? `${user.firstName} ${user.lastName}` : "Unknown"}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm">{user?.email || "N/A"}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Check-in</span>
            <span className="text-sm">{formatDate(checkInDate)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Check-out</span>
            <span className="text-sm">{formatDate(checkOutDate)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Duration</span>
            <span className="text-sm">{nights} {nights === 1 ? 'night' : 'nights'}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Guests</span>
            <span className="text-sm">{numberOfGuests}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-sm text-gray-500">Total Price</span>
            <span className="text-sm">${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <BookingActions
            bookingId={id}
            status={status}
            isUpdating={isUpdating}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onView={() => {}} // Not used here
            showViewButton={false}
          />
        </div>
      </div>
    </div>
  );
} 