import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useModalStore } from "@/stores/modal-store";
import { useRoomStore } from "@/stores/room-store";

import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";

export default function GameOver() {
  const type = "game-over";

  const [timer, setTimer] = useState(5);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winners, setWinners] = useState<{ name: string; score: number }[]>([]);

  const { modalType, setOpen } = useModalStore();
  const { finalScores } = useRoomStore();

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (modalType !== type) {
      return;
    }

    intervalId = setInterval(() => {
      setTimer((prev) => prev - 1);
      setOpen("");
      redirect("/");
    }, 5000);

    return () => clearInterval(intervalId);
  }, [modalType]);

  useEffect(() => {
    if (modalType === type) {
      const sortedScores = Object.entries(finalScores).sort(
        (a, b) => b[1] - a[1]
      );

      const winners = sortedScores.map(([name, score]) => ({ name, score }));
      setWinners(winners);
    }
  }, [modalType, finalScores]);

  useEffect(() => {
    if (modalType === type) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [modalType]);

  return (
    <Dialog open={modalType === type}>
      <DialogContent>
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="font-normal">Game Over</DialogTitle>
        </DialogHeader>

        <div className="w-full flex flex-col items-center gap-y-4 justify-center text-xl">
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={showConfetti ? 200 : 0}
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-pink-400 to-violet-600 p-8 rounded-3xl shadow-lg max-w-md w-full relative overflow-hidden"
            >
              <h2 className="text-4xl font-extrabold text-center text-white mb-6 font-comic">
                Winners!
              </h2>
              <div className="flex justify-center items-end space-x-4 mb-8">
                {winners.map((winner, index) => (
                  <motion.div
                    key={index}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.2 }}
                    className={`flex flex-col items-center ${
                      index === 0
                        ? "order-2"
                        : index === 1
                        ? "order-1"
                        : "order-3"
                    }`}
                  >
                    <div
                      className={`bg-white rounded-lg p-2 mt-2 ${
                        index === 0 ? "h-32" : index === 1 ? "h-24" : "h-16"
                      }`}
                    >
                      <p className="font-bold text-violet-600 text-center">
                        {index + 1}
                      </p>
                    </div>
                    <p className="mt-2 text-base font-semibold text-white text-center">
                      {winner.name}
                    </p>
                    <p className="text-pink-200 text-sm font-medium">
                      {winner.score} pts
                    </p>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                className="h-4 bg-pink-300 rounded-full mb-4"
              />
              <p className="text-center text-white font-medium lowercase">
                Congratulations to all our talented artists!
              </p>
              <p className="text-center text-white font-medium lowercase">
                Game will redirect in {timer} seconds
              </p>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
