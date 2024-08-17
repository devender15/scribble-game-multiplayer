import { useState, useEffect } from "react";

import { UserRound } from "lucide-react";
import { motion as m } from "framer-motion";

import { useSocket } from "@/providers/socket-provider";
import { useUserStore } from "@/stores/user-store";

import { handleFetchRoomUsers } from "@/lib/utils";

import { User } from "@prisma/client";

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

  const [players, setPlayers] = useState<PlayerRanking>([]);
  const [scores, setScores] = useState<Scores>({});

  const { socket } = useSocket();

  useEffect(() => {
    handleFetchRoomUsers(roomCode, setRoomUsers);
  }, []);

  useEffect(() => {
    const updatedPlayers = roomUsers.map((user) => {
      const score = scores[user.name] || 0;

      return {
        id: user.id,
        name: user.name + (user.name === name ? " ( you )" : ""),
        score,
      };
    });

    setPlayers(updatedPlayers);
  }, [roomUsers, scores]);

  useEffect(() => {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    setPlayers(sortedPlayers);
  }, [scores]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("get-scores", { roomCode });

    socket.on("receive-scores", (data: Scores) => {
      setScores(data);
    });
  }, [socket]);

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
            <p className="font-semibold">{player.name}</p>
            <p className="text-sm">{player.score} points</p>
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
