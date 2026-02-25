import { create } from "zustand";

interface UIState {
  search: string;
  setSearch: (value: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  search: "",
  setSearch: (value) => set({ search: value }),
}));