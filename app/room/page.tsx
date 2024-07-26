import { db } from "@/lib/db";

import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const roomCode = searchParams.code;

  if (!roomCode) {
    redirect("/");
  }

  const room = await db.room.findFirst({
    where: {
      roomCode: roomCode as string,
    },
  });

  if (!room) {
    redirect("/");
  }

  return (
    <div>
      <h1>Room</h1>
    </div>
  );
}
