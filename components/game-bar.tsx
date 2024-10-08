import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useRoomStore } from "@/stores/room-store";
import { useUserStore } from "@/stores/user-store";
import GuessWord from "./guess-word";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";
import { useSocket } from "@/providers/socket-provider";
import deleteUser from "@/actions/delete-user";

import { Copy, Check, LogOut } from "lucide-react";

type GameBarProps = {
  roomCode: string;
};

export default function GameBar({ roomCode }: GameBarProps) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { socket } = useSocket();

  const { selectedWord, canDraw, drawerSelectedWord } = useRoomStore();
  const { roomUsers, name } = useUserStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    toast("room code copied !");

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const handleUserLeave = useCallback(() => {
    if (socket) {
      socket.emit("remove-user", { roomCode, username: name });
      deleteUser(name).catch((error) => {
        toast.info(error.message);
      });
      socket.disconnect();
    }
  }, [socket, name, roomCode]);

  return (
    <div className="bg-white w-full h-16 py-2 px-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-pink-600">drawit</h1>

      <div className="flex items-center gap-x-4">
        {canDraw && (
          <p className="text-center text-base text-purple-900">
            <span className="font-bold tracking-widest">{selectedWord}</span>{" "}
            <span>( {selectedWord.length} )</span>
          </p>
        )}

        {!canDraw && <GuessWord word={drawerSelectedWord} />}
      </div>

      <div className="flex items-center gap-x-4">
        <p className="my-1 flex items-center gap-x-4 p-2 bg-pink-100 rounded-full w-fit text-xs">
          Code:{" "}
          <span className="flex items-center gap-x-2 text-purple-900">
            {roomCode}{" "}
            <button
              onClick={handleCopy}
              className="bg-purple-200 rounded-full p-2"
            >
              {copied ? <Check size={10} /> : <Copy size={10} />}
            </button>
          </span>
        </p>

        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Online: {roomUsers.length}
        </Badge>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            router.push("/");
            handleUserLeave();
          }}
        >
          <LogOut size={20} />
        </Button>
      </div>
    </div>
  );
}
