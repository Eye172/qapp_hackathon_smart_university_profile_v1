import { cookies } from "next/headers";
import type { Language } from "@/store/useSettingsStore";
import { TRANSLATIONS } from "@/lib/i18n";

export async function getLang(): Promise<Language> {
  const store = await cookies();
  const val = store.get("qapp-lang")?.value;
  if (val === "en" || val === "ru" || val === "kz") return val;
  return "en";
}

export async function getServerT() {
  const lang = await getLang();
  return TRANSLATIONS[lang];
}
