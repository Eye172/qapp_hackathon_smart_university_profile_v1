import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// ─── University master data (from gemini-code SQL + enriched) ────────────────

const UNIVERSITIES = [
  {
    id: "uni_nu",
    name: "Nazarbayev University",
    nameRu: "Назарбаев Университет",
    country: "Kazakhstan",
    city: "Astana",
    founded: 2010,
    type: "Research",
    languages: "English",
    worldRank: 360,
    minGpa: 4.0,
    minIelts: 6.5,
    minSat: 1200,
    applicationDeadline: "2026-05-01",
    websiteUrl: "https://nu.edu.kz",
    contactEmail: "admissions@nu.edu.kz",
    campusPhoto: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&w=1200&q=80",
    description:
      "Ведущий исследовательский университет Казахстана, предлагающий обучение полностью на английском языке.",
    fitScore: 92,
    fitScoreBreakdown: JSON.stringify({ academic: 94, language: 90, financial: 96, interest: 88 }),
    tags: JSON.stringify(["Research", "English-medium", "Government Scholarship", "STEM-focused", "Liberal Arts Core"]),
    programsJson: JSON.stringify([
      { id: "nu_cs_ba", name: "BSc Computer Science", level: "bachelor", durationMonths: 48, tuitionUsdPerYear: 21500, language: "English", deliveryMode: "on-campus", field: "Computer Science", scholarshipAvailable: true },
      { id: "nu_ece_ba", name: "BEng Electrical & Computer Engineering", level: "bachelor", durationMonths: 48, tuitionUsdPerYear: 21500, language: "English", deliveryMode: "on-campus", field: "Electrical Engineering", scholarshipAvailable: true },
      { id: "nu_ds_ms", name: "MSc Data Science", level: "master", durationMonths: 24, tuitionUsdPerYear: 18000, language: "English", deliveryMode: "on-campus", field: "Data Science", scholarshipAvailable: true },
    ]),
    programs: [
      { name: "Computer Science", field: "Computer Science", degree: "Bachelor", duration: 4, language: "English" },
      { name: "Software Engineering", field: "Engineering", degree: "Bachelor", duration: 4, language: "English" },
      { name: "Business Administration", field: "Business", degree: "Bachelor", duration: 4, language: "English" },
      { name: "Data Science", field: "Computer Science", degree: "Bachelor", duration: 4, language: "English" },
      { name: "Electrical and Computer Engineering", field: "Engineering", degree: "Bachelor", duration: 4, language: "English" },
      { name: "Finance", field: "Business", degree: "Bachelor", duration: 4, language: "English" },
      { name: "Civil Engineering", field: "Engineering", degree: "Bachelor", duration: 4, language: "English" },
      { name: "Biological Sciences", field: "Science", degree: "Bachelor", duration: 4, language: "English" },
      { name: "Mathematics", field: "Science", degree: "Bachelor", duration: 4, language: "English" },
      { name: "Economics", field: "Business", degree: "Bachelor", duration: 4, language: "English" },
      { name: "Mechanical and Aerospace Engineering", field: "Engineering", degree: "Bachelor", duration: 4, language: "English" },
    ],
    scholarships: [
      { name: "NU Merit Scholarship", description: "Full tuition waiver for top academic achievers", covers: "100% tuition", eligibility: "GPA 4.5+ and IELTS 7.0+", minGpa: 4.5, minIelts: 7.0 },
      { name: "Need-Based Financial Aid", description: "Partial support for students with financial need", covers: "Up to 50% tuition", eligibility: "Demonstrated financial need", minGpa: 3.5, minIelts: 6.0 },
      { name: "Government Grant Bolashak", description: "State scholarship for top students", covers: "Full tuition + stipend", eligibility: "Kazakh citizenship, GPA 4.0+", minGpa: 4.0, minIelts: 6.5 },
    ],
    deadlines: [
      { label: "Application Opens", date: "2026-01-15" },
      { label: "Document Submission", date: "2026-03-01" },
      { label: "Scholarship Deadline", date: "2026-04-01" },
      { label: "Final Deadline", date: "2026-05-01" },
      { label: "Admission Decision", date: "2026-06-15" },
    ],
  },
  {
    id: "uni_kbtu",
    name: "Kazakh-British Technical University",
    nameRu: "КБТУ",
    country: "Kazakhstan",
    city: "Almaty",
    founded: 2001,
    type: "Technical",
    languages: "English, Russian",
    worldRank: 720,
    minGpa: 3.5,
    minIelts: 6.0,
    minSat: 1100,
    applicationDeadline: "2026-06-01",
    websiteUrl: "https://kbtu.kz",
    contactEmail: "admission@kbtu.kz",
    campusPhoto: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    description: "Технический вуз, ориентированный на ИТ, инженерию и бизнес с сильными связями с индустрией.",
    fitScore: 84,
    fitScoreBreakdown: JSON.stringify({ academic: 82, language: 86, financial: 90, interest: 80 }),
    tags: JSON.stringify(["Industry Partnerships", "Energy & IT", "Bilingual", "Internship Pipeline"]),
    programsJson: JSON.stringify([
      { id: "kbtu_it_ba", name: "BSc Information Systems", level: "bachelor", durationMonths: 48, tuitionUsdPerYear: 6800, language: "English", deliveryMode: "on-campus", field: "Information Systems", scholarshipAvailable: true },
      { id: "kbtu_ai_ba", name: "BSc Artificial Intelligence", level: "bachelor", durationMonths: 48, tuitionUsdPerYear: 7200, language: "English", deliveryMode: "on-campus", field: "Artificial Intelligence", scholarshipAvailable: true },
      { id: "kbtu_petro_ba", name: "BEng Petroleum Engineering", level: "bachelor", durationMonths: 48, tuitionUsdPerYear: 7400, language: "English", deliveryMode: "on-campus", field: "Petroleum Engineering", scholarshipAvailable: false },
    ]),
    programs: [
      { name: "Information Systems", field: "Computer Science", degree: "Bachelor", duration: 4, language: "English" },
      { name: "Cybersecurity", field: "Computer Science", degree: "Bachelor", duration: 4, language: "English" },
      { name: "Business and Management", field: "Business", degree: "Bachelor", duration: 4, language: "English" },
      { name: "Oil and Gas Engineering", field: "Engineering", degree: "Bachelor", duration: 4, language: "Russian" },
      { name: "Finance", field: "Business", degree: "Bachelor", duration: 4, language: "English" },
      { name: "Chemical Engineering", field: "Engineering", degree: "Bachelor", duration: 4, language: "English" },
      { name: "Applied Mathematics", field: "Science", degree: "Bachelor", duration: 4, language: "English" },
    ],
    scholarships: [
      { name: "KBTU Excellence Award", description: "Merit-based scholarship for high-achieving applicants", covers: "75% tuition", eligibility: "GPA 4.0+ or SAT 1300+", minGpa: 4.0, minIelts: 6.0 },
      { name: "IT Industry Scholarship", description: "Sponsored by tech companies for CS students", covers: "Full tuition + internship", eligibility: "CS applicants with strong academic record", minGpa: 4.0, minIelts: 6.5 },
    ],
    deadlines: [
      { label: "Application Opens", date: "2026-02-01" },
      { label: "Document Submission", date: "2026-04-15" },
      { label: "Final Deadline", date: "2026-06-01" },
      { label: "Admission Decision", date: "2026-07-01" },
    ],
  },
  {
    id: "uni_aitu",
    name: "Astana IT University",
    nameRu: "Астана АйТи Университет",
    country: "Kazakhstan",
    city: "Astana",
    founded: 2019,
    type: "Technical",
    languages: "English, Kazakh",
    worldRank: null,
    minGpa: 3.5,
    minIelts: 6.0,
    minSat: 1100,
    applicationDeadline: "2026-06-15",
    websiteUrl: "https://aitu.edu.kz",
    contactEmail: "info@aitu.edu.kz",
    campusPhoto: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    description: "Современный ИТ-университет, сфокусированный на цифровых технологиях и инновациях.",
    fitScore: 78,
    fitScoreBreakdown: JSON.stringify({ academic: 76, language: 80, financial: 88, interest: 82 }),
    tags: JSON.stringify(["IT-focused", "Digital Innovation", "Modern Campus", "Affordable"]),
    programsJson: JSON.stringify([
      { id: "aitu_ai_ba", name: "BSc Artificial Intelligence", level: "bachelor", durationMonths: 48, tuitionUsdPerYear: 5500, language: "English", deliveryMode: "on-campus", field: "Artificial Intelligence", scholarshipAvailable: true },
      { id: "aitu_se_ba", name: "BSc Software Development", level: "bachelor", durationMonths: 48, tuitionUsdPerYear: 5500, language: "English", deliveryMode: "on-campus", field: "Computer Science", scholarshipAvailable: true },
      { id: "aitu_cs_ba", name: "BSc Cybersecurity and Networks", level: "bachelor", durationMonths: 48, tuitionUsdPerYear: 5500, language: "English", deliveryMode: "on-campus", field: "Cybersecurity", scholarshipAvailable: false },
    ]),
    programs: [
      { name: "Artificial Intelligence", field: "Computer Science", degree: "Bachelor", duration: 4, language: "English" },
      { name: "Software Development", field: "Computer Science", degree: "Bachelor", duration: 4, language: "English" },
      { name: "Digital Business", field: "Business", degree: "Bachelor", duration: 3, language: "English" },
      { name: "Cybersecurity and Networks", field: "Computer Science", degree: "Bachelor", duration: 4, language: "English" },
      { name: "Game Development", field: "Computer Science", degree: "Bachelor", duration: 3, language: "English" },
      { name: "Big Data Analytics", field: "Computer Science", degree: "Bachelor", duration: 4, language: "English" },
      { name: "IT Management", field: "Business", degree: "Bachelor", duration: 4, language: "English" },
    ],
    scholarships: [
      { name: "Digital Future Grant", description: "Full scholarship for students passionate about technology", covers: "100% tuition", eligibility: "Strong interest in IT, GPA 4.0+", minGpa: 4.0, minIelts: 6.0 },
    ],
    deadlines: [
      { label: "Application Opens", date: "2026-03-01" },
      { label: "Final Deadline", date: "2026-06-15" },
      { label: "Admission Decision", date: "2026-07-15" },
    ],
  },
  {
    id: "uni_kaznu",
    name: "Al-Farabi Kazakh National University",
    nameRu: "КазНУ им. аль-Фараби",
    country: "Kazakhstan",
    city: "Almaty",
    founded: 1934,
    type: "Research",
    languages: "Kazakh, Russian, English",
    worldRank: 900,
    minGpa: 3.0,
    minIelts: 5.5,
    minSat: null,
    applicationDeadline: "2026-07-20",
    websiteUrl: "https://kaznu.kz",
    contactEmail: "info@kaznu.kz",
    campusPhoto: "https://images.unsplash.com/photo-1526958977630-b4572e3ea9e8?auto=format&fit=crop&w=1200&q=80",
    description: "Старейший и крупнейший университет страны с широким спектром специальностей.",
    fitScore: 72,
    fitScoreBreakdown: JSON.stringify({ academic: 70, language: 72, financial: 88, interest: 68 }),
    tags: JSON.stringify(["Oldest University", "Wide Program Range", "Trilingual", "Affordable", "State University"]),
    programsJson: JSON.stringify([
      { id: "kaznu_ir_ba", name: "BSc International Relations", level: "bachelor", durationMonths: 48, tuitionUsdPerYear: 2200, language: "English", deliveryMode: "on-campus", field: "Humanities", scholarshipAvailable: true },
      { id: "kaznu_bio_ba", name: "BSc Biotechnology", level: "bachelor", durationMonths: 48, tuitionUsdPerYear: 2000, language: "English", deliveryMode: "on-campus", field: "Science", scholarshipAvailable: true },
      { id: "kaznu_econ_ba", name: "BSc Economics", level: "bachelor", durationMonths: 48, tuitionUsdPerYear: 1800, language: "English", deliveryMode: "on-campus", field: "Business", scholarshipAvailable: true },
    ]),
    programs: [
      { name: "International Relations", field: "Humanities", degree: "Bachelor", duration: 4, language: "English" },
      { name: "Jurisprudence", field: "Humanities", degree: "Bachelor", duration: 4, language: "Russian" },
      { name: "Biotechnology", field: "Science", degree: "Bachelor", duration: 4, language: "English" },
      { name: "Mechanics and Mathematics", field: "Science", degree: "Bachelor", duration: 4, language: "Kazakh" },
      { name: "Journalism", field: "Humanities", degree: "Bachelor", duration: 4, language: "Kazakh" },
      { name: "Physics", field: "Science", degree: "Bachelor", duration: 4, language: "Russian" },
      { name: "Economics", field: "Business", degree: "Bachelor", duration: 4, language: "English" },
    ],
    scholarships: [
      { name: "Al-Farabi Excellence Scholarship", description: "Awarded to top performers in national and international olympiads", covers: "100% tuition + stipend", eligibility: "Olympiad winner, GPA 4.0+", minGpa: 4.0, minIelts: 6.0 },
      { name: "State Educational Grant", description: "National government grant for high UNT scorers", covers: "100% tuition", eligibility: "High UNT (Unified National Testing) score", minGpa: 3.5, minIelts: null },
    ],
    deadlines: [
      { label: "Application Opens", date: "2026-06-20" },
      { label: "Creative Exams Deadline", date: "2026-07-07" },
      { label: "Final Deadline", date: "2026-07-20" },
      { label: "Admission Decision", date: "2026-08-10" },
    ],
  },
  {
    id: "uni_mit",
    name: "Massachusetts Institute of Technology",
    nameRu: "Массачусетский технологический институт",
    country: "USA",
    city: "Cambridge",
    founded: 1861,
    type: "Research",
    languages: "English",
    worldRank: 1,
    minGpa: 4.0,
    minIelts: 7.0,
    minSat: 1500,
    applicationDeadline: "2026-01-01",
    websiteUrl: "https://web.mit.edu",
    contactEmail: "admissions@mit.edu",
    campusPhoto: "https://images.unsplash.com/photo-1569447891824-5c1dfb8b3a5e?auto=format&fit=crop&w=1200&q=80",
    description: "Один из самых престижных технических вузов мира, лидер в области ИИ и робототехники.",
    fitScore: 74,
    fitScoreBreakdown: JSON.stringify({ academic: 78, language: 85, financial: 52, interest: 90 }),
    tags: JSON.stringify(["World #1", "Research Powerhouse", "STEM Elite", "Need-Based Aid", "Silicon Valley Pipeline"]),
    programsJson: JSON.stringify([
      { id: "mit_cs_ba", name: "BSc Computer Science & Engineering", level: "bachelor", durationMonths: 48, tuitionUsdPerYear: 57986, language: "English", deliveryMode: "on-campus", field: "Computer Science", scholarshipAvailable: true },
      { id: "mit_me_ba", name: "BSc Mechanical Engineering", level: "bachelor", durationMonths: 48, tuitionUsdPerYear: 57986, language: "English", deliveryMode: "on-campus", field: "Engineering", scholarshipAvailable: true },
      { id: "mit_phys_ba", name: "BSc Physics", level: "bachelor", durationMonths: 48, tuitionUsdPerYear: 57986, language: "English", deliveryMode: "on-campus", field: "Science", scholarshipAvailable: true },
    ]),
    programs: [
      { name: "Computer Science and Engineering", field: "Computer Science", degree: "Bachelor", duration: 4, language: "English", tuitionPerYear: 57986 },
      { name: "Mechanical Engineering", field: "Engineering", degree: "Bachelor", duration: 4, language: "English", tuitionPerYear: 57986 },
      { name: "Physics", field: "Science", degree: "Bachelor", duration: 4, language: "English", tuitionPerYear: 57986 },
      { name: "Economics", field: "Business", degree: "Bachelor", duration: 4, language: "English", tuitionPerYear: 57986 },
      { name: "Biological Engineering", field: "Science", degree: "Bachelor", duration: 4, language: "English", tuitionPerYear: 57986 },
      { name: "Architecture", field: "Humanities", degree: "Bachelor", duration: 4, language: "English", tuitionPerYear: 57986 },
    ],
    scholarships: [
      { name: "MIT Need-Based Scholarship", description: "Financial assistance based on family income", covers: "Up to 100% tuition", eligibility: "Demonstrated financial need", minGpa: 4.0, minIelts: 7.0 },
    ],
    deadlines: [
      { label: "Early Action", date: "2025-11-01" },
      { label: "Regular Action", date: "2026-01-01" },
      { label: "Financial Aid Deadline", date: "2026-02-15" },
    ],
  },
  {
    id: "uni_oxford",
    name: "University of Oxford",
    nameRu: "Оксфордский университет",
    country: "United Kingdom",
    city: "Oxford",
    founded: 1096,
    type: "Research",
    languages: "English",
    worldRank: 3,
    minGpa: 4.0,
    minIelts: 7.5,
    minSat: null,
    applicationDeadline: "2025-10-15",
    websiteUrl: "https://ox.ac.uk",
    contactEmail: "undergraduate.admissions@admin.ox.ac.uk",
    campusPhoto: "https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?auto=format&fit=crop&w=1200&q=80",
    description: "Старейший англоязычный университет мира с уникальной системой тьюторства.",
    fitScore: 66,
    fitScoreBreakdown: JSON.stringify({ academic: 72, language: 80, financial: 44, interest: 76 }),
    tags: JSON.stringify(["World Top 5", "Tutorial System", "Historic Campus", "Clarendon Fund", "Elite Research"]),
    programsJson: JSON.stringify([
      { id: "ox_ppe_ba", name: "BA Philosophy, Politics & Economics", level: "bachelor", durationMonths: 36, tuitionUsdPerYear: 42000, language: "English", deliveryMode: "on-campus", field: "Humanities", scholarshipAvailable: true },
      { id: "ox_cs_ba", name: "BSc Computer Science", level: "bachelor", durationMonths: 36, tuitionUsdPerYear: 42000, language: "English", deliveryMode: "on-campus", field: "Computer Science", scholarshipAvailable: true },
      { id: "ox_math_ba", name: "BSc Mathematics", level: "bachelor", durationMonths: 36, tuitionUsdPerYear: 42000, language: "English", deliveryMode: "on-campus", field: "Science", scholarshipAvailable: true },
    ]),
    programs: [
      { name: "Philosophy, Politics and Economics (PPE)", field: "Humanities", degree: "Bachelor", duration: 3, language: "English", tuitionPerYear: 42000 },
      { name: "Computer Science", field: "Computer Science", degree: "Bachelor", duration: 3, language: "English", tuitionPerYear: 42000 },
      { name: "Jurisprudence (Law)", field: "Humanities", degree: "Bachelor", duration: 3, language: "English", tuitionPerYear: 42000 },
      { name: "Engineering Science", field: "Engineering", degree: "Bachelor", duration: 4, language: "English", tuitionPerYear: 42000 },
      { name: "Mathematics", field: "Science", degree: "Bachelor", duration: 3, language: "English", tuitionPerYear: 42000 },
      { name: "History", field: "Humanities", degree: "Bachelor", duration: 3, language: "English", tuitionPerYear: 42000 },
    ],
    scholarships: [
      { name: "Clarendon Fund", description: "Prestigious scholarship for outstanding students", covers: "100% tuition + accommodation", eligibility: "Exceptional academic achievement", minGpa: 4.0, minIelts: 7.5 },
      { name: "Rhodes Scholarship", description: "International scholarship for future leaders", covers: "Full coverage", eligibility: "Academic & leadership excellence", minGpa: 3.9, minIelts: 7.5 },
    ],
    deadlines: [
      { label: "UCAS Application Deadline", date: "2025-10-15" },
      { label: "Oxford Admission Tests", date: "2025-11-05" },
      { label: "Interviews", date: "2025-12-10" },
    ],
  },
  {
    id: "uni_tum",
    name: "Technical University of Munich",
    nameRu: "Мюнхенский технический университет",
    country: "Germany",
    city: "Munich",
    founded: 1868,
    type: "Technical",
    languages: "German, English",
    worldRank: 30,
    minGpa: 3.5,
    minIelts: 6.5,
    minSat: null,
    applicationDeadline: "2026-07-15",
    websiteUrl: "https://tum.de",
    contactEmail: "studium@tum.de",
    campusPhoto: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
    description: "Ведущий технический университет Германии, член ассоциации TU9, известный инженерными школами.",
    fitScore: 76,
    fitScoreBreakdown: JSON.stringify({ academic: 78, language: 74, financial: 88, interest: 76 }),
    tags: JSON.stringify(["TU9 Member", "Engineering Excellence", "Low Tuition", "Deutschlandstipendium", "EU Student Benefits"]),
    programsJson: JSON.stringify([
      { id: "tum_inf_ba", name: "BSc Informatics", level: "bachelor", durationMonths: 36, tuitionUsdPerYear: 700, language: "English", deliveryMode: "on-campus", field: "Computer Science", scholarshipAvailable: true },
      { id: "tum_me_ba", name: "BSc Mechanical Engineering", level: "bachelor", durationMonths: 36, tuitionUsdPerYear: 700, language: "German", deliveryMode: "on-campus", field: "Engineering", scholarshipAvailable: false },
      { id: "tum_aero_ba", name: "BSc Aerospace", level: "bachelor", durationMonths: 36, tuitionUsdPerYear: 700, language: "English", deliveryMode: "on-campus", field: "Engineering", scholarshipAvailable: false },
    ]),
    programs: [
      { name: "Informatics", field: "Computer Science", degree: "Bachelor", duration: 3, language: "English", tuitionPerYear: 700 },
      { name: "Management and Technology", field: "Business", degree: "Bachelor", duration: 3, language: "English", tuitionPerYear: 700 },
      { name: "Mechanical Engineering", field: "Engineering", degree: "Bachelor", duration: 3, language: "German", tuitionPerYear: 700 },
      { name: "Aerospace", field: "Engineering", degree: "Bachelor", duration: 3, language: "English", tuitionPerYear: 700 },
      { name: "Electrical Engineering", field: "Engineering", degree: "Bachelor", duration: 3, language: "German", tuitionPerYear: 700 },
      { name: "Bioeconomy", field: "Science", degree: "Bachelor", duration: 3, language: "English", tuitionPerYear: 700 },
    ],
    scholarships: [
      { name: "Deutschlandstipendium", description: "State talent support programme", covers: "€300/month", eligibility: "GPA 3.8+, volunteer work", minGpa: 3.8, minIelts: 6.5 },
    ],
    deadlines: [
      { label: "Winter Semester Opens", date: "2026-05-01" },
      { label: "Final Deadline", date: "2026-07-15" },
      { label: "Admission Decisions", date: "2026-08-30" },
    ],
  },
  {
    id: "uni_nus",
    name: "National University of Singapore",
    nameRu: "Национальный университет Сингапура",
    country: "Singapore",
    city: "Singapore",
    founded: 1905,
    type: "Research",
    languages: "English",
    worldRank: 8,
    minGpa: 3.8,
    minIelts: 6.5,
    minSat: 1400,
    applicationDeadline: "2026-02-28",
    websiteUrl: "https://nus.edu.sg",
    contactEmail: "admissions@nus.edu.sg",
    campusPhoto: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80",
    description: "Стабильно признается лучшим университетом Азии. Отличается глобальным подходом к образованию и мощной исследовательской базой.",
    fitScore: 70,
    fitScoreBreakdown: JSON.stringify({ academic: 74, language: 82, financial: 58, interest: 76 }),
    tags: JSON.stringify(["Asia #1", "Global Research Hub", "ASEAN Scholarship", "Tech & Business", "English-medium"]),
    programsJson: JSON.stringify([
      { id: "nus_cs_ba", name: "BSc Computer Science", level: "bachelor", durationMonths: 48, tuitionUsdPerYear: 33600, language: "English", deliveryMode: "on-campus", field: "Computer Science", scholarshipAvailable: true },
      { id: "nus_ba_ba", name: "BSc Business Administration", level: "bachelor", durationMonths: 48, tuitionUsdPerYear: 33600, language: "English", deliveryMode: "on-campus", field: "Business", scholarshipAvailable: true },
      { id: "nus_dse_ba", name: "BSc Data Science & Economics", level: "bachelor", durationMonths: 48, tuitionUsdPerYear: 33600, language: "English", deliveryMode: "on-campus", field: "Science", scholarshipAvailable: true },
    ]),
    programs: [
      { name: "Computer Science", field: "Computer Science", degree: "Bachelor", duration: 4, language: "English", tuitionPerYear: 33600 },
      { name: "Business Administration", field: "Business", degree: "Bachelor", duration: 4, language: "English", tuitionPerYear: 33600 },
      { name: "Data Science and Economics", field: "Science", degree: "Bachelor", duration: 4, language: "English", tuitionPerYear: 33600 },
      { name: "Civil Engineering", field: "Engineering", degree: "Bachelor", duration: 4, language: "English", tuitionPerYear: 33600 },
      { name: "Biomedical Engineering", field: "Engineering", degree: "Bachelor", duration: 4, language: "English", tuitionPerYear: 33600 },
      { name: "Law", field: "Humanities", degree: "Bachelor", duration: 4, language: "English", tuitionPerYear: 33600 },
    ],
    scholarships: [
      { name: "ASEAN Undergraduate Scholarship", description: "Scholarship for outstanding students from Asia", covers: "Full coverage + stipend", eligibility: "Outstanding academic achievement, leadership", minGpa: 4.0, minIelts: 7.0 },
      { name: "Science & Technology Undergraduate Scholarship", description: "For engineering and IT students", covers: "100% tuition + accommodation", eligibility: "Engineering/IT faculty, outstanding grades", minGpa: 3.9, minIelts: 6.5 },
    ],
    deadlines: [
      { label: "Application Opens", date: "2025-10-15" },
      { label: "Final Application Deadline", date: "2026-02-28" },
      { label: "Admission Decision", date: "2026-05-30" },
    ],
  },
  {
    id: "uni_tsinghua",
    name: "Tsinghua University",
    nameRu: "Университет Цинхуа",
    country: "China",
    city: "Beijing",
    founded: 1911,
    type: "Research",
    languages: "Chinese, English",
    worldRank: 20,
    minGpa: 3.8,
    minIelts: 6.5,
    minSat: 1350,
    applicationDeadline: "2025-12-15",
    websiteUrl: "https://www.tsinghua.edu.cn",
    contactEmail: "admissions@tsinghua.edu.cn",
    campusPhoto: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80",
    description: "Самый престижный технический университет Китая, лидер в области инженерии, искусственного интеллекта и точных наук.",
    fitScore: 68,
    fitScoreBreakdown: JSON.stringify({ academic: 72, language: 62, financial: 76, interest: 74 }),
    tags: JSON.stringify(["China #1", "AI & Engineering", "CGS Scholarship", "Growing Global Programs", "Top Asia Research"]),
    programsJson: JSON.stringify([
      { id: "thu_ai_ba", name: "BSc Artificial Intelligence", level: "bachelor", durationMonths: 48, tuitionUsdPerYear: 4200, language: "Chinese, English", deliveryMode: "on-campus", field: "Computer Science", scholarshipAvailable: true },
      { id: "thu_econ_ba", name: "BSc Economics and Finance", level: "bachelor", durationMonths: 48, tuitionUsdPerYear: 4200, language: "English", deliveryMode: "on-campus", field: "Business", scholarshipAvailable: true },
      { id: "thu_env_ba", name: "BSc Environmental Engineering", level: "bachelor", durationMonths: 48, tuitionUsdPerYear: 4200, language: "English", deliveryMode: "on-campus", field: "Engineering", scholarshipAvailable: false },
    ]),
    programs: [
      { name: "Artificial Intelligence", field: "Computer Science", degree: "Bachelor", duration: 4, language: "Chinese, English", tuitionPerYear: 4200 },
      { name: "Mechanical Engineering", field: "Engineering", degree: "Bachelor", duration: 4, language: "Chinese", tuitionPerYear: 4200 },
      { name: "Economics and Finance", field: "Business", degree: "Bachelor", duration: 4, language: "English", tuitionPerYear: 4200 },
      { name: "Architecture", field: "Humanities", degree: "Bachelor", duration: 5, language: "Chinese", tuitionPerYear: 4200 },
      { name: "Environmental Engineering", field: "Engineering", degree: "Bachelor", duration: 4, language: "English", tuitionPerYear: 4200 },
      { name: "Physics", field: "Science", degree: "Bachelor", duration: 4, language: "Chinese", tuitionPerYear: 4200 },
    ],
    scholarships: [
      { name: "Chinese Government Scholarship (CGS)", description: "Government scholarship for international students", covers: "100% tuition, accommodation, medical, stipend", eligibility: "Good academic record, language requirement varies by program", minGpa: 3.5, minIelts: 6.0 },
      { name: "Tsinghua University Scholarship", description: "University grant for top applicants", covers: "Full or partial tuition", eligibility: "Outstanding academic results (Top 5%)", minGpa: 3.8, minIelts: 6.5 },
    ],
    deadlines: [
      { label: "Round 1 Application Opens", date: "2025-08-25" },
      { label: "Round 1 Deadline", date: "2025-10-20" },
      { label: "Round 3 Final Deadline", date: "2025-12-15" },
      { label: "Admission Decision", date: "2026-03-15" },
    ],
  },
] as const;

