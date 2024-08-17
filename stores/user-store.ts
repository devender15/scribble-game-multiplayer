import { create } from "zustand";
import { User } from "@prisma/client";

type UserStore = {
  name: string;
  setName: (name: string) => void;
  errorMessage: string;
  setErrorMessage: (message: string) => void;
  validationStatus: "loading" | "success" | "error" | "idle";
  setValidationStatus: (
    status: "loading" | "success" | "error" | "idle"
  ) => void;
  debouncedName: string;
  setDebouncedName: (name: string) => void;
  message: string;
  setMessage: (message: string) => void;
  roomUsers: User[];
  setRoomUsers: (users: User[]) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  name: "",
  setName: (name) => set({ name }),
  errorMessage: "",
  setErrorMessage: (message) => set({ errorMessage: message }),
  validationStatus: "idle",
  setValidationStatus: (status) => set({ validationStatus: status }),
  debouncedName: "",
  setDebouncedName: (name) => set({ debouncedName: name }),
  message: "",
  setMessage: (message) => set({ message }),
  roomUsers: [],
  setRoomUsers: (users) => set({ roomUsers: users }),
}));
