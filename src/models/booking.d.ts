/**
 * Booking models for the application
 */

import type {
  Booking as PrismaBooking,
  BookingStatus,
  PaymentStatus,
} from "@prisma/client";
import type { Room } from "./hotel";
import type { User } from "./user";

export { BookingStatus, PaymentStatus };

export interface Booking extends PrismaBooking {
  // Relations
  user?:
    | User
    | {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
  room?:
    | Room
    | {
        id: string;
        roomNumber: string;
        roomType: string;
        price: number;
        hotel?: {
          id: string;
          name: string;
          city: string;
          country: string;
        };
      };
}
