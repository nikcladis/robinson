import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { NextResponse } from "next/server";

/**
 * Middleware function to check if the user has admin privileges
 * @returns NextResponse with 401 status if user is not admin, null if user is admin
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized - Admin access required" },
      { status: 401 }
    );
  }

  return null;
}

/**
 * Middleware function to check if the user is authenticated
 * @returns NextResponse with 401 status if user is not authenticated, null if user is authenticated
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized - Authentication required" },
      { status: 401 }
    );
  }

  return null;
}
