"use server";

import { NextRequest, NextResponse } from "next/server";
import { getPrismaClientSync } from "@/helpers/prisma";

export async function GET(
  request: NextRequest,
  context: { params: { room_id: string } }
) {
  const { room_id } = context.params;

  if (!room_id) {
    return new NextResponse("Room ID is required", { status: 400 });
  }

  try {
    const prisma = await getPrismaClientSync();
    if (!prisma) {
      return new NextResponse("Database connection error", { status: 500 });
    }
    
    const room = await prisma.room.findUnique({
      where: {
        id: room_id,
      },
      include: {
        hotel: {
          select: {
            name: true,
            city: true,
            country: true,
          },
        },
      },
    });

    if (!room) {
      return new NextResponse("Room not found", { status: 404 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error("[ROOM_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
