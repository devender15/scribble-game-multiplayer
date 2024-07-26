"use server";

import { db } from "@/lib/db";

import { generateRoomCode } from "@/lib/utils";

export default async function createRoom(name: string) {
  const user = await db.user.create({
    data: {
      name,
    },
  });

  const roomCode = generateRoomCode();

  const room = await db.room.create({
    data: {
      adminId: user.id,
      roomCode,
      users: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      roomId: room.id,
    },
  });

  return room.roomCode;
}
