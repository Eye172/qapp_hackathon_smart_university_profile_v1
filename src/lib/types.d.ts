export type DocumentKind =
  | "transcript"
  | "diploma"
  | "passport"
  | "ielts"
  | "toefl"
  | "sop"
  | "recommendation"
  | "cv"
  | "other";

export type DocumentStatus = "pending" | "uploaded" | "verified" | "rejected";

export interface IStudentDocument {
  id: string;
  kind: DocumentKind;
  fileName: string;
  uploadedAt: string;
  status: DocumentStatus;
  url?: string;
  sizeBytes?: number;
}

export interface IIeltsScore {
  overall: number;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  takenAt?: string;
}

export type StudyLevel = "bachelor" | "master" | "phd";

export interface ISatScore {
  total: number;
  math: number;
  evidenceBasedReadingWriting: number;
  takenAt?: string;
}

export interface IStudentProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  nationality: string;
  currentCountry: string;
  gradeLevel: number;
  gpa: number;
  gpaScale: 4.0 | 5.0 | 10.0 | 100;
  ielts: IIeltsScore;
  sat?: ISatScore;
  interests: string[];
  preferredCountries: string[];
  preferredStudyLevel: StudyLevel;
  budgetUsdPerYear?: number;
  documents: IStudentDocument[];
  createdAt: string;
  updatedAt: string;
}

export type ProgramDeliveryMode = "on-campus" | "hybrid" | "online";

export interface IUniversityProgram {
  id: string;
  name: string;
  level: StudyLevel;
  durationMonths: number;
  tuitionUsdPerYear: number;
  language: string;
  deliveryMode: ProgramDeliveryMode;
  field: string;
  scholarshipAvailable: boolean;
}

export interface IFitScoreBreakdown {
  academic: number;
  language: number;
  financial: number;
  interest: number;
}

export interface IUniversityProfile {
  id: string;
  name: string;
  nameRu?: string;
  country: string;
  city: string;
  founded?: number;
  type?: string;
  languages?: string;
  logoUrl?: string;
  heroImageUrl?: string;
  campusPhoto?: string;
  websiteUrl?: string;
  contactEmail?: string;
  worldRank?: number;
  minGpa?: number;
  minIelts?: number;
  minSat?: number;
  applicationDeadline?: string;
  description?: string;
  fitScore: number;
  recommendationScore?: number;
  fitScoreBreakdown?: IFitScoreBreakdown;
  programs: IUniversityProgram[];
  tags: string[];
  photos?: string[];            // campus photo URLs for hero slider
  statsTestScores?: {
    sat_math_25?: number | null;
    sat_math_75?: number | null;
    sat_read_25?: number | null;
    sat_read_75?: number | null;
  };
  statsDemographics?: {
    enrollment?: number;
    gender?: { male: number; female: number };
    diversity?: Record<string, number>;
  };
  statsFinancials?: {
    tuition?: number;
    room_board?: number;
    avg_after_aid?: number;
    median_earnings?: number;
  };
  statsTopMajors?: Array<{ name: string; percent: number }>;
  extendedProfile?: {
    mission?: string;
    campus_life?: string;
    housing?: string;
    career?: string;
  };
}
