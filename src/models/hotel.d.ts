/**
 * Hotel and room models for the application
 */

import type {
  Hotel as PrismaHotel,
  Room as PrismaRoom,
  Review as PrismaReview,
  RoomType,
} from "@prisma/client";
import type { Booking } from "./booking";
import type { User, TransformedUser } from "./user";

export { RoomType };

export interface Hotel extends PrismaHotel {
  rooms?: Room[];
  reviews?: Review[];
  averageRating?: number;
}

export interface Room extends PrismaRoom {
  hotel?: Hotel;
  bookings?: Booking[];
}

export interface Review extends PrismaReview {
  user?: User | TransformedUser;
  hotel?: Hotel;
}

export interface TransformedReview extends Omit<Review, "user"> {
  user: TransformedUser;
}

export interface TransformedHotel extends Omit<Hotel, "reviews"> {
  rooms: Room[];
  reviews: TransformedReview[];
}
