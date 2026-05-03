import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AlgorithmState {
  savedUniversities: string[];
  hiddenUniversities: string[];
  synced: boolean; // true once server data has been loaded
}

export interface AlgorithmActions {
  saveNode: (id: string) => void;
  hideNode: (id: string) => void;
  unsaveNode: (id: string) => void;
  unhideNode: (id: string) => void;
  reset: () => void;
  /** Load server state (called once on mount when authed). */
  hydrateFromServer: (
    saved: string[],
    hidden: string[],
  ) => void;
}

const INITIAL_STATE: AlgorithmState = {
  savedUniversities: [],
  hiddenUniversities: [],
  synced: false,
};

function apiCall(url: string, method = "POST") {
  fetch(url, { method }).catch(() => null); // fire-and-forget
}

export const useAlgorithmStore = create<AlgorithmState & AlgorithmActions>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      hydrateFromServer: (saved, hidden) =>
        set({ savedUniversities: saved, hiddenUniversities: hidden, synced: true }),

      saveNode: (id) => {
        set((state) =>
          state.savedUniversities.includes(id)
            ? state
            : {
                ...state,
                savedUniversities: [...state.savedUniversities, id],
                hiddenUniversities: state.hiddenUniversities.filter(
                  (existing) => existing !== id,
                ),
              },
        );
        apiCall(`/api/universities/${id}/save`, "POST");
      },

      hideNode: (id) => {
        set((state) =>
          state.hiddenUniversities.includes(id)
            ? state
            : {
                ...state,
                hiddenUniversities: [...state.hiddenUniversities, id],
                savedUniversities: state.savedUniversities.filter(
                  (existing) => existing !== id,
                ),
              },
        );
        apiCall(`/api/universities/${id}/hide`, "POST");
      },

      unsaveNode: (id) => {
        set((state) => ({
          ...state,
          savedUniversities: state.savedUniversities.filter(
            (existing) => existing !== id,
          ),
        }));
        apiCall(`/api/universities/${id}/save`, "DELETE");
      },

      unhideNode: (id) => {
        set((state) => ({
          ...state,
          hiddenUniversities: state.hiddenUniversities.filter(
            (existing) => existing !== id,
          ),
        }));
        apiCall(`/api/universities/${id}/hide`, "DELETE");
      },

      reset: () => {
        set(INITIAL_STATE);
        // No server call for reset — handled client-side only (dev utility)
      },
    }),
    {
      name: "qapp-algorithm",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        savedUniversities: state.savedUniversities,
        hiddenUniversities: state.hiddenUniversities,
        synced: state.synced,
      }),
    },
  ),
);
