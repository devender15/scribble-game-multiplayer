import { create } from "zustand";

type UserStore = {
  name: string;
  setName: (name: string) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  name: "uncle jimmy",
  setName: (name) => set({ name }),
}));
