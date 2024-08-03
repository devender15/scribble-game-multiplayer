"use client";

import React, { useEffect } from "react";

import { useUserStore } from "@/stores/user-store";
import { useSocket } from "@/providers/socket-provider";

export default function Room({ roomCode }: { roomCode: string }) {
  const { name } = useUserStore();
  const { socket } = useSocket();

  const roomKey = `room:${roomCode}`;

  useEffect(() => {
    if (!socket) return;

    console.log("joining room", roomKey);

    console.log(socket);

    socket.emit("join-room", { name, roomKey });

    socket.on(roomKey, ({ name }: { name: string }) => {
      console.log(`${name} joined the room`);
    });

    return () => {
      socket.off("user-joined");
    };
  }, [socket, name]);

  return (
    <div>
      <h1>Room</h1>
    </div>
  );
}
