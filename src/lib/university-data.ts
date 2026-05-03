export interface HipolabsRecord {
  name: string;
  country: string;
  alpha_two_code: string;
  domains: string[];
  web_pages: string[];
  "state-province": string | null;
}

export interface UniversityEnrichment {
  domain: string | null;
  website: string | null;
  countryCode: string | null;
  source: "hipolabs" | "ror" | "none";
}

const HIPOLABS_BASE = "http://universities.hipolabs.com/search";

const EMPTY: UniversityEnrichment = {
  domain: null,
  website: null,
  countryCode: null,
  source: "none",
};

export async function fetchUniversityEnrichment(
  name: string,
  country?: string,
): Promise<UniversityEnrichment> {
  if (!name) return EMPTY;

  const params = new URLSearchParams({ name });
  if (country) params.set("country", country);
  const url = `${HIPOLABS_BASE}?${params.toString()}`;

  try {
    const res = await fetch(url, {
      next: {
        tags: ["university-data", `university:${name}`],
        revalidate: 86400,
      },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return EMPTY;

    const records = (await res.json()) as HipolabsRecord[];
    const top = records[0];
    if (!top) return EMPTY;

    return {
      domain: top.domains?.[0] ?? null,
      website: top.web_pages?.[0] ?? null,
      countryCode: top.alpha_two_code ?? null,
      source: "hipolabs",
    };
  } catch {
    return EMPTY;
  }
}
