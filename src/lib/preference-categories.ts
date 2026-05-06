// Shared config for preference categories used across registration, profile, and AI evaluation.
// Both frontend and backend import from this file.

export interface PreferenceCategoryConfig {
  key: string;
  label: string;
  description: string;
  placeholder: string;
  /** null = unlimited values; number = max allowed */
  maxValues: number | null;
  inputType: "text" | "number";
  defaultPriority: number;
  /** Predefined options shown as clickable chips; if set, input is strict-select only */
  options?: string[];
}

export const PREFERENCE_CATEGORIES: PreferenceCategoryConfig[] = [
  {
    key: "countries",
    label: "Country & City",
    description: "Where do you want to study? Select countries and/or cities",
    placeholder: "Type a country or city…",
    maxValues: null,
    inputType: "text",
    defaultPriority: 15,
    options: [
      "USA", "UK", "Germany", "Canada", "Australia", "Netherlands",
      "France", "Japan", "South Korea", "Switzerland", "Singapore",
      "Kazakhstan", "China", "Sweden", "New Zealand",
      "Boston", "New York", "London", "Berlin", "Munich",
      "Toronto", "Vancouver", "Sydney", "Melbourne", "Amsterdam",
      "Paris", "Tokyo", "Seoul", "Zurich", "Almaty", "Astana",
    ],
  },
  {
    key: "fields",
    label: "Field of Study",
    description: "Academic subjects you want to pursue",
    placeholder: "Pick fields…",
    maxValues: null,
    inputType: "text",
    defaultPriority: 16,
    options: [
      "Computer Science", "Software Engineering", "Data Science",
      "Artificial Intelligence", "Cybersecurity", "Electrical Engineering",
      "Mechanical Engineering", "Civil Engineering", "Business Administration",
      "Finance", "Economics", "Medicine", "Biotechnology", "Pharmacy",
      "Law", "Psychology", "Architecture", "Design", "Mathematics",
      "Physics", "Chemistry", "Biology", "Environmental Science",
      "International Relations", "Political Science", "Journalism",
      "Education", "Social Sciences",
    ],
  },
  {
    key: "languages",
    label: "Language of Instruction",
    description: "Preferred teaching language",
    placeholder: "Pick language(s)…",
    maxValues: null,
    inputType: "text",
    defaultPriority: 10,
    options: [
      "English", "German", "French", "Dutch", "Japanese",
      "Korean", "Chinese", "Spanish", "Russian", "Arabic",
    ],
  },
  {
    key: "universityTags",
    label: "University Type & Tags",
    description: "What kind of university are you looking for?",
    placeholder: "Pick tags…",
    maxValues: null,
    inputType: "text",
    defaultPriority: 11,
    options: [
      "Research Intensive", "Top Ranked", "Public", "Private",
      "Scholarship Available", "International Community",
      "Small Class Sizes", "Industry Connections", "Strong Alumni Network",
      "Sports & Campus Life", "Urban Campus", "Rural/Suburban Campus",
      "Technology Focus", "Liberal Arts", "STEM Focus",
      "Co-op / Work-Study", "Online Options",
    ],
  },
  {
    key: "minGpa",
    label: "Minimum required GPA",
    description: "Minimum university acceptance GPA (your scale)",
    placeholder: "e.g. 3.5",
    maxValues: 1,
    inputType: "number",
    defaultPriority: 12,
  },
  {
    key: "budget",
    label: "Annual Budget (USD)",
    description: "Maximum tuition you can afford per year",
    placeholder: "e.g. 25000",
    maxValues: 1,
    inputType: "number",
    defaultPriority: 14,
  },
  {
    key: "rank",
    label: "World Rank (max)",
    description: "Maximum acceptable world university ranking",
    placeholder: "e.g. 500",
    maxValues: 1,
    inputType: "number",
    defaultPriority: 9,
  },
  {
    key: "scholarship",
    label: "Scholarship",
    description: "How important is scholarship availability?",
    placeholder: "Select importance…",
    maxValues: 1,
    inputType: "text",
    defaultPriority: 10,
    options: ["Required", "Preferred", "Optional"],
  },
  {
    key: "studyLevel",
    label: "Study Level",
    description: "Preferred degree level",
    placeholder: "Select level…",
    maxValues: 1,
    inputType: "text",
    defaultPriority: 8,
    options: ["Bachelor's", "Master's", "PhD", "Foundation / Pathway"],
  },
];

export const CATEGORY_MAP = new Map(
  PREFERENCE_CATEGORIES.map((c) => [c.key, c]),
);

/** Maximum points a user can allocate across all categories (soft limit shown as UI gauge) */
export const PRIORITY_BUDGET = 100;

/** Range for individual category priority */
export const PRIORITY_MIN = 1;
export const PRIORITY_MAX = 20;

export interface UserPreferenceData {
  id: string;
  categoryKey: string;
  label: string;
  priority: number;
  values: { id: string; value: string }[];
}
