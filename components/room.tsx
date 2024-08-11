"use client";

import React, { useEffect } from "react";

import { useUserStore } from "@/stores/user-store";
import { useSocket } from "@/providers/socket-provider";

import { toast } from "sonner";

export default function Room({ roomCode }: { roomCode: string }) {
  const { name } = useUserStore();
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.emit("add-user", { roomCode, username: name });

    socket.on("newUserJoined", ({ name }: { name: string }) => {
      const user = name === name ? "You" : name;
      toast(`${user} joined the room`);
    });

    socket.on("userLeft", ({ message }: { message: string }) => {
      toast(message);
    });

    return () => {
      socket.emit("remove-user", { roomCode, username: name });
    };
  }, [socket, name]);

  return (
    <div>
      <h1>Room</h1>
    </div>
  );
}
