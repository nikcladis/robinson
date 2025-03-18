import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/helpers/prisma";
import { requireAdmin } from "@/middleware";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// Define Prisma error type
interface PrismaError {
  code?: string;
  meta?: Record<string, unknown>;
  message: string;
}

// Define route params type according to Next.js standards
type RouteParams = {
  params: {
    userId: string;
  };
};

/**
 * PATCH handler for updating a user (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check if the user is admin
    const adminCheck = await requireAdmin();
    if (adminCheck) return adminCheck; // Returns 401 if not admin

    // Extract userId from params
    const userId = params.userId;
    
    const body = await request.json();
    const { role } = body;

    // Validate role
    if (role && !Object.values(UserRole).includes(role as UserRole)) {
      return NextResponse.json(
        { error: "Invalid role provided" },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as UserRole },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    
    // Handle case where user doesn't exist
    if ((error as PrismaError).code === 'P2025') {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for deleting a user (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Check if the user is admin
    const adminCheck = await requireAdmin();
    if (adminCheck) return adminCheck; // Returns 401 if not admin

    // Extract userId from params
    const userId = params.userId;

    // Check if trying to delete own account
    const session = await getServerSession(authOptions);
    if (session?.user?.id === userId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    
    // Handle case where user doesn't exist
    if ((error as PrismaError).code === 'P2025') {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
} 