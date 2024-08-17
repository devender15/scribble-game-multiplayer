import { create } from "zustand";

type RoomStore = {
    canDraw: boolean;
    setCanDraw: (canDraw: boolean) => void;
    timeLeft: number;
    setTimeLeft: (timeLeft: number) => void;
    selectedWord: string;
    setSelectedWord: (selectedWord: string) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
    canDraw: false,
    setCanDraw: (canDraw) => set({ canDraw }),
    timeLeft: 60,
    setTimeLeft: (timeLeft) => set({ timeLeft }),
    selectedWord: "",
    setSelectedWord: (selectedWord) => set({ selectedWord }),
}));
