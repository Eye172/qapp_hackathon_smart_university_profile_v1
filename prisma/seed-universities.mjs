import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n").filter(l => l.includes("="))
    .map(l => { const [k, ...v] = l.split("="); return [k.trim(), v.join("=").trim().replace(/^"|"$/g, "")]; })
);
process.env.DATABASE_URL = env.DATABASE_URL;

const p = new PrismaClient();

const J = (v) => JSON.stringify(v);

const universities = [
  // ── 1. NAZARBAYEV UNIVERSITY ────────────────────────────────────────────────
  {
    id: "uni_nu",
    name: "Nazarbayev University",
    nameRu: "Назарбаев Университет",
    city: "Astana", country: "Kazakhstan", type: "Research",
    minGpa: 4.0, minIelts: 6.5, minSat: null,
    entGrantMin: null, entPaidMin: 85,
    entSubject: "NUET (internal exam) for grant; ENT ≥85 (English) for paid",
    acceptanceRate: 67.0, studentFacultyRatio: 8.0,
    employmentRate6mo: 98.0, avgStartingSalaryUsd: 18000,
    campusSizeHa: 105.0, qsWorldRank: 600, theWorldRank: 251,
    worldRank: 600,
    websiteUrl: "https://nu.edu.kz",
    description: "Kazakhstan's flagship research university. World-class education fully in English. #1 in Kazakhstan and Central Asia.",
    tags: J(["Research","English-medium","State-Funded","STEM","Modern Campus","Urban","High-Funding"]),
    photosJson: J([
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Nazarbayev_University_campus.jpg/1280px-Nazarbayev_University_campus.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Nazarbayev_University_Library.jpg/1280px-Nazarbayev_University_Library.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Nazarbayev_University_sports_complex.JPG/1280px-Nazarbayev_University_sports_complex.JPG",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Nazarbayev_University_2.JPG/1280px-Nazarbayev_University_2.JPG",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Nazarbayev_University_entrance.jpg/1280px-Nazarbayev_University_entrance.jpg"
    ]),
    statsTestScores: J({ sat_math_25:620, sat_math_75:750, sat_read_25:580, sat_read_75:700, act_25:null, act_75:null, avg_gpa_accepted:4.5, ielts_avg:7.0, nuet_required:true, nuet_note:"NUET (Math + Critical Thinking) required for grant competition" }),
    statsDemographics: J({ enrollment:4800, undergrad:3200, grad:1600, gender:{male:48,female:52}, diversity:{kazakh:85,other_kz_ethnic:10,intl:5}, intl_student_pct:5, first_gen_pct:35 }),
    statsFinancials: J({ tuition_domestic_usd:10800, tuition_intl_usd:10800, room_board_usd:2500, avg_after_aid_usd:0, median_earnings_10y_usd:32000, grant_coverage:"Full tuition covered by state grant for eligible students", scholarships_available:true }),
    statsTopMajors: J([{name:"Computer Science",percent:22},{name:"Engineering",percent:18},{name:"Medicine",percent:14},{name:"Social Sciences",percent:12},{name:"Political Science",percent:10},{name:"Biology",percent:9},{name:"Business",percent:8},{name:"Mining & Geoscience",percent:7}]),
    extendedProfile: J({ mission:"To create a world-class research university that serves as a model for educational reform and a catalyst for innovation in Kazakhstan and Central Asia.", campus_life:"English-speaking campus with 100+ student clubs, rigorous honor code, modern labs and a strong culture of research. Students from across Kazakhstan and 40+ countries.", housing:"Guaranteed on-campus dormitories for all years. Modern, fully furnished, utilities included.", career:"98% graduate employment rate. Pipelines to Big4, MBB consulting, Google, Amazon, Chevron, and national quasigovernment institutions.", subject_ranks:[{subject:"Engineering",rank:301},{subject:"Computer Science",rank:401},{subject:"Medicine",rank:501}], notable_alumni:["Nursultan Nazarbayev (founding patron) — first President of Kazakhstan","Multiple alumni at Google, Microsoft, and McKinsey Central Asia"], admission_note:"Since 2024, NU accepts ENT (English-language, min 85/140) for paid enrollment. Grant requires NUET + IELTS ≥6.5." }),
  },

  // ── 2. ASTANA IT UNIVERSITY ─────────────────────────────────────────────────
  {
    id: "uni_aitu",
    name: "Astana IT University",
    nameRu: "Астана АТ Университеті",
    city: "Astana", country: "Kazakhstan", type: "Technical",
    minGpa: 3.5, minIelts: 5.0, minSat: null,
    entGrantMin: 80, entPaidMin: 50,
    entSubject: "Math + CS (B057 IT) or Math + Physics (B063); AET required",
    acceptanceRate: 75.0, studentFacultyRatio: 12.0,
    employmentRate6mo: 85.0, avgStartingSalaryUsd: 12000,
    campusSizeHa: 30.0, qsWorldRank: null, theWorldRank: null,
    worldRank: null,
    websiteUrl: "https://astanait.edu.kz",
    description: "Kazakhstan's leading IT university. Modern EXPO-campus, English-medium, Huawei & Cisco partnerships.",
    tags: J(["STEM","IT-Focused","English-medium","Modern Campus","State-Funded","Urban","Industry Partnerships"]),
    photosJson: J([
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Astana_IT_University.jpg/1280px-Astana_IT_University.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/EXPO_2017_pavilion_Astana.jpg/1280px-EXPO_2017_pavilion_Astana.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Nur-Sultan_city_center.jpg/1280px-Nur-Sultan_city_center.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Astana_EXPO_2017_Kazakhstan_Pavilion.jpg/1280px-Astana_EXPO_2017_Kazakhstan_Pavilion.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Astana_Baiterek_night.jpg/1280px-Astana_Baiterek_night.jpg"
    ]),
    statsTestScores: J({ ent_grant_by_program:{ B057_IT:{min_grant:80,grants_count:1347}, B058_InfoSec:{min_grant:85,grants_count:858}, B059_Comms:{min_grant:70,grants_count:234}, B063_Electrical:{min_grant:75,grants_count:298}, B044_Management:{min_grant:99,grants_count:9}, B042_Journalism:{min_grant:126,grants_count:9} }, aet_note:"AET required for all applicants. Score 25+ = direct admission.", ielts_exempt_threshold:5.0 }),
    statsDemographics: J({ enrollment:6000, undergrad:5500, grad:500, gender:{male:62,female:38}, diversity:{kazakh:88,russian:7,other:3,intl:2}, intl_student_pct:2, first_gen_pct:45 }),
    statsFinancials: J({ tuition_domestic_usd:2700, tuition_intl_usd:3500, room_board_usd:2000, avg_after_aid_usd:0, median_earnings_10y_usd:18000, discount_altyn_belgi:"30% discount", discount_ent100plus:"30% discount for ENT ≥100", discount_ielts6plus:"20% discount for IELTS ≥6.0", scholarships_available:true }),
    statsTopMajors: J([{name:"Computer Science",percent:32},{name:"Software Engineering",percent:25},{name:"Information Security",percent:18},{name:"Big Data Analytics",percent:10},{name:"IT Management",percent:8},{name:"Media Technologies",percent:7}]),
    extendedProfile: J({ mission:"To become a leading IT university in Central Asia, training highly qualified digital specialists through interdisciplinary English-medium education.", campus_life:"State-of-the-art EXPO campus. 25+ student clubs, Huawei, Cisco, Apple, Oracle labs. Military department available. 3-year intensive bachelor program.", housing:"On-campus dorms available. Astana living cost est. USD 800–1,600/month.", career:"Direct pipelines to Kazakhtelecom, Kaspi.kz, Halyk, Beeline KZ, and international tech firms. Career center active from year 1.", notable_alumni:["Young graduates entering Kaspi Bank, Beeline KZ, KazMunayGas Digital","Growing alumni base at international IT companies"], admission_note:"Step 1: Take ENT. Step 2: Take AET (free, multiple attempts). Step 3: Submit docs. Grant min: 70–85 ENT depending on program." }),
  },

  // ── 3. AL-FARABI KAZNU ──────────────────────────────────────────────────────
  {
    id: "uni_kaznu",
    name: "Al-Farabi Kazakh National University",
    nameRu: "КазНУ им. аль-Фараби",
    city: "Almaty", country: "Kazakhstan", type: "Comprehensive",
    minGpa: 3.0, minIelts: 5.5, minSat: null,
    entGrantMin: 70, entPaidMin: 50,
    entSubject: "Varies by faculty: Math+Physics, Math+CS, History, Biology etc.",
    acceptanceRate: 72.0, studentFacultyRatio: 10.0,
    employmentRate6mo: 75.0, avgStartingSalaryUsd: 10000,
    campusSizeHa: 74.0, qsWorldRank: 200, theWorldRank: 301,
    worldRank: 200,
    websiteUrl: "https://www.kaznu.kz",
    description: "The oldest and largest university in Kazakhstan, founded in 1934. 25 faculties, 25,000 students.",
    tags: J(["Comprehensive","Historical","Large Campus","Humanities","Sciences","State-Funded"]),
    photosJson: J([
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Al-Farabi_Kazakh_National_University.jpg/1280px-Al-Farabi_Kazakh_National_University.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Almaty_panorama.jpg/1280px-Almaty_panorama.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Almaty_center.jpg/1280px-Almaty_center.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Almaty_mountains.jpg/1280px-Almaty_mountains.jpg"
    ]),
    statsTestScores: J({ ent_grant_by_faculty:{ "Physics (B054)":{min_grant:70},"Mathematics (B055)":{min_grant:95},"Biology (B050)":{min_grant:81},"Chemistry (B053)":{min_grant:80},"IT (B057)":{min_grant:110},"Law (B049)":{min_grant:90},"International Relations (B040)":{min_grant:86},"Journalism (B042)":{min_grant:115},"Management (B044)":{min_grant:114},"Finance/Econ (B046)":{min_grant:98} }, ent_paid_min:50, note:"Most programs taught in Kazakh/Russian. Some English-medium tracks available." }),
    statsDemographics: J({ enrollment:25000, undergrad:18000, grad:7000, gender:{male:43,female:57}, diversity:{kazakh:78,russian:14,other_kz:5,intl:3}, intl_student_pct:3 }),
    statsFinancials: J({ tuition_domestic_usd:1700, tuition_intl_usd:2500, room_board_usd:1200, avg_after_aid_usd:0, median_earnings_10y_usd:12000, grant_coverage:"Full tuition + monthly stipend ~25,000 KZT", scholarships_available:true }),
    statsTopMajors: J([{name:"International Relations",percent:13},{name:"Law",percent:12},{name:"Biology",percent:11},{name:"Computer Science",percent:10},{name:"Journalism",percent:9},{name:"Chemistry",percent:8},{name:"Physics",percent:7},{name:"Economics",percent:7},{name:"History",percent:6},{name:"Mathematics",percent:5}]),
    extendedProfile: J({ mission:"The oldest and largest university in Kazakhstan, established 1934. A leading comprehensive institution in Eurasia.", campus_life:"Large 74-hectare campus in Almaty foothills. 350+ student organizations, sports complex, 25 faculties. Multilingual environment (Kazakh, Russian, English).", housing:"Extensive dormitory network on and near campus. Very affordable.", career:"Strong alumni network across government, public sector, academia, and corporate Kazakhstan. Largest graduate base in the country.", subject_ranks:[{subject:"Natural Sciences",rank:200},{subject:"Arts & Humanities",rank:251}], notable_alumni:["Kassym-Jomart Tokayev — President of Kazakhstan","Akezhan Kazhegeldin — former Prime Minister of Kazakhstan","Multiple rectors and ministers across Central Asia"] }),
  },

  // ── 4. KBTU ─────────────────────────────────────────────────────────────────
  {
    id: "uni_kbtu",
    name: "Kazakh-British Technical University",
    nameRu: "КБТУ",
    city: "Almaty", country: "Kazakhstan", type: "Technical",
    minGpa: 3.5, minIelts: 5.5, minSat: null,
    entGrantMin: 110, entPaidMin: 60,
    entSubject: "Math+Physics (B057 IT, B063), Math+CS, Math+Chemistry (B060)",
    acceptanceRate: 70.0, studentFacultyRatio: 9.0,
    employmentRate6mo: 88.0, avgStartingSalaryUsd: 14000,
    campusSizeHa: 4.5, qsWorldRank: 601, theWorldRank: 801,
    worldRank: 601,
    websiteUrl: "https://kbtu.edu.kz",
    description: "Top technical university with British academic standards. Deep energy and IT industry ties.",
    tags: J(["Technical","Urban","Industry Partnerships","Energy & IT","Bilingual","Business"]),
    photosJson: J([
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/KBTU_Almaty.jpg/1280px-KBTU_Almaty.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Almaty_panorama.jpg/1280px-Almaty_panorama.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Almaty_center.jpg/1280px-Almaty_center.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Almaty_mountains.jpg/1280px-Almaty_mountains.jpg"
    ]),
    statsTestScores: J({ ent_grant_by_program:{ "IT (B057)":{min_grant:110,grants_count:800},"Finance/Econ (B046)":{min_grant:116,grants_count:95},"Management (B044)":{min_grant:117,grants_count:27},"Electrical (B063)":{min_grant:110,grants_count:305},"Chemical Engineering (B060)":{min_grant:86,grants_count:54},"Mining (B071)":{min_grant:75,grants_count:538} }, ent_paid_min:60, ielts_required:true, ielts_min:5.5, london_program_note:"University of London programs available WITHOUT ENT requirement" }),
    statsDemographics: J({ enrollment:4200, undergrad:3500, grad:700, gender:{male:60,female:40}, diversity:{kazakh:82,russian:12,other:4,intl:2}, intl_student_pct:2 }),
    statsFinancials: J({ tuition_domestic_usd:3900, tuition_intl_usd:4500, room_board_usd:1800, avg_after_aid_usd:2000, median_earnings_10y_usd:16000, scholarships_available:true, kazenergy_grant:"KAZENERGY Association annual scholarship competition for paid-track students" }),
    statsTopMajors: J([{name:"Information Technology",percent:28},{name:"Petroleum Engineering",percent:20},{name:"Finance",percent:15},{name:"Electrical Engineering",percent:13},{name:"Management",percent:10},{name:"Chemical Engineering",percent:8},{name:"Mining Engineering",percent:6}]),
    extendedProfile: J({ mission:"Providing specialized technical and business education at British academic standards, serving the energy and digital economy of Kazakhstan.", campus_life:"Historic building in central Almaty. Strong corporate culture, close industry ties, British Council partnership. English-medium instruction.", housing:"Limited dorms. Private accommodation typical in Almaty center (~60,000–100,000 KZT/month).", career:"Direct pipelines to KazMunayGas, Chevron, Shell, Kaspi Bank, and top IT firms. KAZENERGY grants available.", subject_ranks:[{subject:"Engineering & Technology",rank:451},{subject:"Computer Science",rank:501}], notable_alumni:["Multiple executives at KazMunayGas and energy sector companies","Graduates in Shell, Schlumberger, Chevron Kazakhstan"] }),
  },

  // ── 5. KIMEP ─────────────────────────────────────────────────────────────────
  {
    id: "uni_kimep",
    name: "KIMEP University",
    nameRu: "КИМЭП Университет",
    city: "Almaty", country: "Kazakhstan", type: "Liberal Arts",
    minGpa: 3.0, minIelts: 5.5, minSat: null,
    entGrantMin: null, entPaidMin: null,
    entSubject: "No ENT required — KIMEP uses KEE (own exam) + IELTS/TOEFL",
    acceptanceRate: 80.0, studentFacultyRatio: 14.0,
    employmentRate6mo: 93.0, avgStartingSalaryUsd: 13000,
    campusSizeHa: 5.0, qsWorldRank: 1001, theWorldRank: null,
    worldRank: 1001,
    websiteUrl: "https://www.kimep.kz",
    description: "Leading English-medium university for business and social sciences in Central Asia. North American model, FIBAA accredited.",
    tags: J(["Business","Liberal Arts","English-medium","Urban","International Faculty","North American Model"]),
    photosJson: J([
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Almaty_panorama.jpg/1280px-Almaty_panorama.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Almaty_center.jpg/1280px-Almaty_center.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Almaty_Medeo_arena.jpg/1280px-Almaty_Medeo_arena.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Almaty_mountains.jpg/1280px-Almaty_mountains.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Almaty_Big_Almaty_Lake.jpg/1280px-Almaty_Big_Almaty_Lake.jpg"
    ]),
    statsTestScores: J({ ent_required:false, own_exam:"KEE (KIMEP Entrance Examination) — Math, English, Logic", ielts_min:5.5, toefl_min:46, note:"No ENT required. Admission based on KEE scores + English proficiency." }),
    statsDemographics: J({ enrollment:3000, undergrad:2200, grad:800, gender:{male:45,female:55}, diversity:{kazakh:60,russian:20,other_kz:10,intl:10}, intl_student_pct:10, intl_faculty_countries:27 }),
    statsFinancials: J({ tuition_domestic_usd:5458, tuition_intl_usd:5458, room_board_usd:2500, avg_after_aid_usd:3000, median_earnings_10y_usd:20000, scholarships_available:true, note:"Merit and need-based scholarships available. Financial aid programs exist." }),
    statsTopMajors: J([{name:"Business Administration",percent:35},{name:"Finance & Accounting",percent:20},{name:"Law",percent:18},{name:"Journalism & Media",percent:12},{name:"Social Sciences",percent:10},{name:"Computer Science",percent:5}]),
    extendedProfile: J({ mission:"The largest North American-style university in Central Asia, providing English-medium business and social science education since 1992.", campus_life:"Urban campus in central Almaty. Largest English-language library in CIS (102,000+ volumes). 41+ student organizations, sports center.", housing:"On-campus dorm for 424 students. Private apartments typical for others.", career:"95% employment rate within 6 months. Strong network in banking, consulting, law, and government. 160+ partner universities globally.", notable_alumni:["Chan-Young Bang — founding president, former advisor to President Nazarbayev","15,000+ alumni across government, banking, consulting, and international organizations"] }),
  },

  // ── 6. MIT ───────────────────────────────────────────────────────────────────
  {
    id: "uni_mit",
    name: "Massachusetts Institute of Technology",
    nameRu: "Массачусетский технологический институт",
    city: "Cambridge", country: "USA", type: "Research",
    minGpa: 4.0, minIelts: 7.5, minSat: 1540,
    entGrantMin: null, entPaidMin: null, entSubject: null,
    acceptanceRate: 4.5, studentFacultyRatio: 3.0,
    employmentRate6mo: 94.0, avgStartingSalaryUsd: 115000,
    campusSizeHa: 168.0, qsWorldRank: 1, theWorldRank: 5,
    worldRank: 1,
    websiteUrl: "https://web.mit.edu",
    description: "#1 ranked university globally (QS 2025). The world's leading STEM institution.",
    tags: J(["STEM","Elite","Research","Urban","High-Funding","Innovation Hub","Need-Blind"]),
    photosJson: J([
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/MIT_dome_night_2.jpg/1280px-MIT_dome_night_2.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/MIT_Building_10_and_the_Great_Dome%2C_Cambridge_MA.jpg/1280px-MIT_Building_10_and_the_Great_Dome%2C_Cambridge_MA.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/MIT_Killian_Court_2.jpg/1280px-MIT_Killian_Court_2.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/MIT_stata_center.jpg/1280px-MIT_stata_center.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/MIT_Media_Lab_building.jpg/1280px-MIT_Media_Lab_building.jpg"
    ]),
    statsTestScores: J({ sat_math_25:790, sat_math_75:800, sat_read_25:740, sat_read_75:780, sat_composite_25:1530, sat_composite_75:1580, act_25:35, act_75:36, avg_gpa_accepted:4.17, pct_top10_hs:97, note:"SAT/ACT required since 2025-2026 cycle. Need-blind for intl students." }),
    statsDemographics: J({ enrollment:11858, undergrad:4638, grad:7220, gender:{male:52,female:48}, diversity:{asian_american:38,white:23,hispanic:13,black:6,two_or_more:7,intl:11}, intl_student_pct:11, intl_undergrad_pct:12, first_gen_pct:20, pell_grant_pct:27, tuition_free_pct:45 }),
    statsFinancials: J({ tuition_domestic_usd:63826, tuition_intl_usd:63826, room_board_usd:20500, avg_after_aid_usd:17500, median_earnings_10y_usd:135000, need_blind_intl:true, financial_aid_budget_usd:167300000, note:"Families earning <$200K attend tuition-free (2025-26)." }),
    statsTopMajors: J([{name:"Computer Science",percent:26},{name:"Electrical Engineering",percent:18},{name:"Mechanical Engineering",percent:10},{name:"Mathematics",percent:9},{name:"Physics",percent:8},{name:"Biology",percent:7},{name:"Economics",percent:6},{name:"Aerospace Eng.",percent:5},{name:"Chemical Eng.",percent:4},{name:"Architecture",percent:3}]),
    extendedProfile: J({ mission:"To advance knowledge and educate students in science, technology, and other areas of scholarship that will best serve the nation and the world.", campus_life:"168-acre urban campus in Cambridge. 500+ student clubs, 31 sports teams, world-renowned hackathons and research groups. Strong hacker culture.", housing:"All freshmen guaranteed housing. 97% of undergrads live on campus. 11 residential halls.", career:"Produces more venture-backed founders per capita than any university. Median earnings $135K at 10 years.", subject_ranks:[{subject:"Engineering",rank:1},{subject:"Computer Science",rank:1},{subject:"Mathematics",rank:1},{subject:"Physics",rank:3}], notable_alumni:["Richard Feynman — Nobel Prize Physics","Kofi Annan — UN Secretary-General","Buzz Aldrin — Apollo 11 Astronaut","Drew Houston — Co-founder of Dropbox","Salman Khan — Founder of Khan Academy"] }),
  },

  // ── 7. STANFORD ──────────────────────────────────────────────────────────────
  {
    id: "uni_stanford",
    name: "Stanford University",
    nameRu: "Стэнфордский университет",
    city: "Stanford", country: "USA", type: "Research",
    minGpa: 4.0, minIelts: 7.5, minSat: 1500,
    entGrantMin: null, entPaidMin: null, entSubject: null,
    acceptanceRate: 3.7, studentFacultyRatio: 5.0,
    employmentRate6mo: 95.0, avgStartingSalaryUsd: 120000,
    campusSizeHa: 3310.0, qsWorldRank: 5, theWorldRank: 4,
    worldRank: 5,
    websiteUrl: "https://stanford.edu",
    description: "#5 globally (QS 2025). The heart of Silicon Valley innovation.",
    tags: J(["Elite","STEM","Business","Silicon Valley","Innovation Hub","High-Funding","Research"]),
    photosJson: J([
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Stanford_University%2C_Stanford%2C_CA_-_panoramio_%283%29.jpg/1280px-Stanford_University%2C_Stanford%2C_CA_-_panoramio_%283%29.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Stanford_Memorial_Church_front.jpg/1280px-Stanford_Memorial_Church_front.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Stanford_Oval_and_Memorial_Church.jpg/1280px-Stanford_Oval_and_Memorial_Church.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Stanford_Hoover_Tower.jpg/1280px-Stanford_Hoover_Tower.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Stanford_Green_Library.jpg/1280px-Stanford_Green_Library.jpg"
    ]),
    statsTestScores: J({ sat_math_25:770, sat_math_75:800, sat_read_25:740, sat_read_75:790, sat_composite_25:1500, sat_composite_75:1580, act_25:34, act_75:36, avg_gpa_accepted:3.96, note:"SAT/ACT required from 2025-26 cycle (Class of 2030)." }),
    statsDemographics: J({ enrollment:17680, undergrad:7761, grad:9919, gender:{male:50,female:50}, diversity:{asian:25,white:20,hispanic:17,black:8,intl:24,two_or_more:6}, intl_student_pct:24, first_gen_pct:18 }),
    statsFinancials: J({ tuition_domestic_usd:62484, tuition_intl_usd:62484, room_board_usd:22000, avg_after_aid_usd:16000, median_earnings_10y_usd:130000, need_blind_intl:true, note:"Full financial need met for all admitted students. No loans in aid packages." }),
    statsTopMajors: J([{name:"Computer Science",percent:21},{name:"Human Biology",percent:10},{name:"Economics",percent:9},{name:"Engineering (gen.)",percent:9},{name:"Political Science",percent:7},{name:"Psychology",percent:7},{name:"Mathematics",percent:6},{name:"Electrical Eng.",percent:5},{name:"Biology",percent:5},{name:"Physics",percent:4}]),
    extendedProfile: J({ mission:"To promote the public welfare by exercising an influence on behalf of humanity through education and research.", campus_life:"3,310-acre suburban campus in Silicon Valley. 650+ student organizations, 36 varsity sports, thriving startup culture. Stanford entrepreneurs have founded companies worth $2.7T.", housing:"97% of undergrads live on campus for 4 years. Unique themed dorms.", career:"The epicenter of Silicon Valley. More Fortune 500 CEOs than any other university. Median 10-year earnings: $130K+.", subject_ranks:[{subject:"Computer Science",rank:2},{subject:"Engineering",rank:3},{subject:"Business (MBA)",rank:2}], notable_alumni:["Elon Musk (attended graduate school) — Tesla, SpaceX","Larry Page & Sergey Brin — founders of Google","Jerry Yang — co-founder of Yahoo","Phil Knight — founder of Nike","Reed Hastings — co-founder of Netflix"] }),
  },

  // ── 8. HARVARD ───────────────────────────────────────────────────────────────
  {
    id: "uni_harvard",
    name: "Harvard University",
    nameRu: "Гарвардский университет",
    city: "Cambridge", country: "USA", type: "Research",
    minGpa: 4.0, minIelts: 7.5, minSat: 1520,
    entGrantMin: null, entPaidMin: null, entSubject: null,
    acceptanceRate: 4.2, studentFacultyRatio: 7.0,
    employmentRate6mo: 93.0, avgStartingSalaryUsd: 100000,
    campusSizeHa: 85.0, qsWorldRank: 4, theWorldRank: 2,
    worldRank: 4,
    websiteUrl: "https://harvard.edu",
    description: "The world's most prestigious university. Founded 1636. Ivy League. #4 QS, #2 THE (2025).",
    tags: J(["Elite","Historical","Ivy League","Humanities","Law","High-Funding","Research"]),
    photosJson: J([
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Harvard_University_-_Widener_Library.jpg/1280px-Harvard_University_-_Widener_Library.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Harvard_University_administration_building.jpg/1280px-Harvard_University_administration_building.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Harvard_Yard.JPG/1280px-Harvard_Yard.JPG",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Harvard_Law_School_Austin_Hall.jpg/1280px-Harvard_Law_School_Austin_Hall.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Harvard_Science_Center.jpg/1280px-Harvard_Science_Center.jpg"
    ]),
    statsTestScores: J({ sat_math_25:770, sat_math_75:800, sat_read_25:740, sat_read_75:780, sat_composite_25:1510, sat_composite_75:1580, act_25:34, act_75:36, avg_gpa_accepted:3.97, pct_4_0_gpa:72, pct_top10_hs:94, note:"SAT/ACT required from 2024-25 cycle (Class of 2029)." }),
    statsDemographics: J({ enrollment:23731, undergrad:7038, grad:16693, gender:{male:49,female:51}, diversity:{asian:23,white:30,hispanic:11,black:9,intl:16,two_or_more:8,unknown:3}, intl_student_pct:16, first_gen_pct:20, pell_grant_pct:22 }),
    statsFinancials: J({ tuition_domestic_usd:59950, tuition_intl_usd:59950, room_board_usd:21000, avg_after_aid_usd:16000, median_earnings_10y_usd:100000, need_blind_intl:false, tuition_free_pct:45, note:"Families earning <$200K attend tuition-free from 2025-26. Families <$100K pay nothing." }),
    statsTopMajors: J([{name:"Social Sciences",percent:20},{name:"Natural Sciences",percent:18},{name:"Engineering",percent:15},{name:"Economics",percent:14},{name:"Government",percent:10},{name:"Computer Science",percent:11},{name:"History",percent:6},{name:"Psychology",percent:6}]),
    extendedProfile: J({ mission:"To educate the citizens and citizen-leaders for our society through the transformative power of a liberal arts and sciences education.", campus_life:"Historic residential house system. Formal dinners, intense intellectual culture, one of the richest alumni networks on Earth. 450+ student organizations.", housing:"Residential house system — students live in one of 12 historic houses for 3 years. Guaranteed 4-year housing.", career:"Elite pipelines to Wall Street, law, medicine, politics, and venture capital. #1 for producing billionaires globally.", subject_ranks:[{subject:"Law",rank:1},{subject:"Economics",rank:1},{subject:"Medicine",rank:1},{subject:"Business (MBA)",rank:1}], notable_alumni:["Barack Obama — 44th President of the United States","Mark Zuckerberg — founder of Meta (Facebook)","Natalie Portman — Academy Award-winning actress","Bill Gates (attended, did not graduate) — co-founder of Microsoft","Malala Yousafzai — Nobel Peace Prize laureate"] }),
  },

  // ── 9. OXFORD ────────────────────────────────────────────────────────────────
  {
    id: "uni_oxford",
    name: "University of Oxford",
    nameRu: "Оксфордский университет",
    city: "Oxford", country: "UK", type: "Research",
    minGpa: 4.0, minIelts: 7.5, minSat: 1470,
    entGrantMin: null, entPaidMin: null, entSubject: null,
    acceptanceRate: 14.0, studentFacultyRatio: 11.0,
    employmentRate6mo: 91.0, avgStartingSalaryUsd: 55000,
    campusSizeHa: 100.0, qsWorldRank: 3, theWorldRank: 1,
    worldRank: 3,
    websiteUrl: "https://ox.ac.uk",
    description: "The oldest English-speaking university (est. 1096). #1 THE, #3 QS globally (2025).",
    tags: J(["Elite","Historical","Collegiate","Humanities","Global","High-Funding","Research"]),
    photosJson: J([
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Oxford_University_-_New_College.jpg/1280px-Oxford_University_-_New_College.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Radcliffe_Camera_Oxford.jpg/1280px-Radcliffe_Camera_Oxford.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Bodleian_Library_Oxford.jpg/1280px-Bodleian_Library_Oxford.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Christchurch_College_Dining_Hall.jpg/1280px-Christchurch_College_Dining_Hall.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Sheldonian_Theatre_from_Hertford_bridge.jpg/1280px-Sheldonian_Theatre_from_Hertford_bridge.jpg"
    ]),
    statsTestScores: J({ sat_math_25:730, sat_math_75:800, sat_read_25:720, sat_read_75:790, act_25:33, act_75:36, avg_gpa_accepted:4.0, note:"Oxford uses A-levels (A*A*A typical) or IB (38–40 points). SAT/ACT for intl applicants without UK qualifications. IELTS ≥7.5 required." }),
    statsDemographics: J({ enrollment:26000, undergrad:11955, grad:14045, gender:{male:51,female:49}, diversity:{uk_white:55,uk_bame:20,intl:25}, intl_student_pct:46, first_gen_pct:12 }),
    statsFinancials: J({ tuition_domestic_usd:11700, tuition_intl_usd:40000, room_board_usd:16000, avg_after_aid_usd:28000, median_earnings_10y_usd:85000, note:"UK domestic: £9,250/yr. International: £26,770–£39,010 depending on course." }),
    statsTopMajors: J([{name:"PPE (Politics, Philosophy, Econ)",percent:14},{name:"Law",percent:12},{name:"Medicine",percent:11},{name:"History",percent:9},{name:"Computer Science",percent:8},{name:"Mathematics",percent:8},{name:"Engineering",percent:7},{name:"Biology",percent:7},{name:"Chemistry",percent:7},{name:"Modern Languages",percent:6}]),
    extendedProfile: J({ mission:"The advancement of learning by teaching and research and its dissemination by every means.", campus_life:"Tutorial system (1-on-1 or 2-on-1 teaching). 39 colleges, each with dining hall and social life. Formal hall dinners, debating societies (Oxford Union). 8 weeks per term.", housing:"Guaranteed accommodation in college for first year. Historic college buildings.", career:"Top 3 most targeted university by elite employers globally. Prime Minister pipeline. Top employer prestige worldwide.", subject_ranks:[{subject:"Law",rank:1},{subject:"Medicine",rank:2},{subject:"Humanities",rank:1},{subject:"Computer Science",rank:5}], notable_alumni:["27 UK Prime Ministers including Boris Johnson and Theresa May","Stephen Hawking — theoretical physicist","Malala Yousafzai — Nobel Peace Prize laureate","Hugh Grant, Emma Watson — actors","Oscar Wilde, J.R.R. Tolkien — authors"] }),
  },

  // ── 10. ETH ZURICH ───────────────────────────────────────────────────────────
  {
    id: "uni_eth",
    name: "ETH Zurich",
    nameRu: "Швейцарская высшая техническая школа Цюрих",
    city: "Zurich", country: "Switzerland", type: "Technical",
    minGpa: 3.8, minIelts: 7.0, minSat: 1450,
    entGrantMin: null, entPaidMin: null, entSubject: null,
    acceptanceRate: 8.0, studentFacultyRatio: 9.0,
    employmentRate6mo: 92.0, avgStartingSalaryUsd: 95000,
    campusSizeHa: 93.0, qsWorldRank: 7, theWorldRank: 11,
    worldRank: 7,
    websiteUrl: "https://ethz.ch",
    description: "#7 globally (QS 2025). Europe's MIT. Home to 21 Nobel laureate alumni. Tuition only $1,600/yr.",
    tags: J(["Technical","European","Low-Tuition","STEM","Nobel Laureates","Research","Global"]),
    photosJson: J([
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/ETH_Zurich_from_Polyterasse.jpg/1280px-ETH_Zurich_from_Polyterasse.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/ETH_Zentrum_Gebaeude_0.jpg/1280px-ETH_Zentrum_Gebaeude_0.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/ETH_Z%C3%BCrich_im_Abendlicht.jpg/1280px-ETH_Z%C3%BCrich_im_Abendlicht.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Zurich_Lake_and_Alps.jpg/1280px-Zurich_Lake_and_Alps.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Zurich_city_center.jpg/1280px-Zurich_city_center.jpg"
    ]),
    statsTestScores: J({ sat_math_25:740, sat_math_75:800, sat_read_25:680, sat_read_75:760, act_25:33, act_75:36, avg_gpa_accepted:3.9, note:"Admission primarily via Swiss Matura or equivalent European qualifications. International applicants need A-levels, IB, or equivalent." }),
    statsDemographics: J({ enrollment:22000, undergrad:9300, grad:12700, gender:{male:68,female:32}, diversity:{swiss:60,eu:25,non_eu_intl:15}, intl_student_pct:40, phd_students:4200 }),
    statsFinancials: J({ tuition_domestic_usd:1600, tuition_intl_usd:1600, room_board_usd:26000, avg_after_aid_usd:1600, median_earnings_10y_usd:120000, note:"Tuition only ~$1,600/yr — extremely affordable. BUT Zurich living costs are very high (~$26K+/yr). Excellence Scholarship available." }),
    statsTopMajors: J([{name:"Computer Science",percent:20},{name:"Mechanical Engineering",percent:18},{name:"Electrical Engineering",percent:14},{name:"Physics",percent:12},{name:"Mathematics",percent:10},{name:"Architecture",percent:9},{name:"Chemistry",percent:8},{name:"Biology",percent:6},{name:"Environmental Science",percent:3}]),
    extendedProfile: J({ mission:"ETH Zurich serves the public, society, and science. It fosters independent thinking and helps address the great challenges of our time.", campus_life:"Split between Zentrum (city center) and Hönggerberg campuses. Stunning alpine environment. Strong research culture with 21 Nobel laureate alumni.", housing:"Expensive city. Early application for student housing essential. Housing via WOKO student housing foundation.", career:"Global elite engineering reputation. Strong ties to Swiss industry (Roche, Nestlé, ABB, Google Zurich). High Swiss salaries.", subject_ranks:[{subject:"Engineering & Technology",rank:4},{subject:"Computer Science",rank:5},{subject:"Physics",rank:8}], notable_alumni:["Albert Einstein — Nobel Prize Physics (studied and taught here)","John von Neumann — mathematician","21 Nobel laureates total","Wilhelm Röntgen — discovered X-rays"] }),
  },

  // ── 11. TSINGHUA ─────────────────────────────────────────────────────────────
  {
    id: "uni_tsinghua",
    name: "Tsinghua University",
    nameRu: "Университет Цинхуа",
    city: "Beijing", country: "China", type: "Research",
    minGpa: 3.8, minIelts: 6.5, minSat: 1350,
    entGrantMin: null, entPaidMin: null, entSubject: null,
    acceptanceRate: 25.0, studentFacultyRatio: 14.0,
    employmentRate6mo: 90.0, avgStartingSalaryUsd: 30000,
    campusSizeHa: 394.0, qsWorldRank: 20, theWorldRank: 12,
    worldRank: 20,
    websiteUrl: "https://www.tsinghua.edu.cn",
    description: "China's most prestigious university. #20 QS (2025). The MIT of China.",
    tags: J(["Elite","Asian-Hub","STEM","High-Funding","Large Campus","Research"]),
    photosJson: J([
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Tsinghua_University_-_main_gate.jpg/1280px-Tsinghua_University_-_main_gate.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Tsinghua_University_2011_summer.jpg/1280px-Tsinghua_University_2011_summer.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Tsinghua_University_4.jpg/1280px-Tsinghua_University_4.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Tsinghua_University_Research_Building.jpg/1280px-Tsinghua_University_Research_Building.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Beijing_panorama.jpg/1280px-Beijing_panorama.jpg"
    ]),
    statsTestScores: J({ gaokao_note:"Domestic admission entirely through Gaokao. Only top ~0.03% of all Gaokao takers admitted to Tsinghua.", sat_math_25:700, sat_math_75:790, sat_read_25:640, sat_read_75:730, intl_admission_note:"International students admitted via separate process. Acceptance ~25-30% for internationals.", avg_gpa_accepted:3.9 }),
    statsDemographics: J({ enrollment:48739, undergrad:16000, grad:20000, phd:12739, gender:{male:67,female:33}, diversity:{chinese:92,intl:8}, intl_student_pct:8 }),
    statsFinancials: J({ tuition_domestic_usd:4200, tuition_intl_usd:5500, room_board_usd:3000, avg_after_aid_usd:4000, median_earnings_10y_usd:45000, note:"Very low domestic tuition. Chinese Government Scholarship (CGS) covers full tuition + living allowance for international students." }),
    statsTopMajors: J([{name:"Computer Science & AI",percent:20},{name:"Electrical Engineering",percent:16},{name:"Civil Engineering",percent:13},{name:"Mechanical Engineering",percent:12},{name:"Architecture",percent:8},{name:"Physics",percent:8},{name:"Chemistry",percent:7},{name:"Economics & Management",percent:7},{name:"Environmental Eng.",percent:5},{name:"Biological Sciences",percent:4}]),
    extendedProfile: J({ mission:"Self-discipline and Social Commitment (行胜于言). Serving China and humanity through excellence in research and education.", campus_life:"394-hectare campus with historic imperial gardens. Extremely competitive environment. Strong emphasis on STEM research. Deep ties to Chinese government and tech industry.", housing:"International student dorms available. Affordable campus accommodation.", career:"The MIT of China. Direct pipelines to Alibaba, Tencent, Huawei, Baidu, and Chinese government institutions. Strong globally for grad school (MIT, Stanford, Harvard pipelines).", subject_ranks:[{subject:"Engineering",rank:4},{subject:"Computer Science",rank:5},{subject:"Architecture",rank:2}], notable_alumni:["Xi Jinping — President of China (Chemical Engineering)","Hu Jintao — former President of China (Hydraulic Engineering)","Ren Zhengfei — founder of Huawei","Yang Chen-Ning — Nobel Prize Physics"] }),
  },

  // ── 12. TUM ──────────────────────────────────────────────────────────────────
  {
    id: "uni_tum",
    name: "Technical University of Munich",
    nameRu: "Мюнхенский технический университет",
    city: "Munich", country: "Germany", type: "Technical",
    minGpa: 3.5, minIelts: 6.5, minSat: 1300,
    entGrantMin: null, entPaidMin: null, entSubject: null,
    acceptanceRate: 15.0, studentFacultyRatio: 11.0,
    employmentRate6mo: 88.0, avgStartingSalaryUsd: 80000,
    campusSizeHa: 145.0, qsWorldRank: 37, theWorldRank: 30,
    worldRank: 37,
    websiteUrl: "https://tum.de",
    description: "Germany's #1 technical university. Near-zero tuition. #37 QS, #30 THE (2025).",
    tags: J(["Technical","European","Low-Tuition","Engineering","Research","Urban"]),
    photosJson: J([
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Technische_Universit%C3%A4t_M%C3%BCnchen_-_Stammgel%C3%A4nde.jpg/1280px-Technische_Universit%C3%A4t_M%C3%BCnchen_-_Stammgel%C3%A4nde.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Munich_city_center.jpg/1280px-Munich_city_center.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Munich_Marienplatz.jpg/1280px-Munich_Marienplatz.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Munich_English_Garden.jpg/1280px-Munich_English_Garden.jpg"
    ]),
    statsTestScores: J({ sat_math_25:680, sat_math_75:780, sat_read_25:620, sat_read_75:720, note:"German admission mainly via Abitur. Many English-taught Master programs. Bachelor programs mostly in German.", german_required_for_bachelor:true, english_programs_available:"Most Master programs available in English" }),
    statsDemographics: J({ enrollment:52000, undergrad:26000, grad:20000, phd:6000, gender:{male:63,female:37}, diversity:{german:62,eu:15,non_eu:23}, intl_student_pct:38 }),
    statsFinancials: J({ tuition_domestic_usd:320, tuition_intl_usd:320, room_board_usd:13000, avg_after_aid_usd:320, median_earnings_10y_usd:90000, note:"Near-zero tuition (€146.50/semester admin fee only). BUT Munich living costs are high (~€1,200/month). BAföG student support available for EU students." }),
    statsTopMajors: J([{name:"Mechanical Engineering",percent:22},{name:"Computer Science",percent:20},{name:"Electrical Engineering",percent:13},{name:"Physics",percent:10},{name:"Mathematics",percent:9},{name:"Civil Engineering",percent:8},{name:"Chemistry",percent:7},{name:"Architecture",percent:5},{name:"Management",percent:4},{name:"Aerospace",percent:2}]),
    extendedProfile: J({ mission:"At home in Bavaria, successful in the world. Entrepreneurial thinking and interdisciplinary approaches are hallmarks of TUM.", campus_life:"Multiple campuses (Munich city, Garching research campus, Straubing, Heilbronn). Strong engineering culture. Close to BMW, Siemens, Allianz HQs. Many student startups.", housing:"No guaranteed housing. Munich has very high rents (~€800–1,500/month). Apply for Studentenwerk München housing early.", career:"Prime employer is BMW, Siemens, Allianz, MAN, Linde. Strong EU job market access. Entrepreneurship ecosystem (TUM Venture Labs).", subject_ranks:[{subject:"Engineering & Technology",rank:20},{subject:"Computer Science",rank:28},{subject:"Natural Sciences",rank:42}], notable_alumni:["Carl von Linde — inventor of the refrigerator","Rudolf Diesel — inventor of the diesel engine","17 Nobel laureates","Werner Heisenberg — quantum physicist (studied here)"] }),
  },

  // ── 13. NUS ──────────────────────────────────────────────────────────────────
  {
    id: "uni_nus",
    name: "National University of Singapore",
    nameRu: "Национальный университет Сингапура",
    city: "Singapore", country: "Singapore", type: "Research",
    minGpa: 3.8, minIelts: 6.5, minSat: 1400,
    entGrantMin: null, entPaidMin: null, entSubject: null,
    acceptanceRate: 5.0, studentFacultyRatio: 9.0,
    employmentRate6mo: 90.0, avgStartingSalaryUsd: 65000,
    campusSizeHa: 150.0, qsWorldRank: 8, theWorldRank: 19,
    worldRank: 8,
    websiteUrl: "https://nus.edu.sg",
    description: "#1 in Asia, #8 globally (QS 2025). The gateway to Southeast Asia's innovation economy.",
    tags: J(["Asian-Hub","Research","Urban","High-Tech","Global","STEM","Business"]),
    photosJson: J([
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/NUS_University_Cultural_Centre.jpg/1280px-NUS_University_Cultural_Centre.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/National_University_of_Singapore_Yong_Siew_Toh_Conservatory_of_Music.jpg/1280px-National_University_of_Singapore_Yong_Siew_Toh_Conservatory_of_Music.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Singapore_Skyline_at_Dusk.jpg/1280px-Singapore_Skyline_at_Dusk.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Marina_Bay_Sands_Singapore.jpg/1280px-Marina_Bay_Sands_Singapore.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Singapore_Botanic_Gardens.jpg/1280px-Singapore_Botanic_Gardens.jpg"
    ]),
    statsTestScores: J({ sat_math_25:720, sat_math_75:800, sat_read_25:680, sat_read_75:760, act_25:33, act_75:36, avg_gpa_accepted:3.9, note:"NUS primarily uses A-levels, IB, or polytechnic diplomas. English is medium of instruction." }),
    statsDemographics: J({ enrollment:41000, undergrad:31000, grad:10000, gender:{male:52,female:48}, diversity:{singaporean:65,asean:10,other_asian:15,western:5,other:5}, intl_student_pct:35 }),
    statsFinancials: J({ tuition_domestic_usd:13000, tuition_intl_usd:27600, room_board_usd:9000, avg_after_aid_usd:15000, median_earnings_10y_usd:75000, note:"Singapore government subsidies reduce tuition significantly. ASEAN Scholarships available. Students sign 3-year Singapore work obligation for subsidized tuition." }),
    statsTopMajors: J([{name:"Engineering",percent:22},{name:"Business",percent:20},{name:"Computer Science",percent:18},{name:"Medicine",percent:8},{name:"Law",percent:7},{name:"Science",percent:10},{name:"Arts & Social Sciences",percent:8},{name:"Architecture",percent:4},{name:"Music",percent:3}]),
    extendedProfile: J({ mission:"To transform the way people think and do things through excellence in education, research and entrepreneurship.", campus_life:"150-hectare campus in western Singapore. Residential colleges, vibrant Asian cosmopolitan environment, gateway to ASEAN. 350+ student clubs.", housing:"Residential colleges available (Prince George's Park, etc.). Very competitive for housing spots.", career:"Gateway to Asian financial and tech markets. Top employer for Singapore's finance, tech, and consulting sectors. Growing global startup ecosystem.", subject_ranks:[{subject:"Computer Science",rank:6},{subject:"Engineering",rank:10},{subject:"Business & Management",rank:12},{subject:"Law",rank:11}], notable_alumni:["Goh Chok Tong — former Prime Minister of Singapore","Tony Tan — former President of Singapore","Peter Ho — Singapore Civil Service head","Many ASEAN government and corporate leaders"] }),
  },

  // ── 14. UNIVERSITY OF TOKYO ──────────────────────────────────────────────────
  {
    id: "uni_utokyo",
    name: "University of Tokyo",
    nameRu: "Токийский университет",
    city: "Tokyo", country: "Japan", type: "Research",
    minGpa: 3.9, minIelts: 6.5, minSat: 1400,
    entGrantMin: null, entPaidMin: null, entSubject: null,
    acceptanceRate: 20.0, studentFacultyRatio: 10.0,
    employmentRate6mo: 92.0, avgStartingSalaryUsd: 52000,
    campusSizeHa: 226.0, qsWorldRank: 28, theWorldRank: 28,
    worldRank: 28,
    websiteUrl: "https://u-tokyo.ac.jp",
    description: "Japan's most prestigious university. Founded 1877. #28 QS & THE (2025). PEAK English program for internationals.",
    tags: J(["Elite","Asian-Hub","Research","Urban","Historical","Government-Linked"]),
    photosJson: J([
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Hongo_campus_of_University_of_Tokyo.jpg/1280px-Hongo_campus_of_University_of_Tokyo.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/University_of_Tokyo_Yasuda_Auditorium.jpg/1280px-University_of_Tokyo_Yasuda_Auditorium.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/University_of_Tokyo_-_Akamon.jpg/1280px-University_of_Tokyo_-_Akamon.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Tokyo_tower_and_fuji.jpg/1280px-Tokyo_tower_and_fuji.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Tokyo_cityscape_at_night.jpg/1280px-Tokyo_cityscape_at_night.jpg"
    ]),
    statsTestScores: J({ sat_math_25:710, sat_math_75:800, sat_read_25:650, sat_read_75:750, note:"Domestic admission via 共通テスト (National Center Test) — extremely competitive. PEAK program (English-medium) available for international students. No Japanese required for PEAK.", peak_program_intl:true, japanese_required:"For regular programs yes; for PEAK program no" }),
    statsDemographics: J({ enrollment:28000, undergrad:14000, grad:14000, gender:{male:79,female:21}, diversity:{japanese:92,intl:8}, intl_student_pct:8 }),
    statsFinancials: J({ tuition_domestic_usd:3600, tuition_intl_usd:3600, room_board_usd:14000, avg_after_aid_usd:3600, median_earnings_10y_usd:52000, note:"Very low tuition (~¥535,800/yr). Tokyo living costs are moderate by world-city standards. MEXT Government Scholarship covers full tuition + living stipend for international students." }),
    statsTopMajors: J([{name:"Engineering",percent:26},{name:"Law",percent:14},{name:"Medicine",percent:10},{name:"Economics",percent:10},{name:"Science",percent:10},{name:"Liberal Arts",percent:9},{name:"Agriculture",percent:7},{name:"Education",percent:5},{name:"Pharmaceutical",percent:4},{name:"Letters",percent:5}]),
    extendedProfile: J({ mission:"Contributing to the betterment of society through internationally-recognized research and education, producing leaders who can think independently and tackle societal challenges.", campus_life:"Multiple campuses (Hongo, Komaba, Kashiwa). Traditional Japanese academic culture blended with cutting-edge research. Historic ginkgo tree avenue. 350+ clubs and circles.", housing:"International House of UTokyo available. Tokyo accommodation costs manageable (~¥50,000–80,000/month for shared).", career:"The absolute pinnacle of prestige in Japan. Graduates dominate government ministries, top corporations (Sony, Toyota, SoftBank), academia, and Japan's judiciary.", subject_ranks:[{subject:"Engineering",rank:6},{subject:"Natural Sciences",rank:15},{subject:"Social Sciences",rank:22}], notable_alumni:["Yasuo Fukuda — former Prime Minister of Japan","Shinzō Abe (studied here) — longest-serving PM of Japan","Eiji Toyoda — former CEO of Toyota","Shuji Nakamura — Nobel Prize Physics (blue LED inventor)"] }),
  },
];

