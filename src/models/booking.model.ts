/**
 * User information related to a booking
 */
export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Hotel information related to a booking
 */
export interface HotelInfo {
  id: string;
  name: string;
}

/**
 * Room information related to a booking
 */
export interface RoomInfo {
  id: string;
  roomNumber: string;
  roomType: string;
  price: number;
  hotelId: string;
  hotel?: HotelInfo;
}

/**
 * Booking status types
 */
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

/**
 * Payment status types
 */
export type PaymentStatus = 'PAID' | 'UNPAID' | 'REFUNDED';

/**
 * Complete booking model
 */
export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  user?: UserInfo;
  room?: RoomInfo;
}