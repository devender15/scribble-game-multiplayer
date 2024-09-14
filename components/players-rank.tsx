import { useState, useEffect } from "react";

import { UserRound, Pencil } from "lucide-react";
import { motion as m } from "framer-motion";

import { useSocket } from "@/providers/socket-provider";
import { useUserStore } from "@/stores/user-store";
import { useRoomStore } from "@/stores/room-store";

import { handleFetchRoomUsers } from "@/lib/utils";

type PlayerRanking = {
  id: string;
  name: string;
  score: number;
}[];

type PlayersRankProps = {
  roomCode: string;
};

type Scores = Record<string, number>;

export default function PlayersRank({ roomCode }: PlayersRankProps) {
  const { roomUsers, setRoomUsers, name } = useUserStore();
  const { selectedWord } = useRoomStore();

  const [players, setPlayers] = useState<PlayerRanking>([]);
  const [scores, setScores] = useState<Scores>({});
  const [drawerName, setDrawerName] = useState<string>("");

  const { socket } = useSocket();

  useEffect(() => {
    handleFetchRoomUsers(roomCode, setRoomUsers);
  }, []);

  useEffect(() => {
    const updatedPlayers = roomUsers.map((user) => {
      const score = scores[user.name] || 0;

      return {
        id: user.id,
        name: user.name,
        score,
      };
    });

    const sortedPlayers = updatedPlayers.sort((a, b) => b.score - a.score);

    setPlayers(sortedPlayers);
  }, [roomUsers, scores]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("get-scores", { roomCode });

    socket.on("receive-scores", (data: Scores) => {
      setScores(data);
    });

    socket.on("whoIsDrawing", (drawerName: string) => {
      setDrawerName(drawerName);
    });
  }, [socket, selectedWord]);

  return (
    <div className="w-full h-[80%] max-h-[80%] space-y-2 p-2 overflow-y-auto">
      {players.map((player, index) => (
        <m.div
          layout
          key={player.id}
          className="flex justify-between items-start gap-x-5 w-full border py-2 px-4 rounded-xl"
        >
          <span className="font-semibold">#{index + 1}</span>
          <div>
            <p className="font-semibold">
              {player.name + `${player.name === name ? " ( you )" : ""}`}
            </p>
            <p className="text-sm">{player.score} points</p>
          </div>

          <div>
            {player.name === drawerName && (
              <div className="p-2 rounded-full bg-gray-100 animate-bounce">
                <Pencil size={15} color="blue" />
              </div>
            )}
          </div>

          <div>
            <div className="p-2 rounded-full bg-gray-100">
              <UserRound size={30} color="blue" />
            </div>
          </div>
        </m.div>
      ))}
    </div>
  );
}
