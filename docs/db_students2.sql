-- =========================================================================
-- DATABASE: QApp Ecosystem v2
-- LAYER: User Identity Node (Students) — UPGRADED
-- DESCRIPTION: Enhanced student profiles with ENT scores, detailed priority
--              tags, document tracking, and KZ-specific academic data.
-- =========================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

DROP TABLE IF EXISTS `students`;

CREATE TABLE `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `grade` int(11) DEFAULT NULL COMMENT '10, 11, or 12',
  `country` varchar(100) DEFAULT 'Kazakhstan',
  `city` varchar(100) DEFAULT NULL,

  -- ===========================
  -- ACADEMIC CORE
  -- ===========================
  -- GPA: Kazakhstani scale (0–5.0)
  `gpa` decimal(3,1) DEFAULT NULL COMMENT 'GPA on Kazakhstani scale (0–5.0)',
  `gpa_max` decimal(3,1) DEFAULT 5.0,
  `gpa_us` decimal(3,2) DEFAULT NULL COMMENT 'Estimated US 4.0-scale GPA (auto-calculated)',

  -- International tests
  `ielts` decimal(3,1) DEFAULT NULL COMMENT 'IELTS score (0–9.0)',
  `toefl` int(11) DEFAULT NULL COMMENT 'TOEFL iBT score',
  `sat` int(11) DEFAULT NULL COMMENT 'SAT total (400–1600)',
  `act` int(11) DEFAULT NULL COMMENT 'ACT composite (1–36)',

  -- Kazakhstan-specific: ЕНТ (Unified National Test)
  -- ENT is out of 140 points total (7 subjects × 20 each in profile track)
  `ent_score` int(11) DEFAULT NULL COMMENT 'ENT total score (0–140)',
  `ent_year` int(11) DEFAULT NULL COMMENT 'Year the ENT was taken',
  `ent_math` int(11) DEFAULT NULL COMMENT 'ENT Math subscore (0–20)',
  `ent_reading` int(11) DEFAULT NULL COMMENT 'ENT Reading Literacy subscore (0–20)',
  `ent_math_literacy` int(11) DEFAULT NULL COMMENT 'ENT Mathematical Literacy subscore (0–20)',
  `ent_history_kz` int(11) DEFAULT NULL COMMENT 'ENT History of Kazakhstan subscore (0–20)',
  `ent_profile1` int(11) DEFAULT NULL COMMENT 'ENT Profile Subject 1 score (0–20)',
  `ent_profile1_name` varchar(100) DEFAULT NULL COMMENT 'Name of ENT Profile Subject 1 (e.g. Physics)',
  `ent_profile2` int(11) DEFAULT NULL COMMENT 'ENT Profile Subject 2 score (0–20)',
  `ent_profile2_name` varchar(100) DEFAULT NULL COMMENT 'Name of ENT Profile Subject 2 (e.g. Math)',

  -- Olympiad achievements (boost for grant competition)
  `olympiad_level` varchar(50) DEFAULT NULL COMMENT 'none / oblast / republican / international',
  `olympiad_subject` varchar(100) DEFAULT NULL,
  `altyn_belgi` tinyint(1) DEFAULT 0 COMMENT '1 = has Alтын белгі (gold honor medal)',

  -- ===========================
  -- LOGISTICS & PREFERENCES
  -- ===========================
  `budget_status` varchar(100) DEFAULT NULL COMMENT 'Needs Scholarship / Self-Funded / Needs Grant',
  -- priority_tags: array of {tag, weight} — user distributes 20 points across tags
  `priority_tags` JSON DEFAULT NULL,
  -- documents: document readiness checklist
  `documents` JSON DEFAULT NULL,
  -- saved university IDs
  `saved_universities` JSON DEFAULT NULL,

  -- ===========================
  -- AI/SYSTEM FIELDS
  -- ===========================
  `onboarding_complete` tinyint(1) DEFAULT 0,
  `last_recommendation_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- =========================================================================
