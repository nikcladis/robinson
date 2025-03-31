import { NextRequest, NextResponse } from "next/server";
import { getPrismaClientSync } from "@/helpers/prisma";
import { requireAdmin } from "@/middleware";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/app/api/auth/[...nextauth]/options";

// Define params as a Promise type
type Params = Promise<{ user_id: string }>;

// Define Prisma error type
interface PrismaError {
  code?: string;
  meta?: Record<string, unknown>;
  message: string;
}

/**
 * PATCH handler for updating a user (admin only)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Params }
) {
  try {
    // Check if the user is admin
    const adminCheck = await requireAdmin();
    if (adminCheck) return adminCheck; // Returns 401 if not admin

    // Await the params and extract userId
    const params = await context.params;
    const user_id = params.user_id;
    
    const prisma = await getPrismaClientSync();
    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }
    
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
      where: { id: user_id },
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
 * DELETE handler for removing a user (admin only)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Params }
) {
  try {
    // Check if the user is admin
    const adminCheck = await requireAdmin();
    if (adminCheck) return adminCheck; // Returns 401 if not admin
      
    // Await the params and extract userId
    const params = await context.params;
    const user_id = params.user_id;

    const prisma = await getPrismaClientSync();
    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }

    // Check if trying to delete own account
    const authOptions = await getAuthOptions();
    const session = await getServerSession(authOptions);
    if (session?.user?.id === user_id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id: user_id },
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