// ─── Aliya's default preferences ────────────────────────────────────────────

const ALIYA_PREFERENCES = [
  { categoryKey: "countries", priority: 15, values: ["USA", "Germany", "Kazakhstan", "United Kingdom"] },
  { categoryKey: "cities", priority: 8, values: ["Cambridge", "Munich", "Astana"] },
  { categoryKey: "fields", priority: 16, values: ["Computer Science", "Artificial Intelligence"] },
  { categoryKey: "languages", priority: 10, values: ["English"] },
  { categoryKey: "minGpa", priority: 12, values: [] },
  { categoryKey: "budget", priority: 14, values: ["25000"] },
  { categoryKey: "rank", priority: 9, values: ["500"] },
  { categoryKey: "scholarship", priority: 10, values: ["Preferred"] },
  { categoryKey: "studyLevel", priority: 8, values: ["bachelor"] },
];

// ─── Seed ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱  Seeding database…");

  // ── Universities (upsert so re-seeding is safe) ────────────────────────────
  for (const u of UNIVERSITIES) {
    const { programs, scholarships, deadlines, ...uniData } = u;

    await db.university.upsert({
      where: { id: uniData.id },
      create: uniData,
      update: uniData,
    });

    // Delete old relational data, then re-create
    await db.program.deleteMany({ where: { universityId: uniData.id } });
    await db.scholarship.deleteMany({ where: { universityId: uniData.id } });
    await db.deadline.deleteMany({ where: { universityId: uniData.id } });

    for (const p of programs) {
      await db.program.create({ data: { ...p, universityId: uniData.id } });
    }
    for (const s of scholarships) {
      await db.scholarship.create({ data: { ...s, universityId: uniData.id } });
    }
    for (const d of deadlines) {
      await db.deadline.create({ data: { ...d, universityId: uniData.id } });
    }
  }
  console.log(`  ✓ ${UNIVERSITIES.length} universities with programs, scholarships, deadlines`);

  // ── Demo user: Aliya Bekova ────────────────────────────────────────────────
  const demoEmail = "aliya@qapp.kz";
  const hashedPassword = await bcrypt.hash("password123", 12);

  let aliyaUser = await db.user.findUnique({ where: { email: demoEmail } });

  if (!aliyaUser) {
    aliyaUser = await db.user.create({
      data: {
        name: "Aliya Bekova",
        email: demoEmail,
        password: hashedPassword,
        profile: {
          create: {
            fullName: "Aliya Bekova",
            nationality: "Kazakhstan",
            currentCountry: "Kazakhstan",
            gradeLevel: 11,
            gpa: 4.7,
            gpaScale: 5.0,
            ieltsOverall: 7.0,
            ieltsListening: 7.5,
            ieltsReading: 7.0,
            ieltsWriting: 6.5,
            ieltsSpeaking: 7.0,
            ieltsTakenAt: "2026-02-14",
            satTotal: 1380,
            satMath: 720,
            satEbrw: 660,
            satTakenAt: "2026-03-08",
            interests: JSON.stringify(["Computer Science", "Artificial Intelligence", "Product Design", "Entrepreneurship"]),
            preferredCountries: JSON.stringify(["United States", "United Kingdom", "Germany", "Kazakhstan"]),
            preferredStudyLevel: "bachelor",
            budgetUsdPerYear: 25000,
            documents: {
              create: [
                { kind: "transcript", fileName: "transcript_grade10.pdf", status: "verified" },
                { kind: "ielts", fileName: "ielts_certificate.pdf", status: "verified" },
                { kind: "other", fileName: "sat_score_report.pdf", status: "uploaded" },
                { kind: "passport", fileName: "passport_scan.pdf", status: "uploaded" },
                { kind: "sop", fileName: "", status: "pending" },
                { kind: "recommendation", fileName: "", status: "pending" },
              ],
            },
          },
        },
      },
    });
    console.log(`  ✓ Demo user created: ${demoEmail} / password123`);
  } else {
    console.log(`  ↩  Demo user already exists: ${demoEmail}`);
  }

  // ── Aliya's preferences ────────────────────────────────────────────────────
  for (const pref of ALIYA_PREFERENCES) {
    const cat = await db.userPreferenceCategory.upsert({
      where: { userId_categoryKey: { userId: aliyaUser.id, categoryKey: pref.categoryKey } },
      create: { userId: aliyaUser.id, categoryKey: pref.categoryKey, priority: pref.priority },
      update: { priority: pref.priority },
    });

    // Sync values: delete old, add new
    await db.userPreferenceValue.deleteMany({ where: { categoryId: cat.id } });
    for (const val of pref.values) {
      await db.userPreferenceValue.create({ data: { categoryId: cat.id, value: val } });
    }
  }
  console.log(`  ✓ Aliya's preferences seeded`);

  console.log("✅  Seed complete.\n");
  console.log("  Demo login: aliya@qapp.kz / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
