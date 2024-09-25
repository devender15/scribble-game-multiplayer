"use client";

import React, { useEffect, useCallback, useState } from "react";

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
  const {
    canDraw,
    selectedWord,
    setDrawerSelectedWord,
    setSelectedWord,
    setScores,
    setCurrentLevel,
    setFinalScores,
  } = useRoomStore();

  const [isInitialized, setIsInitialized] = useState(false);

  const handleUserLeave = useCallback(() => {
    if (socket) {
      console.log("user left!!");
      socket.emit("remove-user", { roomCode, username: name });
      deleteUser(name).catch((error) => {
        toast(error.message);
      });
      socket.disconnect();
      handleFetchRoomUsers(roomCode, setRoomUsers, socket);
    }
  }, [socket, name, roomCode, setRoomUsers]);

  useEffect(() => {
    if (!name) redirect("/");
  }, [name]);

  useEffect(() => {
    if (!socket || isInitialized) return;

    console.log("initializing room");
    setIsInitialized(true);

    socket.emit("add-user", { roomCode, username: name });

    socket.on("newUserJoined", ({ newName }: { newName: string }) => {
      const user = name === newName ? "You" : newName;

      toast(`${user} joined the room`);

      handleFetchRoomUsers(roomCode, setRoomUsers, socket);
    });

    socket.on("userLeft", ({ message }: { message: string }) => {
      toast(message);
      handleFetchRoomUsers(roomCode, setRoomUsers, socket);
    });

    socket.on(
      "drawerSelectedWord",
      ({ drawerSelectedWord }: { drawerSelectedWord: string }) => {
        setDrawerSelectedWord(drawerSelectedWord);
      }
    );

    socket.on(
      "roundRecap",
      ({ correctGuesses }: { correctGuesses: Record<string, number> }) => {
        setOpen("round-recap");
        setScores(correctGuesses);
      }
    );

    socket.on("nextLevel", ({ currentLevel }: { currentLevel: number }) => {
      setCurrentLevel(currentLevel);
      setOpen("new-level");
    });

    socket.on("gameOver", (scores: Record<string, number>) => {
      setFinalScores(scores);
      setOpen("game-over");
    });

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      handleUserLeave();
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (isInitialized) {
        handleUserLeave();
        window.removeEventListener("beforeunload", handleBeforeUnload);
        socket.off("newUserJoined");
        socket.off("userLeft");
        socket.off("drawerSelectedWord");
        socket.off("roundRecap");
        socket.off("nextLevel");
        socket.off("gameOver");
      }
    };
  }, [
    socket,
    name,
    roomCode,
    handleUserLeave,
    setRoomUsers,
    setOpen,
    setDrawerSelectedWord,
    setScores,
    setCurrentLevel,
    setFinalScores,
  ]);

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
    <div className="h-[100%] max-h-[100%] w-full overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
      <GameBar roomCode={roomCode} />
      <section className="grid grid-cols-4 gap-3 px-4 h-[calc(100vh-4rem)] p-4">
        <div className="shadow-md h-full">
          <PlayersRank roomCode={roomCode} />
        </div>
        <div className="w-full mx-auto h-full col-span-2">
          <DrawingCanvas roomCode={roomCode} />
        </div>
        <div className="h-full w-full rounded-lg shadow-md">
          <Chatbar roomCode={roomCode} username={name} />
        </div>
      </section>
    </div>
  );
}
