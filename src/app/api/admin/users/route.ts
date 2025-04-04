import { NextResponse } from "next/server";
import { getPrismaClientSync } from "@/helpers/prisma";
import { requireAdmin } from "@/middleware";
import { corsHeaders } from "@/config/cors"; // Import centralized headers

/**
 * GET handler for retrieving all users (admin only)
 */
export async function GET() {
  try {
    // Check if the user is admin
    const adminCheck = await requireAdmin();
    if (adminCheck) return adminCheck; // Returns 401 if not admin

    const prisma = await getPrismaClientSync();
    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection error" },
        { 
          status: 500,
          headers: corsHeaders
        }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users, { headers: corsHeaders });

  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500, headers: corsHeaders }
    );
  }
} 