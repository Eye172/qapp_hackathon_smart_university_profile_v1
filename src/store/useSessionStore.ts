import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  DocumentStatus,
  IStudentDocument,
  IStudentProfile,
} from "@/lib/types";

const NOW = new Date().toISOString();

export const MOCK_STUDENT_PROFILE: IStudentProfile = {
  id: "stu_aliya_kz",
  fullName: "Aliya Bekova",
  email: "aliya@qapp.kz",
  avatarUrl: undefined,
  nationality: "Kazakhstan",
  currentCountry: "Kazakhstan",
  gradeLevel: 11,
  gpa: 4.7,
  gpaScale: 5.0,
  ielts: {
    overall: 7.0,
    listening: 7.5,
    reading: 7.0,
    writing: 6.5,
    speaking: 7.0,
    takenAt: "2026-02-14",
  },
  sat: {
    total: 1380,
    math: 720,
    evidenceBasedReadingWriting: 660,
    takenAt: "2026-03-08",
  },
  interests: [
    "Computer Science",
    "Artificial Intelligence",
    "Product Design",
    "Entrepreneurship",
  ],
  preferredCountries: [
    "United States",
    "United Kingdom",
    "Germany",
    "Kazakhstan",
  ],
  preferredStudyLevel: "bachelor",
  budgetUsdPerYear: 25000,
  documents: [
    {
      id: "doc_transcript",
      kind: "transcript",
      fileName: "transcript_grade10.pdf",
      uploadedAt: "2026-04-10T10:24:00.000Z",
      status: "verified",
    },
    {
      id: "doc_ielts",
      kind: "ielts",
      fileName: "ielts_certificate.pdf",
      uploadedAt: "2026-04-12T08:11:00.000Z",
      status: "verified",
    },
    {
      id: "doc_sat",
      kind: "other",
      fileName: "sat_score_report.pdf",
      uploadedAt: "2026-04-15T14:02:00.000Z",
      status: "uploaded",
    },
    {
      id: "doc_passport",
      kind: "passport",
      fileName: "passport_scan.pdf",
      uploadedAt: "2026-04-20T09:00:00.000Z",
      status: "uploaded",
    },
    {
      id: "doc_sop",
      kind: "sop",
      fileName: "",
      uploadedAt: NOW,
      status: "pending",
    },
    {
      id: "doc_recommendation",
      kind: "recommendation",
      fileName: "",
      uploadedAt: NOW,
      status: "pending",
    },
  ],
  createdAt: "2026-04-01T00:00:00.000Z",
  updatedAt: NOW,
};

export interface SessionState {
  profile: IStudentProfile;
  /** true once hydrated from the real server profile */
  profileLoaded: boolean;
}

export interface SessionActions {
  updateProfile: (patch: Partial<IStudentProfile>) => void;
  updateDocumentStatus: (documentId: string, status: DocumentStatus) => void;
  resetProfile: () => void;
  /** Overwrite the whole profile from server data. */
  hydrateFromServer: (profile: IStudentProfile) => void;
}

export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set) => ({
      profile: MOCK_STUDENT_PROFILE,
      profileLoaded: false,

      hydrateFromServer: (profile) =>
        set({ profile, profileLoaded: true }),

      updateProfile: (patch) => {
        set((state) => ({
          profile: {
            ...state.profile,
            ...patch,
            updatedAt: new Date().toISOString(),
          },
        }));
        // Fire-and-forget sync to server
        fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        }).catch(() => null);
      },

      updateDocumentStatus: (documentId, status) => {
        set((state) => ({
          profile: {
            ...state.profile,
            documents: state.profile.documents.map((doc: IStudentDocument) =>
              doc.id === documentId ? { ...doc, status } : doc,
            ),
            updatedAt: new Date().toISOString(),
          },
        }));
        fetch(`/api/documents/${documentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }).catch(() => null);
      },

      resetProfile: () => set({ profile: MOCK_STUDENT_PROFILE }),
    }),
    {
      name: "qapp-session",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        profileLoaded: state.profileLoaded,
      }),
    },
  ),
);

// Re-exported for server components that need the mock profile directly
export const MOCK_SESSION_PROFILE = MOCK_STUDENT_PROFILE;
