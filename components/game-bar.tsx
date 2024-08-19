import { useState } from "react";
import { toast } from "sonner";
import { useRoomStore } from "@/stores/room-store";
import GuessWord from "./guess-word";

import { Copy, Check } from "lucide-react";

type GameBarProps = {
  roomCode: string;
};

export default function GameBar({ roomCode }: GameBarProps) {
  const [copied, setCopied] = useState(false);

  const { selectedWord, canDraw, drawerSelectedWord } = useRoomStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    toast("room code copied !");

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <div className="bg-pink-300/50 w-full h-16 p-2 flex justify-between items-center">
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

      <div>
        {canDraw && (
          <p className="text-center text-base text-purple-900">
            <span className="font-bold tracking-widest">{selectedWord}</span>{" "}
            <span>( {selectedWord.length} )</span>
          </p>
        )}

        {!canDraw && <GuessWord word={drawerSelectedWord} />}
      </div>

      <div></div>
    </div>
  );
}
