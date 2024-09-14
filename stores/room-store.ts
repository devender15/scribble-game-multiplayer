import { create } from "zustand";

type RoomStore = {
    canDraw: boolean;
    setCanDraw: (canDraw: boolean) => void;
    timeLeft: number;
    setTimeLeft: (timeLeft: number) => void;
    selectedWord: string;
    setSelectedWord: (selectedWord: string) => void;
    drawerSelectedWord: string;
    setDrawerSelectedWord: (drawerSelectedWord: string) => void;
    scores: Record<string, number>;
    setScores: (scores: Record<string, number>) => void;
    currentLevel: number;
    setCurrentLevel: (currentLevel: number) => void;
    finalScores: Record<string, number>;
    setFinalScores: (finalScores: Record<string, number>) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
    canDraw: false,
    setCanDraw: (canDraw) => set({ canDraw }),
    timeLeft: 60,
    setTimeLeft: (timeLeft) => set({ timeLeft }),
    selectedWord: "",
    setSelectedWord: (selectedWord) => set({ selectedWord }),
    drawerSelectedWord: "",
    setDrawerSelectedWord: (drawerSelectedWord) => set({ drawerSelectedWord }),
    scores: {},
    setScores: (scores) => set({ scores }),
    currentLevel: 1,
    setCurrentLevel: (currentLevel) => set({ currentLevel }),
    finalScores: {},
    setFinalScores: (finalScores) => set({ finalScores }),
}));
