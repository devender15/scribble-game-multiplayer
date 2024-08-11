"use client";

import CustomizePlayer from "./customize-player";
import JoinRoom from "./join-room";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";
import { Separator } from "@/components/ui/separator"

import { useUserStore } from "@/stores/user-store";

import createRoom from "@/actions/create-room";

type mode = "join" | "";

export default function GameMode() {
  const [mode, setMode] = useState<mode>("");
  const router = useRouter();

  const { name, validationStatus } = useUserStore();

  const handleToggleMode = (mode: mode) => {
    setMode(mode);
  };

  const handleCreateRoom = async () => {
    try {
      const roomCode = await createRoom(name);
      router.push(`/room?code=${roomCode}`);
      toast("room created!", {
        action: {
          label: "okay",
          onClick: () => {
            toast.dismiss();
          },
        },
      });
    } catch (error: any) {
      toast(error);
    }
  };

  return (
    <div className="w-full h-full space-y-10">
      <CustomizePlayer />

      <div className="w-full flex items-center">
        X <Separator className="w-full bg-pink-600" /> X
      </div>

      <div className="flex gap-x-8 items-center w-full h-52 text-pink-800">
        {mode === "join" ? (
          <JoinRoom setMode={setMode} />
        ) : (
          <>
            {" "}
            <button
              className="basis-1/2 flex  rounded-xl shadow-sm justify-center items-center h-full bg-pink-300/30 hover:bg-pink-500/20 transition-all duration-200 disabled:bg-gray-600/10 disabled:text-gray-400"
              onClick={() => handleToggleMode("join")}
              disabled={validationStatus !== "success" || !name}
            >
              join a private room
            </button>
            <button
              className="basis-1/2 flex  rounded-xl shadow-sm justify-center items-center h-full bg-pink-300/30 hover:bg-pink-500/20 transition-all duration-200 disabled:bg-gray-600/10 disabled:text-gray-400"
              onClick={handleCreateRoom}
              disabled={validationStatus !== "success" || !name}
            >
              create a new room
            </button>
          </>
        )}
      </div>
    </div>
  );
}
