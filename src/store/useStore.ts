import { create } from "zustand";
import type { IStudentProfile, IUniversityProfile } from "@/lib/types";

export interface AppState {
  student: IStudentProfile | null;
  shortlist: IUniversityProfile[];
}

export interface AppActions {
  setStudent: (student: IStudentProfile | null) => void;
  setShortlist: (universities: IUniversityProfile[]) => void;
  reset: () => void;
}

const initialState: AppState = {
  student: null,
  shortlist: [],
};

export const useAppStore = create<AppState & AppActions>((set) => ({
  ...initialState,
  setStudent: (student) => set({ student }),
  setShortlist: (shortlist) => set({ shortlist }),
  reset: () => set(initialState),
}));
