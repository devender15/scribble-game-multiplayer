import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useModalStore } from "@/stores/modal-store";
import { useRoomStore } from "@/stores/room-store";

import { useEffect, useState } from "react";

export default function NewLevel() {
  const type = "new-level";

  const [timer, setTimer] = useState(5);

  const { modalType, setOpen } = useModalStore();
  const { currentLevel } = useRoomStore();

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (modalType !== type) {
      return;
    }

    intervalId = setInterval(() => {
      setTimer((prev) => prev - 1);
      setOpen("");
    }, 5000);

    return () => clearInterval(intervalId);
  }, [modalType]);

  return (
    <Dialog open={modalType === type}>
      <DialogContent>
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="font-normal">New Level</DialogTitle>
        </DialogHeader>

        <div className="w-full flex flex-col items-center gap-y-4 justify-center text-xl">
          <p className="text-base">
            starting{" "}
            <span className="font-medium">
              Level <span className="font-normal text-lg">{currentLevel}</span>
            </span>
          </p>

          <p className="text-base">
            starting in <span className="font-medium">{timer}</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
