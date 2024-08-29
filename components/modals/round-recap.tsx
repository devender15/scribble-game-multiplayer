import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useModalStore } from "@/stores/modal-store";
import { useRoomStore } from "@/stores/room-store";

import { useEffect, useState } from "react";

export default function RoundRecap() {
  const type = "round-recap";

  const [timer, setTimer] = useState(10);

  const { modalType, setOpen } = useModalStore();
  const { drawerSelectedWord, scores } = useRoomStore();

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (modalType !== type) {
      return;
    }

    intervalId = setInterval(() => {
      setTimer((prev) => prev - 1);
      setOpen("");
    }, 10000);

    return () => clearInterval(intervalId);
  }, [modalType]);

  return (
    <Dialog open={modalType === type}>
      <DialogContent>
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="font-normal">Round Over!</DialogTitle>
        </DialogHeader>

        <div className="w-full flex flex-col items-center gap-y-4 justify-center text-xl">
          <div className="flex items-center gap-x-2 text-sm">
            <p>The word was:</p>
            <p className="font-bold">{drawerSelectedWord}</p>
          </div>
          
          <div className="text-base space-y-2">
            <p>Player scores :</p>
            <ul>
              {Object.entries(scores).map(([name, score]) => (
                <li key={name} className="font-semibold">
                  {name}: <span className="font-normal">{score}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-sm italic">next round in : {timer}s</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
