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
  /** Example chips shown in Step 2 until user adds their own */
  examples?: string[];
}

export const PREFERENCE_CATEGORIES: PreferenceCategoryConfig[] = [
  {
    key: "countries",
    label: "Country/ies",
    description: "Countries you want to study in",
    placeholder: "e.g. Germany",
    maxValues: null,
    inputType: "text",
    defaultPriority: 15,
    examples: ["Kazakhstan", "Germany", "USA"],
  },
  {
    key: "cities",
    label: "City/ies",
    description: "Preferred cities",
    placeholder: "e.g. Berlin",
    maxValues: null,
    inputType: "text",
    defaultPriority: 8,
    examples: ["Astana", "Berlin", "London"],
  },
  {
    key: "fields",
    label: "Field of Study",
    description: "Academic subjects you want to pursue",
    placeholder: "e.g. Computer Science",
    maxValues: null,
    inputType: "text",
    defaultPriority: 16,
    examples: ["Computer Science", "Business", "Engineering"],
  },
  {
    key: "languages",
    label: "Language of Instruction",
    description: "Preferred teaching language",
    placeholder: "e.g. English",
    maxValues: null,
    inputType: "text",
    defaultPriority: 10,
    examples: ["English", "German"],
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
    placeholder: "Required / Preferred / Optional",
    maxValues: 1,
    inputType: "text",
    defaultPriority: 10,
    examples: ["Required", "Preferred", "Optional"],
  },
  {
    key: "studyLevel",
    label: "Study Level",
    description: "Preferred degree level",
    placeholder: "bachelor / master / phd",
    maxValues: 1,
    inputType: "text",
    defaultPriority: 8,
    examples: ["bachelor", "master", "phd"],
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
