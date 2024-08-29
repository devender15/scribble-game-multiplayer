"use client";

import React, { useEffect, useState } from "react";

import { useUserStore } from "@/stores/user-store";
import { useSocket } from "@/providers/socket-provider";
import { useModalStore } from "@/stores/modal-store";
import { useRoomStore } from "@/stores/room-store";

import deleteUser from "@/actions/delete-user";
import { redirect } from "next/navigation";
import { handleFetchRoomUsers } from "@/lib/utils";

import { toast } from "sonner";
import DrawingCanvas from "./canvas";
import Chatbar from "./chatbar";
import GameBar from "./game-bar";
import PlayersRank from "./players-rank";

export default function Room({ roomCode }: { roomCode: string }) {
  const { name, setRoomUsers } = useUserStore();
  const { socket } = useSocket();
  const { setOpen } = useModalStore();
  const { canDraw, selectedWord, setDrawerSelectedWord, setSelectedWord, setScores } =
    useRoomStore();

  // useEffect(() => {
  //   if (!name) redirect("/");
  // }, [name]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("add-user", { roomCode, username: name });

    socket.on("newUserJoined", ({ newName }: { newName: string }) => {
      const user = name === newName ? "You" : newName;

      toast(`${user} joined the room`);

      handleFetchRoomUsers(roomCode, setRoomUsers);
    });

    socket.on("userLeft", ({ message }: { message: string }) => {
      toast(message);
    });

    socket.on(
      "drawerSelectedWord",
      ({ drawerSelectedWord }: { drawerSelectedWord: string }) => {
        setDrawerSelectedWord(drawerSelectedWord);
      }
    );

    socket.on("roundRecap", ({ correctGuesses }: { correctGuesses: Record<string, number> }) => {
      setOpen("round-recap");
      setScores(correctGuesses);
    });

    const handleUserLeave = () => {
      socket.emit("remove-user", { roomCode, username: name });

      deleteUser(name).catch((error) => {
        toast(error.message);
      });

      socket.disconnect();

      handleFetchRoomUsers(roomCode, setRoomUsers);
    };

    window.addEventListener("beforeunload", handleUserLeave);

    return () => {
      // handleUserLeave();
      window.removeEventListener("beforeunload", handleUserLeave);
    };
  }, [socket, name, roomCode]);

  useEffect(() => {
    if (canDraw) {
      setOpen("word-select");
    } else {
      setOpen("");
      setSelectedWord("");
    }

    return () => {
      setOpen("");
      setSelectedWord("");
    };
  }, [canDraw]);

  useEffect(() => {
    if (!selectedWord) return;

    socket.emit("selectedWord", { roomCode, selectedWord });
    socket.emit("startRound", { roomCode });
  }, [selectedWord]);

  return (
    <div className="h-[85%] max-h-[85%] w-full overflow-hidden space-y-4">
      <GameBar roomCode={roomCode} />
      <section className="grid grid-cols-4 gap-3 px-4 h-[calc(100vh-12rem)]">
        <div>
          <PlayersRank roomCode={roomCode} />
        </div>
        <div className="border w-full mx-auto shadow-md h-[70%] col-span-2">
          <DrawingCanvas roomCode={roomCode} />
        </div>
        <div className="h-full w-full">
          <Chatbar roomCode={roomCode} username={name} />
        </div>
      </section>
    </div>
  );
}
