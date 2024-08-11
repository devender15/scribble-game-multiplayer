import { create } from "zustand";

type UserStore = {
  name: string;
  setName: (name: string) => void;
  errorMessage: string;
  setErrorMessage: (message: string) => void;
  validationStatus: "loading" | "success" | "error" | "idle";
  setValidationStatus: (status: "loading" | "success" | "error" | "idle") => void;
  debouncedName: string;
  setDebouncedName: (name: string) => void;
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
}));
