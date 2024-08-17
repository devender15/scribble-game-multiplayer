import { create } from "zustand";

type ModalState = {
    modalType: "word-select" | "game-over" | "";
    setOpen: (modalType: "word-select" | "game-over" | "") => void;
}

export const useModalStore = create<ModalState>((set) => ({
    modalType: "",
    setOpen: (modalType) => set({ modalType }),
}));