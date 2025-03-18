"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/helpers/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { room_id: string } }
) {
  const room_id = params.room_id;

  if (!room_id) {
    return new NextResponse("Room ID is required", { status: 400 });
  }

  try {
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
