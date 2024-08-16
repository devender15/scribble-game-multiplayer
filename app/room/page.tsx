import { db } from "@/lib/db";

import { redirect } from "next/navigation";

import Header from "@/components/header";
import Room from "@/components/room";

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
    <div className="max-h-screen h-screen overflow-hidden max-w-[100vw]">
      <Header />
      <Room roomCode={roomCode as string} />
    </div>
  );
}