-- ENT SCORE REFERENCE TABLE (for UI tooltip / explainer)
-- Typical grant thresholds across KZ universities (2025 data):
--   AITU (IT programs):  80+ for grant, 50+ for paid
--   KBTU (IT):          110+ for grant, 60+ for paid
--   KazNU (IT):         110+ for grant, 50+ for paid
--   KazNU (Physics):     70+ for grant, 50+ for paid
--   KazNU (Law):         90+ for grant, 50+ for paid
--   NU (Nazarbayev):    NUET required for grant; ENT ≥85 English for paid
-- ENT scale: 0–140 total; each of 7 subjects = 0–20
-- Subject groups for IT/STEM track: Math + Computer Science OR Math + Physics
-- Subject groups for Humanities: History + Geography / Law + History
-- =========================================================================

CREATE TABLE IF NOT EXISTS `ent_reference` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subject_group` varchar(100) NOT NULL COMMENT 'ENT profile group name',
  `subject_1` varchar(100) NOT NULL,
  `subject_2` varchar(100) NOT NULL,
  `typical_programs` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `ent_reference` (`subject_group`, `subject_1`, `subject_2`, `typical_programs`) VALUES
('Math + Computer Science', 'Mathematics', 'Computer Science (Informatics)', 'IT, Software Engineering, CS, Big Data, InfoSec'),
('Math + Physics', 'Mathematics', 'Physics', 'Electrical Engineering, Mechanical Engineering, Physics, Aerospace'),
('Math + Chemistry', 'Mathematics', 'Chemistry', 'Chemical Engineering, Pharmacy, Materials Science'),
('Biology + Chemistry', 'Biology', 'Chemistry', 'Medicine, Biology, Biotechnology, Pharmacy'),
('History of KZ + World History', 'History of Kazakhstan', 'World History', 'History, International Relations, Law (some programs)'),
('History of KZ + Geography', 'History of Kazakhstan', 'Geography', 'Geography, Ecology, Environmental Science, Tourism'),
('Math + Geography', 'Mathematics', 'Geography', 'Geology, Earth Sciences, Geodesy'),
('Kazakh Language + World History', 'Kazakh Language & Literature', 'World History', 'Philology, Linguistics, Journalism (Kazakh-medium)'),
('Russian Language + World History', 'Russian Language & Literature', 'World History', 'Philology, Linguistics, Journalism (Russian-medium)'),
('Math + Biology', 'Mathematics', 'Biology', 'Agriculture, Veterinary, Food Technology');


-- =========================================================================
-- MOCK STUDENTS (expanded profiles with ENT data)
-- =========================================================================

INSERT INTO `students` (
  `name`, `email`, `password_hash`, `grade`, `city`,
  `gpa`, `gpa_us`, `ielts`, `sat`,
  `ent_score`, `ent_year`, `ent_math`, `ent_reading`, `ent_math_literacy`,
  `ent_history_kz`, `ent_profile1`, `ent_profile1_name`, `ent_profile2`, `ent_profile2_name`,
  `olympiad_level`, `olympiad_subject`, `altyn_belgi`,
  `budget_status`, `priority_tags`, `documents`, `saved_universities`
) VALUES

-- =========================================================================
-- STUDENT 1: Aliya Bekova — high achiever, STEM, targeting NU + international
-- ENT: 128/140 — qualifies for grant at most KZ universities
-- IELTS: 7.0 — qualifies for NU paid; needs ~6.5 for NU grant track
-- GPA: 4.7/5.0 → ~3.76 US scale → good but not Ivy League level
-- =========================================================================
('Aliya Bekova', 'aliya@qapp.kz', 'hash_1',
 11, 'Astana',
 4.7, 3.76, 7.0, 1380,
 128, 2024, 19, 18, 17,
 18, 19, 'Computer Science (Informatics)', 19, 'Mathematics',
 'republican', 'Mathematics', 0,
 'Needs Scholarship',
 '[
   {"tag": "STEM", "weight": 8},
   {"tag": "State-Funded", "weight": 5},
   {"tag": "English-medium", "weight": 4},
   {"tag": "Urban", "weight": 3}
 ]',
 '{
   "passport": "READY",
   "photo": "READY",
   "medical_cert": "MISSING",
   "transcript": "READY",
   "diploma": "PENDING",
   "ielts_cert": "READY",
   "ent_cert": "READY",
   "recommendation_letters": "MISSING"
 }',
 '[1, 2, 6, 7]'
),

-- =========================================================================
-- STUDENT 2: Dias Nurmagambetov — solid student, Business track, Almaty
-- ENT: 105/140 — qualifies for KIMEP, KazNU Business, KBTU Finance grant
-- IELTS: 6.0 — qualifies for KBTU (min 5.5), KIMEP (min 5.5)
-- GPA: 3.8/5.0 → ~3.04 US scale → competitive for KZ unis, challenging for intl
-- =========================================================================
('Dias Nurmagambetov', 'dias@qapp.kz', 'hash_2',
 12, 'Almaty',
 3.8, 3.04, 6.0, 1150,
 105, 2024, 16, 15, 14,
 17, 15, 'World History', 13, 'Kazakh Language & Literature',
 'none', NULL, 0,
 'Self-Funded',
 '[
   {"tag": "Business", "weight": 7},
   {"tag": "Urban", "weight": 6},
   {"tag": "Bilingual", "weight": 7}
 ]',
 '{
   "passport": "READY",
   "photo": "MISSING",
   "medical_cert": "MISSING",
   "transcript": "READY",
   "diploma": "READY",
   "ielts_cert": "READY",
   "ent_cert": "READY",
   "recommendation_letters": "PENDING"
 }',
 '[4, 5]'
),

-- =========================================================================
-- STUDENT 3: Aizhan Smagulova — top performer, Ivy League aspirant
-- ENT: 137/140 — top 0.1% nationally; qualifies for all KZ grants
-- IELTS: 7.5 — qualifies for Oxford, Harvard, MIT
-- GPA: 4.0/5.0 → ~3.2 US scale — NOTE: Kazakhstani 4.0 = 3.2 US
-- SAT: 1500 — competitive for top intl universities
-- Alтын белгі: yes — 30% discount at AITU if applies there
-- =========================================================================
('Aizhan Smagulova', 'aizhan@qapp.kz', 'hash_3',
 12, 'Shymkent',
 4.0, 4.0, 7.5, 1500,
 137, 2024, 20, 19, 19,
 19, 20, 'Mathematics', 20, 'Physics',
 'international', 'Physics', 1,
 'Needs Scholarship',
 '[
   {"tag": "Ivy League", "weight": 10},
   {"tag": "Research", "weight": 5},
   {"tag": "High-Funding", "weight": 5}
 ]',
 '{
   "passport": "READY",
   "photo": "READY",
   "medical_cert": "READY",
   "transcript": "READY",
   "diploma": "READY",
   "ielts_cert": "READY",
   "sat_scores": "READY",
   "ent_cert": "READY",
   "recommendation_letters": "READY",
   "essays_common_app": "IN_PROGRESS"
 }',
 '[6, 7, 8, 9, 10, 11]'
),

-- =========================================================================
-- STUDENT 4: Arman Serikbayev — strong IT student, targeting AITU/NU CS
-- ENT: 96/140 — qualifies for AITU IT grant (min 80), KazNU IT (110) — close
-- IELTS: 6.5 — qualifies for NU paid
-- GPA: 4.3/5.0 → ~3.44 US scale
-- =========================================================================
('Arman Serikbayev', 'arman@qapp.kz', 'hash_4',
 11, 'Astana',
 4.3, 3.44, 6.5, NULL,
 96, 2024, 18, 15, 16,
 14, 17, 'Computer Science (Informatics)', 16, 'Mathematics',
 'oblast', 'Computer Science', 0,
 'Needs Scholarship',
 '[
   {"tag": "IT-Focused", "weight": 9},
   {"tag": "STEM", "weight": 6},
   {"tag": "English-medium", "weight": 3},
   {"tag": "Urban", "weight": 2}
 ]',
 '{
   "passport": "READY",
   "photo": "READY",
   "medical_cert": "PENDING",
   "transcript": "READY",
   "diploma": "PENDING",
   "ielts_cert": "READY",
   "ent_cert": "READY",
   "recommendation_letters": "MISSING"
 }',
 '[1, 2]'
),

-- =========================================================================
-- STUDENT 5: Dana Khasenova — humanities student, journalism/law track
-- ENT: 118/140 — qualifies for KazNU Journalism grant (min 115)
-- No IELTS — targeting Kazakh-medium programs
-- GPA: 4.2/5.0 → ~3.36 US scale
-- =========================================================================
('Dana Khasenova', 'dana@qapp.kz', 'hash_5',
 12, 'Almaty',
 4.2, 3.36, NULL, NULL,
 118, 2024, 14, 18, 14,
 17, 16, 'Kazakh Language & Literature', 15, 'World History',
 'none', NULL, 0,
 'Needs Scholarship',
 '[
   {"tag": "Humanities", "weight": 8},
   {"tag": "Comprehensive", "weight": 5},
   {"tag": "Historical", "weight": 4},
   {"tag": "Large Campus", "weight": 3}
 ]',
 '{
   "passport": "READY",
   "photo": "READY",
   "medical_cert": "READY",
   "transcript": "READY",
   "diploma": "PENDING",
   "ent_cert": "READY"
 }',
 '[3]'
);


-- =========================================================================
-- ENT SCORE BENCHMARKS VIEW (useful for UI "how do I compare?" widget)
-- =========================================================================

CREATE OR REPLACE VIEW `ent_benchmarks` AS
SELECT 
  'AITU' as university,
  'IT / CS (B057)' as program,
  80 as grant_min,
  50 as paid_min,
  1347 as grants_available_2025
UNION ALL SELECT 'AITU', 'Information Security (B058)', 85, 50, 858
UNION ALL SELECT 'AITU', 'Communications Tech (B059)', 70, 50, 234
UNION ALL SELECT 'KBTU', 'Information Technology (B057)', 110, 60, 800
UNION ALL SELECT 'KBTU', 'Finance & Economics (B046)', 116, 65, 95
UNION ALL SELECT 'KBTU', 'Management (B044)', 117, 65, 27
UNION ALL SELECT 'KBTU', 'Mining Engineering (B071)', 75, 55, 538
UNION ALL SELECT 'KazNU', 'Information Technology (B057)', 110, 50, NULL
UNION ALL SELECT 'KazNU', 'Law (B049)', 90, 50, 44
UNION ALL SELECT 'KazNU', 'Journalism (B042)', 115, 50, 68
UNION ALL SELECT 'KazNU', 'Biology (B050)', 81, 50, 551
UNION ALL SELECT 'KazNU', 'Physics (B054)', 70, 50, 268
UNION ALL SELECT 'KazNU', 'Mathematics (B055)', 95, 50, 205
UNION ALL SELECT 'KazNU', 'Finance/Economics (B046)', 98, 50, 15
UNION ALL SELECT 'NU (Nazarbayev)', 'All programs (via NUET)', NULL, 85, NULL;


COMMIT;

-- =========================================================================
-- NOTES FOR DEVELOPERS:
--
-- ENT Score Interpretation:
--   0–69:   Below most grant thresholds. Paid enrollment at state universities.
--   70–84:  Grant-eligible for select programs (Physics, Mining, Communications)
--   85–99:  Grant-eligible for AITU, most KazNU programs
--   100–109: Strong — qualifies for most KBTU paid, KazNU grants
--   110–119: Very strong — KBTU IT grant range, KazNU top programs
--   120–129: Excellent — most programs at any KZ university
--   130–140: Elite — top 1-2% nationally
--
-- GPA Conversion (KZ 5.0 scale → US 4.0 scale, approximate):
--   5.0  → 4.0
--   4.5  → 3.7
--   4.0  → 3.2
--   3.5  → 2.7
--   3.0  → 2.0
--
-- Document Status Values: READY | PENDING | MISSING | IN_PROGRESS
--
-- Sources for ENT data:
--   univision.kz (2025 grant competition results)
--   astanait.edu.kz/en/aitu-excellence-test (AITU admission)
--   astanait.edu.kz/en/main-page (AITU FAQ)
--   tengrinews.kz (NU 2024 announcement)
-- =========================================================================
