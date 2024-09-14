import { create } from "zustand";

type ModalState = {
    modalType: "word-select" | "game-over" | "round-recap" | "new-level" | "";
    setOpen: (modalType: "word-select" | "game-over" | "round-recap" | "new-level" | "") => void;
}

export const useModalStore = create<ModalState>((set) => ({
    modalType: "",
    setOpen: (modalType) => set({ modalType }),
}));