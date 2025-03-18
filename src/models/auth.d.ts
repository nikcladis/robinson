/**
 * Authentication models for next-auth integration
 */

import { DefaultSession } from "next-auth";
import type {
  Account,
  Session,
  VerificationToken,
  UserRole,
} from "@prisma/client";

/**
 * Database models used by our adapter
 */

// Re-export Prisma types
export type { Account, Session, VerificationToken };

/**
 * Next-Auth type extensions
 */

// Extend the built-in Next-Auth types with our custom properties
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      firstName: string;
      lastName: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    firstName: string;
    lastName: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    firstName: string;
    lastName: string;
  }
}
