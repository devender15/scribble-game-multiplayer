import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

import { useModalStore } from "@/stores/modal-store";
import { useRoomStore } from "@/stores/room-store";

import { useEffect, useState } from "react";

export default function RoundRecap() {
  const type = "round-recap";

  const { modalType } = useModalStore();
  const { drawerSelectedWord } = useRoomStore();

  return (
    <Dialog open={modalType === type}>
      <DialogContent>
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="font-normal">select a word</DialogTitle>
        </DialogHeader>

        <div className="w-full flex items-center gap-x-5 justify-center text-xl">
          <h1>
            Correct word : <span className="text-green-500">{drawerSelectedWord}</span>
          </h1>
        </div>
      </DialogContent>
    </Dialog>
  );
}
