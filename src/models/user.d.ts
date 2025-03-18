/**
 * User models for the application
 */

import type { Booking } from "./booking";
import type { Review } from "./hotel";
import type { User as PrismaUser, UserRole } from "@prisma/client";

export { UserRole };

export interface User extends PrismaUser {
  // Relations
  bookings?: Booking[];
  reviews?: Review[];
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  role: UserRole;
}

export interface TransformedUser {
  name: string;
  image: string | null;
}
