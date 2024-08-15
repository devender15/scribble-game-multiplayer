"use client";

import React, { useEffect } from "react";

import { useUserStore } from "@/stores/user-store";
import { useSocket } from "@/providers/socket-provider";
import deleteUser from "@/actions/delete-user";
import { redirect } from "next/navigation";

import { toast } from "sonner";
import DrawingCanvas from "./canvas";

export default function Room({ roomCode }: { roomCode: string }) {
  const { name } = useUserStore();
  const { socket } = useSocket();

  useEffect(() => {
    if (!name) redirect("/");
  }, [name]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("add-user", { roomCode, username: name });

    socket.on("newUserJoined", ({ newName }: { newName: string }) => {
      const user = name === newName ? "You" : newName;

      toast(`${user} joined the room`);
    });

    socket.on("userLeft", ({ message }: { message: string }) => {
      toast(message);
    });

    const handleUserLeave = () => {
      socket.emit("remove-user", { roomCode, username: name });

      deleteUser(name).catch((error) => {
        toast(error.message);
      });
    };

    window.addEventListener("beforeunload", handleUserLeave);

    return () => {
      // handleUserLeave();
      window.removeEventListener("beforeunload", handleUserLeave);
    };
  }, [socket, name, roomCode]);

  return (
    <div className="p-6 max-h-screen overflow-hidden">
      <p className="my-4">Room Code: {roomCode}</p>
      <section className="grid grid-cols-4 gap-3">
        <div></div>
        <div className="border w-full mx-auto shadow-md h-[60%] col-span-2">
          <DrawingCanvas roomCode={roomCode} />
        </div>
        <div></div>
      </section>
    </div>
  );
}