console.log(`Seeding ${universities.length} universities...`);

for (const u of universities) {
  await p.university.update({
    where: { id: u.id },
    data: {
      name: u.name,
      nameRu: u.nameRu,
      city: u.city,
      country: u.country,
      type: u.type,
      minGpa: u.minGpa,
      minIelts: u.minIelts,
      minSat: u.minSat ?? undefined,
      entGrantMin: u.entGrantMin ?? undefined,
      entPaidMin: u.entPaidMin ?? undefined,
      entSubject: u.entSubject ?? undefined,
      acceptanceRate: u.acceptanceRate,
      studentFacultyRatio: u.studentFacultyRatio,
      employmentRate6mo: u.employmentRate6mo,
      avgStartingSalaryUsd: u.avgStartingSalaryUsd,
      campusSizeHa: u.campusSizeHa,
      qsWorldRank: u.qsWorldRank ?? undefined,
      theWorldRank: u.theWorldRank ?? undefined,
      worldRank: u.worldRank ?? undefined,
      websiteUrl: u.websiteUrl,
      description: u.description,
      tags: u.tags,
      photosJson: u.photosJson,
      statsTestScores: u.statsTestScores,
      statsDemographics: u.statsDemographics,
      statsFinancials: u.statsFinancials,
      statsTopMajors: u.statsTopMajors,
      extendedProfile: u.extendedProfile,
    },
  });
  console.log(`  ✓ ${u.name}`);
}

console.log("\nAll universities seeded successfully.");
await p.$disconnect();
