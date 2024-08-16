"use server";

import { db } from "@/lib/db";

export default async function fetchRoomUsers(roomCode: string) {
  const roomUsers = await db.room.findUnique({
    where: {
      roomCode,
    },
    select: {
      users: true,
    },
  });


  return roomUsers?.users || [];
}
