import { create } from "zustand";

type ModalState = {
    modalType: "word-select" | "game-over" | "round-recap" | "";
    setOpen: (modalType: "word-select" | "game-over" | "round-recap" | "") => void;
}

export const useModalStore = create<ModalState>((set) => ({
    modalType: "",
    setOpen: (modalType) => set({ modalType }),
}));