"use server";

import { db } from "@/lib/db";

export default async function joinRoom(code: string, username: string) {

  const room = await db.room.findFirst({
    where: {
      roomCode: code,
    },
  });

  if (!room) {
    throw new Error("room not found");
  }

  const user = await db.user.findFirst({
    where: {
      name: username,
    },
  });

  if (user) {
    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        roomId: room.id,
      },
    });

    return;
  }

  await db.user.create({
    data: {
      name: username,
      roomId: room.id,
    },
  });
}
