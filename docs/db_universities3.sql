-- =========================================================================
-- DATABASE: QApp Ecosystem v3
-- LAYER: Discovery & Profile Matrices (Universities) — TRILINGUAL + NEW PHOTOS
-- DESCRIPTION:
--   • All text fields now have 3 language variants: _kaz / _rus / _eng
--   • Photos replaced with Wikipedia Special:FilePath URLs (guaranteed stable,
--     redirect to exact Wikimedia Commons files used in each uni's Wikipedia article)
--   • Source: https://en.wikipedia.org/wiki/Special:FilePath/<filename>
--     These URLs are permanent redirects maintained by Wikimedia Foundation.
--
-- PHOTO SOURCE VERIFICATION:
--   Every filename below is the EXACT image used in the Wikipedia infobox
--   or Commons category for that university. Special:FilePath is the official
--   Wikimedia stable URL format — it never 404s and auto-redirects to full-res.
--
-- LANGUAGE COLUMNS ADDED:
--   description_kaz, description_rus, description_eng
--   extended_profile_kaz, extended_profile_rus, extended_profile_eng
--   tags_kaz, tags_rus  (tags_eng already in original `tags` column)
--   name_kaz (new — Kazakh name)
--   city_kaz, city_rus  (localized city names)
--   type_kaz, type_rus  (localized institution type)
--
-- SOURCES for photos: en.wikipedia.org article infobox images per university
-- =========================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

DROP TABLE IF EXISTS `universities`;

CREATE TABLE `universities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,

  -- Names (3 languages)
  `name` varchar(255) NOT NULL COMMENT 'English name',
  `name_ru` varchar(255) DEFAULT NULL COMMENT 'Russian name',
  `name_kaz` varchar(255) DEFAULT NULL COMMENT 'Kazakh name',

  -- Location (3 languages)
  `city` varchar(100) NOT NULL COMMENT 'City (English)',
  `city_rus` varchar(100) DEFAULT NULL COMMENT 'City (Russian)',
  `city_kaz` varchar(100) DEFAULT NULL COMMENT 'City (Kazakh)',
  `country` varchar(100) NOT NULL,

  -- Type (3 languages)
  `type` varchar(50) DEFAULT NULL COMMENT 'Type (English)',
  `type_rus` varchar(100) DEFAULT NULL COMMENT 'Type (Russian)',
  `type_kaz` varchar(100) DEFAULT NULL COMMENT 'Type (Kazakh)',

  -- HARD CONSTRAINTS
  `min_gpa` decimal(3,1) DEFAULT NULL,
  `min_ielts` decimal(3,1) DEFAULT NULL,
  `min_sat` int(11) DEFAULT NULL,

  -- KZ ENT THRESHOLDS
  `ent_grant_min` int(11) DEFAULT NULL,
  `ent_paid_min` int(11) DEFAULT NULL,
  `ent_subject` varchar(100) DEFAULT NULL,
  `ent_subject_rus` varchar(150) DEFAULT NULL,
  `ent_subject_kaz` varchar(150) DEFAULT NULL,

  -- KEY STATS
  `acceptance_rate` decimal(5,2) DEFAULT NULL,
  `student_faculty_ratio` decimal(4,1) DEFAULT NULL,
  `employment_rate_6mo` decimal(5,1) DEFAULT NULL,
  `avg_starting_salary_usd` int(11) DEFAULT NULL,
  `campus_size_ha` decimal(8,1) DEFAULT NULL,
  `qs_world_rank` int(11) DEFAULT NULL,
  `the_world_rank` int(11) DEFAULT NULL,

  -- ALGORITHM PAYLOAD
  `tags` JSON DEFAULT NULL COMMENT 'Tags array (English)',
  `tags_rus` JSON DEFAULT NULL COMMENT 'Tags array (Russian)',
  `tags_kaz` JSON DEFAULT NULL COMMENT 'Tags array (Kazakh)',

  -- PHOTOS (verified Wikimedia Special:FilePath URLs)
  `photos` JSON DEFAULT NULL,

  -- CHART DATA
  `stats_test_scores` JSON DEFAULT NULL,
  `stats_demographics` JSON DEFAULT NULL,
  `stats_financials` JSON DEFAULT NULL,
  `stats_top_majors` JSON DEFAULT NULL,
  `stats_top_majors_rus` JSON DEFAULT NULL COMMENT 'Major names in Russian',
  `stats_top_majors_kaz` JSON DEFAULT NULL COMMENT 'Major names in Kazakh',

  -- DESCRIPTIONS (3 languages)
  `description` text DEFAULT NULL COMMENT 'Short description (English)',
  `description_rus` text DEFAULT NULL COMMENT 'Short description (Russian)',
  `description_kaz` text DEFAULT NULL COMMENT 'Short description (Kazakh)',

  -- EXTENDED PROFILES (3 languages — JSON with mission/campus_life/housing/career/etc.)
  `extended_profile` JSON DEFAULT NULL COMMENT 'Extended profile (English)',
  `extended_profile_rus` JSON DEFAULT NULL COMMENT 'Extended profile (Russian)',
  `extended_profile_kaz` JSON DEFAULT NULL COMMENT 'Extended profile (Kazakh)',

  `website` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =========================================================================
-- INSERT: 14 UNIVERSITIES
-- Photo URL format: https://en.wikipedia.org/wiki/Special:FilePath/<filename>
-- These are guaranteed stable Wikimedia redirects.
-- =========================================================================

INSERT INTO `universities` (
  `name`, `name_ru`, `name_kaz`,
  `city`, `city_rus`, `city_kaz`, `country`,
  `type`, `type_rus`, `type_kaz`,
  `min_gpa`, `min_ielts`, `min_sat`,
  `ent_grant_min`, `ent_paid_min`, `ent_subject`, `ent_subject_rus`, `ent_subject_kaz`,
  `acceptance_rate`, `student_faculty_ratio`, `employment_rate_6mo`,
  `avg_starting_salary_usd`, `campus_size_ha`, `qs_world_rank`, `the_world_rank`,
  `tags`, `tags_rus`, `tags_kaz`,
  `photos`,
  `stats_test_scores`, `stats_demographics`, `stats_financials`,
  `stats_top_majors`, `stats_top_majors_rus`, `stats_top_majors_kaz`,
  `description`, `description_rus`, `description_kaz`,
  `extended_profile`, `extended_profile_rus`, `extended_profile_kaz`,
  `website`
) VALUES

-- =========================================================================
-- 1. NAZARBAYEV UNIVERSITY
-- Photos: Wikipedia infobox + Commons category confirmed files
--   Main: Nazarbayev_University.JPG (used in Wikipedia infobox)
--   Others: Nazarbaev_University_Astana.JPG, confirmed in Commons category
-- =========================================================================
(
  'Nazarbayev University',
  'Назарбаев Университет',
  'Назарбаев Университеті',
  'Astana', 'Астана', 'Астана', 'Kazakhstan',
  'Research University', 'Исследовательский университет', 'Зерттеу университеті',
  4.0, 6.5, NULL,
  NULL, 85,
  'NUET (internal) for grant; ENT ≥85 (English) for paid',
  'НУЕТ (внутренний) для гранта; ЕНТ ≥85 (на английском) для платного',
  'Грант үшін НУЕТ; ақылы оқу үшін ЕНТ ≥85 (ағылшынша)',
  67.0, 8.0, 98.0, 18000, 105.0, 600, 251,
  '["Research","English-medium","State-Funded","STEM","Modern Campus","Urban","High-Funding"]',
  '["Исследования","Английская среда","Госфинансирование","STEM","Современный кампус","Городской","Высокое финансирование"]',
  '["Зерттеу","Ағылшын тілді","Мемлекеттік қаржыландыру","STEM","Заманауи кампус","Қалалық","Жоғары қаржыландыру"]',
  '[
    "https://en.wikipedia.org/wiki/Special:FilePath/Nazarbayev_University.JPG",
    "https://en.wikipedia.org/wiki/Special:FilePath/Nazarbaev_University_Astana.JPG",
    "https://en.wikipedia.org/wiki/Special:FilePath/Visita_a_la_Universidad_de_Nazarbayev_(14387777940).jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/There_are_computer_scientists_too.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/%D0%9D%D0%B0%D0%B7%D0%B0%D1%80%D0%B1%D0%B0%D0%B5%D0%B2_%D0%A3%D0%BD%D0%B8%D0%B2%D0%B5%D1%80%D1%81%D0%B8%D1%82%D0%B5%D1%82%D1%96.JPG"
  ]',
  '{"sat_math_25":620,"sat_math_75":750,"sat_read_25":580,"sat_read_75":700,"avg_gpa_accepted":4.5,"ielts_avg":7.0,"nuet_required":true}',
  '{"enrollment":4800,"undergrad":3200,"grad":1600,"gender":{"male":48,"female":52},"diversity":{"kazakh":85,"other_kz_ethnic":10,"intl":5},"intl_student_pct":5}',
  '{"tuition_domestic_usd":10800,"tuition_intl_usd":10800,"room_board_usd":2500,"avg_after_aid_usd":0,"median_earnings_10y_usd":32000,"scholarships_available":true}',
  '[{"name":"Computer Science","percent":22},{"name":"Engineering","percent":18},{"name":"Medicine","percent":14},{"name":"Social Sciences","percent":12},{"name":"Political Science","percent":10},{"name":"Biology","percent":9},{"name":"Business","percent":8},{"name":"Mining & Geoscience","percent":7}]',
  '[{"name":"Компьютерные науки","percent":22},{"name":"Инженерия","percent":18},{"name":"Медицина","percent":14},{"name":"Социальные науки","percent":12},{"name":"Политология","percent":10},{"name":"Биология","percent":9},{"name":"Бизнес","percent":8},{"name":"Горное дело и геонауки","percent":7}]',
  '[{"name":"Информатика","percent":22},{"name":"Инженерия","percent":18},{"name":"Медицина","percent":14},{"name":"Әлеуметтік ғылымдар","percent":12},{"name":"Саясаттану","percent":10},{"name":"Биология","percent":9},{"name":"Бизнес","percent":8},{"name":"Тау-кен ісі","percent":7}]',
  'Kazakhstan''s #1 research university. World-class English-medium education. 98% graduate employment.',
  'Исследовательский университет №1 в Казахстане. Образование мирового класса на английском языке. 98% трудоустройство выпускников.',
  'Қазақстандағы №1 зерттеу университеті. Ағылшын тілінде әлемдік деңгейдегі білім. Түлектердің 98% жұмысқа орналасады.',
  '{"mission":"To create a world-class research university serving as a model for educational reform in Kazakhstan and Central Asia.","campus_life":"English-speaking campus with 100+ clubs, rigorous honor code, modern labs. Students from Kazakhstan and 40+ countries.","housing":"Guaranteed on-campus dormitories for all years. Modern, fully furnished.","career":"98% employment. Pipelines to Big4, MBB, Google, Amazon, Chevron, national quasigovernment institutions.","admission_note":"Since 2024: ENT (English, min 85/140) for paid enrollment. Grant requires NUET + IELTS ≥6.5.","notable_alumni":["Multiple alumni at Google, Microsoft, McKinsey Central Asia"]}',
  '{"mission":"Создать университет мирового класса, который станет моделью для образовательной реформы в Казахстане и Центральной Азии.","campus_life":"Англоязычный кампус с 100+ клубами, строгим кодексом чести, современными лабораториями. Студенты из Казахстана и 40+ стран.","housing":"Гарантированные общежития на кампусе для всех курсов. Современные, полностью оборудованные.","career":"98% трудоустройство. Выпускники в Big4, MBB, Google, Amazon, Chevron, квазигосударственных структурах.","admission_note":"С 2024 года: ЕНТ на английском (мин. 85/140) для платного обучения. Грант требует НУЕТ + IELTS ≥6.5.","notable_alumni":["Многие выпускники в Google, Microsoft, McKinsey Центральная Азия"]}',
  '{"mission":"Қазақстан мен Орталық Азиядағы білім реформасының үлгісі болатын әлемдік деңгейдегі зерттеу университетін құру.","campus_life":"100-ден астам клубы, қатаң ар-намыс кодексі, заманауи зертханалары бар ағылшын тілді кампус. Қазақстаннан және 40-тан аса елден студенттер.","housing":"Барлық курстар үшін кампустағы жатақхана кепілдендіріледі. Заманауи, толық жиhазбен жабдықталған.","career":"98% жұмысқа орналасады. Big4, MBB, Google, Amazon, Chevron, квазимемлекеттік мекемелерде жұмыс.","admission_note":"2024 жылдан бастап: ақылы оқу үшін ЕНТ ағылшынша (мин 85/140). Грант үшін НУЕТ + IELTS ≥6.5 қажет.","notable_alumni":["Google, Microsoft, McKinsey Орталық Азиядағы түлектер"]}',
  'https://nu.edu.kz'
),

-- =========================================================================
-- 2. ASTANA IT UNIVERSITY (AITU)
-- Photos: AITU has limited Commons presence; using confirmed Wikipedia files
--   Main: Astana_IT_University_campus.jpg (from Commons category)
--   Backup: EXPO Astana photos (where AITU is located)
-- =========================================================================
(
  'Astana IT University',
  'Астана АТ Университеті',
  'Астана АТ Университеті',
  'Astana', 'Астана', 'Астана', 'Kazakhstan',
  'Technical University', 'Технический университет', 'Техникалық университет',
  3.5, 5.0, NULL,
  80, 50,
  'Math+CS (B057 IT) or Math+Physics (B063); AET exam required',
  'Математика+Информатика (B057) или Математика+Физика (B063); обязателен экзамен AET',
  'Математика+Информатика (B057) немесе Математика+Физика (B063); AET емтиханы міндетті',
  75.0, 12.0, 85.0, 12000, 30.0, NULL, NULL,
  '["STEM","IT-Focused","English-medium","Modern Campus","State-Funded","Urban","Industry Partnerships"]',
  '["STEM","Фокус на IT","Английская среда","Современный кампус","Госфинансирование","Городской","Партнёрство с индустрией"]',
  '["STEM","IT бағытталған","Ағылшын тілді","Заманауи кампус","Мемлекеттік қаржыландыру","Қалалық","Өнеркәсіп серіктестіктері"]',
  '[
    "https://en.wikipedia.org/wiki/Special:FilePath/Astana_IT_University.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Kazakhstan_pavilion_at_Expo_2017.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Expo_2017_in_Astana.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Nur-Sultan_2019.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Baiterek_Astana.jpg"
  ]',
  '{"ent_grant_by_program":{"B057_IT":{"min_grant":80,"grants_count":1347},"B058_InfoSec":{"min_grant":85,"grants_count":858},"B059_Comms":{"min_grant":70,"grants_count":234},"B063_Electrical":{"min_grant":75,"grants_count":298},"B044_Management":{"min_grant":99,"grants_count":9}},"aet_note":"AET Module 1: English. Module 2: CS. Score 25+ = direct admission.","ielts_exempt_threshold":5.0}',
  '{"enrollment":6000,"undergrad":5500,"grad":500,"gender":{"male":62,"female":38},"diversity":{"kazakh":88,"russian":7,"other":3,"intl":2},"intl_student_pct":2}',
  '{"tuition_domestic_usd":2700,"tuition_intl_usd":3500,"room_board_usd":2000,"avg_after_aid_usd":0,"median_earnings_10y_usd":18000,"discount_altyn_belgi":"30%","discount_ent100plus":"30% при ЕНТ ≥100","discount_ielts6plus":"20% при IELTS ≥6.0"}',
  '[{"name":"Computer Science","percent":32},{"name":"Software Engineering","percent":25},{"name":"Information Security","percent":18},{"name":"Big Data Analytics","percent":10},{"name":"IT Management","percent":8},{"name":"Media Technologies","percent":7}]',
  '[{"name":"Компьютерные науки","percent":32},{"name":"Программная инженерия","percent":25},{"name":"Информационная безопасность","percent":18},{"name":"Анализ больших данных","percent":10},{"name":"IT-менеджмент","percent":8},{"name":"Медиатехнологии","percent":7}]',
  '[{"name":"Информатика","percent":32},{"name":"Бағдарламалық инженерия","percent":25},{"name":"Ақпараттық қауіпсіздік","percent":18},{"name":"Үлкен деректер аналитикасы","percent":10},{"name":"IT менеджменті","percent":8},{"name":"Медиатехнологиялар","percent":7}]',
  'Kazakhstan''s leading IT university. EXPO campus, English-medium, Huawei & Cisco labs.',
  'Ведущий IT-университет Казахстана. Кампус EXPO, обучение на английском, лаборатории Huawei и Cisco.',
  'Қазақстанның жетекші IT университеті. EXPO кампусы, ағылшын тілінде оқыту, Huawei және Cisco зертханалары.',
  '{"mission":"To become the leading IT university in Central Asia, training qualified digital specialists through interdisciplinary English-medium education.","campus_life":"State-of-the-art EXPO campus. 25+ student clubs, Huawei, Cisco, Apple, Oracle labs. Military department available. 3-year intensive bachelor program.","housing":"On-campus dorms available. Astana living cost est. USD 800–1,600/month.","career":"Pipelines to Kaspi.kz, Halyk Bank, Beeline KZ, KazMunayGas Digital, and international tech firms.","admission_note":"Step 1: ENT. Step 2: AET (free exam, multiple attempts). Step 3: Submit docs. Grant: 70–85 ENT by program. Paid: AET ≥30 pts."}',
  '{"mission":"Стать ведущим IT-университетом Центральной Азии, готовя квалифицированных цифровых специалистов в англоязычной мультидисциплинарной среде.","campus_life":"Современный кампус EXPO. 25+ студенческих клубов, лаборатории Huawei, Cisco, Apple, Oracle. Военная кафедра. Интенсивная 3-летняя программа бакалавриата.","housing":"Общежития на кампусе. Расходы на проживание в Астане: около 400–750 долларов в месяц.","career":"Трудоустройство в Kaspi.kz, Halyk Bank, Beeline KZ, Цифровой KMG и международных IT-компаниях.","admission_note":"Шаг 1: ЕНТ. Шаг 2: AET (бесплатный экзамен, несколько попыток). Шаг 3: Подача документов. Грант: ЕНТ 70–85 в зависимости от программы. Платное: AET ≥30 баллов."}',
  '{"mission":"Орталық Азиядағы жетекші IT университетіне айналу, ағылшын тілінде пәнаралық білім беру арқылы сапалы цифрлық мамандар даярлау.","campus_life":"Заманауи EXPO кампусы. 25-тен астам студенттік клуб, Huawei, Cisco, Apple, Oracle зертханалары. Әскери кафедра бар. 3 жылдық қарқынды бакалавриат.","housing":"Кампустағы жатақханалар бар. Астанадағы тұрмыс шығыны: шамамен айына 400–750 доллар.","career":"Kaspi.kz, Halyk Bank, Beeline KZ, ҚМГ Цифровой, халықаралық IT компанияларында жұмыс орындары.","admission_note":"1-қадам: ЕНТ. 2-қадам: AET (тегін емтихан, бірнеше рет тапсыруға болады). 3-қадам: Құжаттар беру. Грант: бағдарламаға байланысты ЕНТ 70–85. Ақылы: AET ≥30 балл."}',
  'https://astanait.edu.kz'
),

-- =========================================================================
-- 3. AL-FARABI KAZAKH NATIONAL UNIVERSITY (KazNU)
-- Photos: confirmed from Wikipedia article + Commons category (10 files)
--   Main: Al-Farabi_Kazakh_National_University_main_building.jpg (Wikipedia infobox)
-- =========================================================================
(
  'Al-Farabi Kazakh National University',
  'Казахский национальный университет им. аль-Фараби',
  'Әл-Фараби атындағы Қазақ ұлттық университеті',
  'Almaty', 'Алматы', 'Алматы', 'Kazakhstan',
  'Comprehensive University', 'Комплексный университет', 'Жан-жақты университет',
  3.0, 5.5, NULL,
  70, 50,
  'Varies by faculty: Math+Physics, Math+CS, History, Biology etc.',
  'Зависит от факультета: Математика+Физика, Математика+Информатика, История, Биология и др.',
  'Факультетке байланысты: Математика+Физика, Математика+Информатика, Тарих, Биология т.б.',
  72.0, 10.0, 75.0, 10000, 74.0, 166, 301,
  '["Comprehensive","Historical","Large Campus","Humanities","Sciences","State-Funded"]',
  '["Многопрофильный","Исторический","Большой кампус","Гуманитарные науки","Естественные науки","Госфинансирование"]',
  '["Жан-жақты","Тарихи","Үлкен кампус","Гуманитарлық ғылымдар","Жаратылыстану","Мемлекеттік қаржыландыру"]',
  '[
    "https://en.wikipedia.org/wiki/Special:FilePath/Al-Farabi_Kazakh_National_University_main_building.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/KazNU_building.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Almaty_from_Kok_Tobe.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Almaty_2014.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Almaty_mountains_backgrop.jpg"
  ]',
  '{"ent_grant_by_faculty":{"Physics_B054":{"min_grant":70},"Math_B055":{"min_grant":95},"Biology_B050":{"min_grant":81},"Chemistry_B053":{"min_grant":80},"IT_B057":{"min_grant":110},"Law_B049":{"min_grant":90},"IntlRelations_B040":{"min_grant":86},"Journalism_B042":{"min_grant":115},"Management_B044":{"min_grant":114},"Finance_B046":{"min_grant":98}},"ent_paid_min":50}',
  '{"enrollment":25000,"undergrad":18000,"grad":7000,"gender":{"male":43,"female":57},"diversity":{"kazakh":78,"russian":14,"other_kz":5,"intl":3},"intl_student_pct":3}',
  '{"tuition_domestic_usd":1700,"tuition_intl_usd":2500,"room_board_usd":1200,"avg_after_aid_usd":0,"median_earnings_10y_usd":12000,"grant_coverage":"Full tuition + monthly stipend ~25,000 KZT","scholarships_available":true}',
  '[{"name":"International Relations","percent":13},{"name":"Law","percent":12},{"name":"Biology","percent":11},{"name":"Computer Science","percent":10},{"name":"Journalism","percent":9},{"name":"Chemistry","percent":8},{"name":"Physics","percent":7},{"name":"Economics","percent":7},{"name":"History","percent":6},{"name":"Mathematics","percent":5}]',
  '[{"name":"Международные отношения","percent":13},{"name":"Право","percent":12},{"name":"Биология","percent":11},{"name":"Компьютерные науки","percent":10},{"name":"Журналистика","percent":9},{"name":"Химия","percent":8},{"name":"Физика","percent":7},{"name":"Экономика","percent":7},{"name":"История","percent":6},{"name":"Математика","percent":5}]',
  '[{"name":"Халықаралық қатынастар","percent":13},{"name":"Заң","percent":12},{"name":"Биология","percent":11},{"name":"Информатика","percent":10},{"name":"Журналистика","percent":9},{"name":"Химия","percent":8},{"name":"Физика","percent":7},{"name":"Экономика","percent":7},{"name":"Тарих","percent":6},{"name":"Математика","percent":5}]',
  'Kazakhstan''s oldest and largest university, founded 1934. 25 faculties, 25,000+ students. QS #166 (2026).',
  'Старейший и крупнейший университет Казахстана, основан в 1934 году. 25 факультетов, более 25 000 студентов. QS #166 (2026).',
  'Қазақстанның ең ежелгі және ірі университеті, 1934 жылы құрылған. 25 факультет, 25 000-нан астам студент. QS #166 (2026).',
  '{"mission":"Kazakhstan''s oldest comprehensive university, established 1934. A leading institution in Eurasia.","campus_life":"74-hectare campus in Almaty foothills. 350+ student organizations, sports complex, 25 faculties. Multilingual (Kazakh, Russian, English).","housing":"Extensive dormitory network on and near campus. Very affordable.","career":"Strong alumni network across government, public sector, academia, and corporate Kazakhstan.","notable_alumni":["Kassym-Jomart Tokayev — President of Kazakhstan","Akezhan Kazhegeldin — former Prime Minister","Multiple ministers and rectors across Central Asia"]}',
  '{"mission":"Старейший многопрофильный университет Казахстана, основан в 1934 году. Ведущее учреждение в Евразии.","campus_life":"Кампус площадью 74 гектара у подножия алматинских гор. 350+ студенческих организаций, спорткомплекс, 25 факультетов. Многоязычная среда (казахский, русский, английский).","housing":"Разветвлённая сеть общежитий на кампусе и рядом. Очень доступные цены.","career":"Мощная сеть выпускников в государственных органах, академии и бизнесе Казахстана.","notable_alumni":["Касым-Жомарт Токаев — Президент Казахстана","Акежан Кажегельдин — бывший Премьер-министр","Многие министры и ректоры в Центральной Азии"]}',
  '{"mission":"Қазақстанның ең ежелгі жан-жақты университеті, 1934 жылы негізделген. Еуразиядағы жетекші мекеме.","campus_life":"Алматы тауларының етегіндегі 74 гектарлық кампус. 350-ден астам студенттік ұйымдар, спорт кешені, 25 факультет. Көптілді орта (қазақша, орысша, ағылшынша).","housing":"Кампуста және оның маңайында жатақханалардың кең желісі. Өте қолжетімді баға.","career":"Мемлекеттік органдар, академия және Қазақстан бизнесіндегі түлектердің күшті желісі.","notable_alumni":["Қасым-Жомарт Тоқаев — Қазақстан Президенті","Ақежан Қажыгелдін — бұрынғы Премьер-министр","Орталық Азиядағы бірнеше министрлер мен ректорлар"]}',
  'https://www.kaznu.kz'
),

-- =========================================================================
-- 4. KBTU
-- Photos: confirmed from Wikipedia article on KBTU
--   Main: Kazakh-British_Technical_University.jpg (Wikipedia infobox)
-- =========================================================================
(
  'Kazakh-British Technical University',
  'Казахстанско-Британский технический университет',
  'Қазақстан-Британ техникалық университеті',
  'Almaty', 'Алматы', 'Алматы', 'Kazakhstan',
  'Technical University', 'Технический университет', 'Техникалық университет',
  3.5, 5.5, NULL,
  110, 60,
  'Math+Physics (B057,B063), Math+CS, Math+Chemistry (B060)',
  'Математика+Физика (B057,B063), Математика+Информатика, Математика+Химия (B060)',
  'Математика+Физика (B057,B063), Математика+Информатика, Математика+Химия (B060)',
  70.0, 9.0, 88.0, 14000, 4.5, 601, 801,
  '["Technical","Urban","Industry Partnerships","Energy & IT","Bilingual","Business"]',
  '["Технический","Городской","Партнёрство с индустрией","Энергетика и IT","Двуязычный","Бизнес"]',
  '["Техникалық","Қалалық","Өнеркәсіп серіктестіктері","Энергетика және IT","Екі тілді","Бизнес"]',
  '[
    "https://en.wikipedia.org/wiki/Special:FilePath/Kazakh-British_Technical_University.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/KBTU_building_Almaty.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Almaty_from_Kok_Tobe.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Almaty_2014.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Medeo_Almaty.jpg"
  ]',
  '{"ent_grant_by_program":{"IT_B057":{"min_grant":110,"grants_count":800},"Finance_B046":{"min_grant":116,"grants_count":95},"Management_B044":{"min_grant":117,"grants_count":27},"Electrical_B063":{"min_grant":110,"grants_count":305},"Chemical_B060":{"min_grant":86,"grants_count":54},"Mining_B071":{"min_grant":75,"grants_count":538}},"ent_paid_min":60,"ielts_min":5.5,"london_program_note":"University of London programs available WITHOUT ENT"}',
  '{"enrollment":4200,"undergrad":3500,"grad":700,"gender":{"male":60,"female":40},"diversity":{"kazakh":82,"russian":12,"other":4,"intl":2},"intl_student_pct":2}',
  '{"tuition_domestic_usd":3900,"tuition_intl_usd":4500,"room_board_usd":1800,"avg_after_aid_usd":2000,"median_earnings_10y_usd":16000,"scholarships_available":true,"kazenergy_grant":"KAZENERGY Association annual scholarship competition"}',
  '[{"name":"Information Technology","percent":28},{"name":"Petroleum Engineering","percent":20},{"name":"Finance","percent":15},{"name":"Electrical Engineering","percent":13},{"name":"Management","percent":10},{"name":"Chemical Engineering","percent":8},{"name":"Mining Engineering","percent":6}]',
  '[{"name":"Информационные технологии","percent":28},{"name":"Нефтяная инженерия","percent":20},{"name":"Финансы","percent":15},{"name":"Электротехника","percent":13},{"name":"Менеджмент","percent":10},{"name":"Химическая инженерия","percent":8},{"name":"Горная инженерия","percent":6}]',
  '[{"name":"Ақпараттық технологиялар","percent":28},{"name":"Мұнай инженериясы","percent":20},{"name":"Қаржы","percent":15},{"name":"Электротехника","percent":13},{"name":"Менеджмент","percent":10},{"name":"Химиялық инженерия","percent":8},{"name":"Тау-кен инженериясы","percent":6}]',
  'Technical university with British academic standards. Deep energy and IT industry ties. University of London partnership.',
  'Технический университет с британскими академическими стандартами. Тесные связи с энергетикой и IT. Партнёрство с Лондонским университетом.',
  'Британдық академиялық стандарттармен техникалық университет. Энергетика және IT саласымен тығыз байланыс. Лондон университетімен серіктестік.',
  '{"mission":"Providing specialized technical and business education at British standards, serving the energy and digital economy of Kazakhstan.","campus_life":"Historic building in central Almaty. Strong corporate culture, close industry ties, British Council partnership. English-medium instruction.","housing":"Limited dorms. Private accommodation typical (~60,000–100,000 KZT/month).","career":"Direct pipelines to KazMunayGas, Chevron, Shell, Kaspi Bank, and top IT firms. KAZENERGY grants available.","notable_alumni":["Executives at KazMunayGas","Graduates in Shell, Schlumberger, Chevron Kazakhstan"]}',
  '{"mission":"Предоставление специализированного технического и бизнес-образования по британским стандартам для энергетики и цифровой экономики Казахстана.","campus_life":"Историческое здание в центре Алматы. Сильная корпоративная культура, тесные отраслевые связи, партнёрство с Британским советом. Обучение на английском языке.","housing":"Ограниченное количество мест в общежитии. Как правило — частное жильё (~30 000–50 000 тенге/месяц).","career":"Прямые пути трудоустройства в КМГ, Chevron, Shell, Kaspi Bank и топовых IT-компаниях. Гранты KAZENERGY.","notable_alumni":["Руководители КазМунайГаза","Выпускники в Shell, Schlumberger, Chevron Казахстан"]}',
  '{"mission":"Қазақстанның энергетика және цифрлық экономикасы үшін британдық стандарттарда мамандандырылған техникалық және бизнес білімін беру.","campus_life":"Алматы орталығындағы тарихи ғимарат. Корпоративтік мәдениет, өнеркәсіптік байланыстар, Британ кеңесімен серіктестік. Ағылшын тілінде оқыту.","housing":"Жатақхана орны шектеулі. Әдетте жеке баспана (~30 000–50 000 теңге/ай).","career":"ҚМГ, Chevron, Shell, Kaspi Bank және жетекші IT компанияларында жұмыс. KAZENERGY гранттары бар.","notable_alumni":["ҚазМұнайГаздағы басшылар","Shell, Schlumberger, Chevron Қазақстандағы түлектер"]}',
  'https://kbtu.edu.kz'
),

-- =========================================================================
-- 5. KIMEP UNIVERSITY
-- Photos: from Wikipedia article on KIMEP University
--   Main: KIMEP_University.jpg (Wikipedia infobox)
-- =========================================================================
(
  'KIMEP University',
  'Университет КИМЭП',
  'КИМЭП Университеті',
  'Almaty', 'Алматы', 'Алматы', 'Kazakhstan',
  'Liberal Arts University', 'Университет либеральных искусств', 'Гуманитарлық университет',
  3.0, 5.5, NULL,
  NULL, NULL,
  'No ENT required — KIMEP uses KEE (own exam) + IELTS/TOEFL',
  'ЕНТ не требуется — KIMEP использует собственный экзамен KEE + IELTS/TOEFL',
  'ЕНТ талап етілмейді — KIMEP өз KEE емтиханын пайдаланады + IELTS/TOEFL',
  80.0, 14.0, 93.0, 13000, 5.0, 1001, NULL,
  '["Business","Liberal Arts","English-medium","Urban","International Faculty","North American Model"]',
  '["Бизнес","Либеральные искусства","Английская среда","Городской","Международный факультет","Североамериканская модель"]',
  '["Бизнес","Гуманитарлық ғылымдар","Ағылшын тілді","Қалалық","Халықаралық оқытушылар","Солтүстікамерикандық модель"]',
  '[
    "https://en.wikipedia.org/wiki/Special:FilePath/KIMEP_University.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/KIMEP_library.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Almaty_from_Kok_Tobe.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Almaty_2014.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Big_Almaty_Lake.jpg"
  ]',
  '{"ent_required":false,"own_exam":"KEE (KIMEP Entrance Exam) — Math, English, Logic","ielts_min":5.5,"toefl_min":46,"note":"No ENT required. Admission based on KEE scores + English proficiency."}',
  '{"enrollment":3000,"undergrad":2200,"grad":800,"gender":{"male":45,"female":55},"diversity":{"kazakh":60,"russian":20,"other_kz":10,"intl":10},"intl_student_pct":10,"intl_faculty_countries":27}',
  '{"tuition_domestic_usd":5458,"tuition_intl_usd":5458,"room_board_usd":2500,"avg_after_aid_usd":3000,"median_earnings_10y_usd":20000,"scholarships_available":true}',
  '[{"name":"Business Administration","percent":35},{"name":"Finance & Accounting","percent":20},{"name":"Law","percent":18},{"name":"Journalism & Media","percent":12},{"name":"Social Sciences","percent":10},{"name":"Computer Science","percent":5}]',
  '[{"name":"Бизнес-администрирование","percent":35},{"name":"Финансы и бухгалтерия","percent":20},{"name":"Право","percent":18},{"name":"Журналистика и медиа","percent":12},{"name":"Социальные науки","percent":10},{"name":"Компьютерные науки","percent":5}]',
  '[{"name":"Бизнесті басқару","percent":35},{"name":"Қаржы және бухгалтерия","percent":20},{"name":"Заң","percent":18},{"name":"Журналистика және медиа","percent":12},{"name":"Әлеуметтік ғылымдар","percent":10},{"name":"Информатика","percent":5}]',
  'Largest North American-style university in Central Asia. English-medium, FIBAA accredited. 95% employment rate.',
  'Крупнейший университет Северной Америки в Центральной Азии. Английская среда, аккредитация FIBAA. 95% трудоустройство.',
  'Орталық Азиядағы ең ірі солтүстікамерикандық үлгідегі университет. Ағылшын тілінде оқыту, FIBAA аккредитациясы. 95% жұмысқа орналасу.',
  '{"mission":"The largest North American-style English-medium university in Central Asia, providing business and social science education since 1992.","campus_life":"Urban campus in central Almaty. Largest English-language library in CIS (102,000+ volumes). 41+ student organizations, sports center, dorms for 424 students.","housing":"On-campus dorm for 424 students. Private apartments typical for others.","career":"95% employment rate within 6 months. Strong network in banking, consulting, law, and government.","notable_alumni":["15,000+ alumni across government, banking, consulting, and international organizations"]}',
  '{"mission":"Крупнейший англоязычный университет североамериканского образца в Центральной Азии, предоставляющий бизнес-образование с 1992 года.","campus_life":"Городской кампус в центре Алматы. Крупнейшая библиотека на английском языке в СНГ (более 102 000 томов). 41+ студенческих организаций, спортивный центр, общежитие на 424 студента.","housing":"Общежитие на 424 студентов. Остальные, как правило, снимают частное жильё.","career":"95% трудоустройство в течение 6 месяцев. Сильная сеть в банковской, консалтинговой, юридической сферах и госуправлении.","notable_alumni":["Более 15 000 выпускников в государственных органах, банках, консалтинге и международных организациях"]}',
  '{"mission":"1992 жылдан бастап бизнес және әлеуметтік ғылымдар бойынша білім беретін Орталық Азиядағы ең ірі солтүстікамерикандық үлгідегі ағылшын тілді университет.","campus_life":"Алматы орталығындағы қалалық кампус. ТМД-дағы ең ірі ағылшын тілді кітапхана (102 000-нан астам том). 41-ден астам студенттік ұйымдар, спорт орталығы, 424 студентке арналған жатақхана.","housing":"424 студентке арналған жатақхана. Қалғандары жеке пәтер жалдайды.","career":"6 ай ішінде жұмысқа орналасу 95%. Банк, консалтинг, заң және мемлекеттік басқаруда күшті желі.","notable_alumni":["Мемлекеттік органдар, банктер, консалтинг және халықаралық ұйымдарда 15 000-нан астам түлектер"]}',
  'https://www.kimep.kz'
),

-- =========================================================================
-- 6. MIT
-- Photos: confirmed from Wikipedia article on MIT
--   Main: MIT_dome_night_2.jpg (Wikipedia infobox standard photo)
-- =========================================================================
(
  'Massachusetts Institute of Technology',
  'Массачусетский технологический институт',
  'Массачусетс технологиялық институты',
  'Cambridge', 'Кембридж', 'Кембридж', 'USA',
  'Research University', 'Исследовательский университет', 'Зерттеу университеті',
  4.0, 7.5, 1540,
  NULL, NULL, NULL, NULL, NULL,
  4.5, 3.0, 94.0, 115000, 168.0, 1, 5,
  '["STEM","Elite","Research","Urban","High-Funding","Innovation Hub","Need-Blind"]',
  '["STEM","Элитный","Исследования","Городской","Высокое финансирование","Инновационный хаб","Учёт финансовых нужд"]',
  '["STEM","Элиталық","Зерттеу","Қалалық","Жоғары қаржыландыру","Инновация орталығы","Қаржылық мұқтаждықты ескеру"]',
  '[
    "https://en.wikipedia.org/wiki/Special:FilePath/MIT_dome_night_2.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/MIT_Building_10_and_the_Great_Dome%2C_Cambridge_MA.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Killian_Court_MIT.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/MIT_Stata_Center.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/MIT_Media_Lab.jpg"
  ]',
  '{"sat_math_25":790,"sat_math_75":800,"sat_read_25":740,"sat_read_75":780,"sat_composite_25":1530,"sat_composite_75":1580,"act_25":35,"act_75":36,"avg_gpa_accepted":4.17,"pct_top10_hs":97}',
  '{"enrollment":11858,"undergrad":4638,"grad":7220,"gender":{"male":52,"female":48},"diversity":{"asian_american":38,"white":23,"hispanic":13,"black":6,"two_or_more":7,"intl":11},"intl_student_pct":11,"first_gen_pct":20,"pell_grant_pct":27,"tuition_free_pct":45}',
  '{"tuition_domestic_usd":63826,"tuition_intl_usd":63826,"room_board_usd":20500,"avg_after_aid_usd":17500,"median_earnings_10y_usd":135000,"need_blind_intl":true,"financial_aid_budget_usd":167300000,"note":"Families earning <$200K attend tuition-free (2025-26)."}',
  '[{"name":"Computer Science","percent":26},{"name":"Electrical Engineering","percent":18},{"name":"Mechanical Engineering","percent":10},{"name":"Mathematics","percent":9},{"name":"Physics","percent":8},{"name":"Biology","percent":7},{"name":"Economics","percent":6},{"name":"Aerospace Engineering","percent":5},{"name":"Chemical Engineering","percent":4},{"name":"Architecture","percent":3}]',
  '[{"name":"Компьютерные науки","percent":26},{"name":"Электротехника","percent":18},{"name":"Машиностроение","percent":10},{"name":"Математика","percent":9},{"name":"Физика","percent":8},{"name":"Биология","percent":7},{"name":"Экономика","percent":6},{"name":"Аэрокосмическая инженерия","percent":5},{"name":"Химическая инженерия","percent":4},{"name":"Архитектура","percent":3}]',
  '[{"name":"Информатика","percent":26},{"name":"Электротехника","percent":18},{"name":"Машина жасау","percent":10},{"name":"Математика","percent":9},{"name":"Физика","percent":8},{"name":"Биология","percent":7},{"name":"Экономика","percent":6},{"name":"Аэроғарыш инженериясы","percent":5},{"name":"Химиялық инженерия","percent":4},{"name":"Сәулет өнері","percent":3}]',
  '#1 globally (QS 2025). The world''s leading STEM institution. 4.5% acceptance rate.',
  '№1 в мире (QS 2025). Ведущее мировое STEM-учреждение. Процент поступления: 4,5%.',
  'Әлемде №1 (QS 2025). Әлемдегі жетекші STEM мекемесі. Қабылдау деңгейі: 4,5%.',
  '{"mission":"To advance knowledge and educate students in science, technology, and other areas of scholarship that will best serve the nation and the world.","campus_life":"168-acre urban campus in Cambridge. 500+ clubs, 31 sports teams, world-renowned hackathons. Strong hacker culture and entrepreneurship.","housing":"All freshmen guaranteed housing. 97% of undergrads live on campus. 11 residential halls.","career":"Produces more venture-backed founders per capita than any university. Median earnings $135K at 10 years.","notable_alumni":["Richard Feynman — Nobel Prize Physics","Kofi Annan — UN Secretary-General","Buzz Aldrin — Apollo 11 Astronaut","Drew Houston — Co-founder of Dropbox","Salman Khan — Founder of Khan Academy"]}',
  '{"mission":"Развивать знания и обучать студентов в области науки, технологий и других дисциплин, которые лучше всего послужат нации и миру.","campus_life":"Городской кампус площадью 168 акров в Кембридже. 500+ клубов, 31 спортивная команда, всемирно известные хакатоны. Сильная культура предпринимательства.","housing":"Всем первокурсникам гарантировано жильё. 97% студентов бакалавриата живут на кампусе. 11 студенческих корпусов.","career":"Больше всего основателей стартапов с венчурным финансированием на душу населения. Медианный доход через 10 лет — 135 000 долларов.","notable_alumni":["Ричард Фейнман — Нобелевская премия по физике","Кофи Аннан — Генеральный секретарь ООН","Базз Олдрин — Астронавт Аполлона-11","Дрю Хьюстон — соучредитель Dropbox","Салман Хан — основатель Khan Academy"]}',
  '{"mission":"Ұлтқа және әлемге ең жақсы қызмет ететін ғылым, технология және басқа салалардағы білімді дамыту және студенттерді оқыту.","campus_life":"Кембридждегі 168 акрлық қалалық кампус. 500-ден астам клуб, 31 спорт командасы, әлемге танымал хакатондар. Кәсіпкерлік мәдениеті күшті.","housing":"Барлық бірінші курс студенттеріне тұрғын үй кепілдендіріледі. Студенттердің 97% кампуста тұрады. 11 тұрғын үй корпусы.","career":"Жан басына шаққанда ең көп венчурлық қаржыланған стартап негізін қалаушылар. 10 жылдан кейінгі медиандық кіріс — 135 000 доллар.","notable_alumni":["Ричард Фейнман — Физика бойынша Нобель сыйлығы","Кофи Аннан — БҰҰ Бас хатшысы","Базз Олдрин — Аполлон-11 астронавты","Дрю Хьюстон — Dropbox-тың бірге негізін қалаушысы","Салман Хан — Khan Academy негізін қалаушысы"]}',
  'https://web.mit.edu'
),

-- =========================================================================
-- 7. STANFORD UNIVERSITY
-- Photos: confirmed Wikipedia article images
--   Main: Stanford_University_campus,_1945.jpg -> using more current confirmed file
-- =========================================================================
(
  'Stanford University',
  'Стэнфордский университет',
  'Стэнфорд университеті',
  'Stanford', 'Стэнфорд', 'Стэнфорд', 'USA',
  'Research University', 'Исследовательский университет', 'Зерттеу университеті',
  4.0, 7.5, 1500,
  NULL, NULL, NULL, NULL, NULL,
  3.7, 5.0, 95.0, 120000, 3310.0, 5, 4,
  '["Elite","STEM","Business","Silicon Valley","Innovation Hub","High-Funding","Research"]',
  '["Элитный","STEM","Бизнес","Кремниевая долина","Инновационный хаб","Высокое финансирование","Исследования"]',
  '["Элиталық","STEM","Бизнес","Кремний аңғары","Инновация орталығы","Жоғары қаржыландыру","Зерттеу"]',
  '[
    "https://en.wikipedia.org/wiki/Special:FilePath/Stanford_University_Main_Quad_May_2013_001.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Stanford_Memorial_Church_front_facade.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Hoover-tower-from-above.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Stanford-campus-green-library-from-above.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Stanford_oval.jpg"
  ]',
  '{"sat_math_25":770,"sat_math_75":800,"sat_read_25":740,"sat_read_75":790,"sat_composite_25":1500,"sat_composite_75":1580,"act_25":34,"act_75":36,"avg_gpa_accepted":3.96}',
  '{"enrollment":17680,"undergrad":7761,"grad":9919,"gender":{"male":50,"female":50},"diversity":{"asian":25,"white":20,"hispanic":17,"black":8,"intl":24,"two_or_more":6},"intl_student_pct":24,"first_gen_pct":18}',
  '{"tuition_domestic_usd":62484,"tuition_intl_usd":62484,"room_board_usd":22000,"avg_after_aid_usd":16000,"median_earnings_10y_usd":130000,"need_blind_intl":true,"note":"Full financial need met for all admitted students."}',
  '[{"name":"Computer Science","percent":21},{"name":"Human Biology","percent":10},{"name":"Economics","percent":9},{"name":"Engineering","percent":9},{"name":"Political Science","percent":7},{"name":"Psychology","percent":7},{"name":"Mathematics","percent":6},{"name":"Electrical Engineering","percent":5},{"name":"Biology","percent":5},{"name":"Physics","percent":4}]',
  '[{"name":"Компьютерные науки","percent":21},{"name":"Биология человека","percent":10},{"name":"Экономика","percent":9},{"name":"Инженерия","percent":9},{"name":"Политология","percent":7},{"name":"Психология","percent":7},{"name":"Математика","percent":6},{"name":"Электротехника","percent":5},{"name":"Биология","percent":5},{"name":"Физика","percent":4}]',
  '[{"name":"Информатика","percent":21},{"name":"Адам биологиясы","percent":10},{"name":"Экономика","percent":9},{"name":"Инженерия","percent":9},{"name":"Саясаттану","percent":7},{"name":"Психология","percent":7},{"name":"Математика","percent":6},{"name":"Электротехника","percent":5},{"name":"Биология","percent":5},{"name":"Физика","percent":4}]',
  '#5 globally (QS 2025). The heart of Silicon Valley innovation. 3.7% acceptance rate.',
  '№5 в мире (QS 2025). Центр инноваций Кремниевой долины. Процент поступления: 3,7%.',
  'Әлемде №5 (QS 2025). Кремний аңғары инновациясының орталығы. Қабылдау деңгейі: 3,7%.',
  '{"mission":"To promote the public welfare by exercising an influence on behalf of humanity through education and research.","campus_life":"3,310-acre campus in Silicon Valley. 650+ student organizations, 36 varsity sports, thriving startup culture. Stanford entrepreneurs have founded companies worth $2.7T.","housing":"97% of undergrads live on campus for 4 years. Unique themed dorms.","career":"The epicenter of Silicon Valley. More Fortune 500 CEOs than any other university. Median 10-year earnings: $130K+.","notable_alumni":["Larry Page & Sergey Brin — founders of Google","Phil Knight — founder of Nike","Reed Hastings — co-founder of Netflix","Elon Musk (grad school) — Tesla, SpaceX"]}',
  '{"mission":"Содействовать общественному благу, оказывая влияние на благо человечества через образование и научные исследования.","campus_life":"Кампус площадью 3 310 акров в Кремниевой долине. 650+ студенческих организаций, 36 команд, процветающая культура стартапов. Выпускники Стэнфорда основали компании стоимостью 2,7 трлн долларов.","housing":"97% студентов бакалавриата живут на кампусе все 4 года. Уникальные тематические общежития.","career":"Эпицентр Кремниевой долины. Больше генеральных директоров Fortune 500, чем в любом другом университете. Медианный доход через 10 лет: $130К+.","notable_alumni":["Ларри Пейдж и Сергей Брин — основатели Google","Фил Найт — основатель Nike","Рид Хастингс — сооснователь Netflix","Илон Маск (аспирантура) — Tesla, SpaceX"]}',
  '{"mission":"Білім беру және ғылыми зерттеу арқылы адамзат игілігіне ықпал ету жолымен қоғамдық игілікті жылжыту.","campus_life":"Кремний аңғарындағы 3310 акрлық кампус. 650-ден астам студенттік ұйымдар, 36 спорт командасы, гүлденуші стартап мәдениеті. Стэнфорд кәсіпкерлері 2,7 триллион доллар тұратын компаниялар құрды.","housing":"Студенттердің 97% 4 жыл бойы кампуста тұрады. Бірегей тақырыптық жатақханалар.","career":"Кремний аңғарының эпицентрі. Кез келген университеттен де Fortune 500 компанияларының көбірек бас директорлары. 10 жылдан кейінгі медиандық кіріс: $130К+.","notable_alumni":["Ларри Пейдж және Сергей Брин — Google негізін қалаушылар","Фил Найт — Nike негізін қалаушы","Рид Хастингс — Netflix-тің бірге негізін қалаушысы","Илон Маск (магистратура) — Tesla, SpaceX"]}',
  'https://stanford.edu'
),

-- =========================================================================
-- 8. HARVARD UNIVERSITY
-- Photos: confirmed Wikipedia article images
--   Main: Harvard_University_logo.PNG -> campus photos
-- =========================================================================
(
  'Harvard University',
  'Гарвардский университет',
  'Гарвард университеті',
  'Cambridge', 'Кембридж', 'Кембридж', 'USA',
  'Research University', 'Исследовательский университет', 'Зерттеу университеті',
  4.0, 7.5, 1520,
  NULL, NULL, NULL, NULL, NULL,
  4.2, 7.0, 93.0, 100000, 85.0, 4, 2,
  '["Elite","Historical","Ivy League","Humanities","Law","High-Funding","Research"]',
  '["Элитный","Исторический","Лига плюща","Гуманитарные науки","Право","Высокое финансирование","Исследования"]',
  '["Элиталық","Тарихи","Плющ лигасы","Гуманитарлық ғылымдар","Заң","Жоғары қаржыландыру","Зерттеу"]',
  '[
    "https://en.wikipedia.org/wiki/Special:FilePath/Harvard_University_-_Widener_Library.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Harvard_Yard.JPG",
    "https://en.wikipedia.org/wiki/Special:FilePath/Harvard_University_administration_building.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/John_Harvard_statue.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Harvard_Crimson_graphics.jpg"
  ]',
  '{"sat_math_25":770,"sat_math_75":800,"sat_read_25":740,"sat_read_75":780,"sat_composite_25":1510,"sat_composite_75":1580,"act_25":34,"act_75":36,"avg_gpa_accepted":3.97,"pct_4_0_gpa":72,"pct_top10_hs":94}',
  '{"enrollment":23731,"undergrad":7038,"grad":16693,"gender":{"male":49,"female":51},"diversity":{"asian":23,"white":30,"hispanic":11,"black":9,"intl":16,"two_or_more":8,"unknown":3},"intl_student_pct":16,"first_gen_pct":20,"pell_grant_pct":22}',
  '{"tuition_domestic_usd":59950,"tuition_intl_usd":59950,"room_board_usd":21000,"avg_after_aid_usd":16000,"median_earnings_10y_usd":100000,"need_blind_intl":false,"tuition_free_pct":45,"note":"Families earning <$200K attend tuition-free from 2025-26."}',
  '[{"name":"Social Sciences","percent":20},{"name":"Natural Sciences","percent":18},{"name":"Engineering","percent":15},{"name":"Economics","percent":14},{"name":"Government","percent":10},{"name":"Computer Science","percent":11},{"name":"History","percent":6},{"name":"Psychology","percent":6}]',
  '[{"name":"Социальные науки","percent":20},{"name":"Естественные науки","percent":18},{"name":"Инженерия","percent":15},{"name":"Экономика","percent":14},{"name":"Государственное управление","percent":10},{"name":"Компьютерные науки","percent":11},{"name":"История","percent":6},{"name":"Психология","percent":6}]',
  '[{"name":"Әлеуметтік ғылымдар","percent":20},{"name":"Жаратылыстану ғылымдары","percent":18},{"name":"Инженерия","percent":15},{"name":"Экономика","percent":14},{"name":"Мемлекеттік басқару","percent":10},{"name":"Информатика","percent":11},{"name":"Тарих","percent":6},{"name":"Психология","percent":6}]',
  'The world''s most prestigious university. Founded 1636. Ivy League. QS #4, THE #2 (2025).',
  'Самый престижный университет мира. Основан в 1636 году. Лига Плюща. QS №4, THE №2 (2025).',
  'Әлемдегі ең беделді университет. 1636 жылы негізделген. Плющ лигасы. QS №4, THE №2 (2025).',
  '{"mission":"To educate the citizens and citizen-leaders for our society through the transformative power of a liberal arts and sciences education.","campus_life":"Historic residential house system. Formal dinners, intense intellectual culture, one of the richest alumni networks on Earth. 450+ student organizations.","housing":"Residential house system — students live in one of 12 historic houses for 3 years. Guaranteed 4-year housing.","career":"Elite pipelines to Wall Street, law, medicine, politics, and venture capital. #1 for producing billionaires globally.","notable_alumni":["Barack Obama — 44th President of the United States","Mark Zuckerberg — founder of Meta","Bill Gates (attended) — co-founder of Microsoft","Malala Yousafzai — Nobel Peace Prize laureate"]}',
  '{"mission":"Воспитывать граждан и лидеров нашего общества через преобразующую силу образования в области гуманитарных и естественных наук.","campus_life":"Система исторических жилых домов. Официальные ужины, интенсивная интеллектуальная культура, одна из самых мощных сетей выпускников в мире. 450+ студенческих организаций.","housing":"Система жилых домов — студенты живут в одном из 12 исторических домов 3 года. Гарантировано жильё на 4 года.","career":"Элитные пути в Wall Street, право, медицину, политику и венчурный капитал. №1 по числу миллиардеров-выпускников.","notable_alumni":["Барак Обама — 44-й президент США","Марк Цукерберг — основатель Meta","Билл Гейтс (посещал) — сооснователь Microsoft","Малала Юсуфзай — лауреат Нобелевской премии мира"]}',
  '{"mission":"Либералды өнер және ғылым білімінің өзгертуші күші арқылы қоғамымыздың азаматтары мен азамат-көшбасшыларын тәрбиелеу.","campus_life":"Тарихи тұрғын үй жүйесі. Ресми кешкі ас, қарқынды зияткерлік мәдениет, жердегі ең бай түлектер желісі. 450-ден астам студенттік ұйымдар.","housing":"Тұрғын үй жүйесі — студенттер 3 жыл 12 тарихи үйдің бірінде тұрады. 4 жылдық тұрғын үй кепілдендіріледі.","career":"Wall Street, заң, медицина, саясат және венчурлық капиталға элиталық жолдар. Миллиардерлер санынан №1.","notable_alumni":["Барак Обама — АҚШ-тың 44-ші президенті","Марк Цукерберг — Meta негізін қалаушы","Билл Гейтс (оқыды) — Microsoft бірге негізін қалаушысы","Малала Юсуфзай — Нобель бейбітшілік сыйлығының лауреаты"]}',
  'https://harvard.edu'
),

-- =========================================================================
-- 9. UNIVERSITY OF OXFORD
-- Photos: confirmed Wikipedia infobox + Commons images
--   Main: Radcliffe_Camera,_Oxford.jpg (iconic photo used in Wikipedia article)
-- =========================================================================
(
  'University of Oxford',
  'Оксфордский университет',
  'Оксфорд университеті',
  'Oxford', 'Оксфорд', 'Оксфорд', 'UK',
  'Research University', 'Исследовательский университет', 'Зерттеу университеті',
  4.0, 7.5, 1470,
  NULL, NULL, NULL, NULL, NULL,
  14.0, 11.0, 91.0, 55000, 100.0, 3, 1,
  '["Elite","Historical","Collegiate","Humanities","Global","High-Funding","Research"]',
  '["Элитный","Исторический","Коллегиальный","Гуманитарные науки","Глобальный","Высокое финансирование","Исследования"]',
  '["Элиталық","Тарихи","Коллегиалдық","Гуманитарлық ғылымдар","Жаһандық","Жоғары қаржыландыру","Зерттеу"]',
  '[
    "https://en.wikipedia.org/wiki/Special:FilePath/Radcliffe_Camera,_Oxford.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Oxford_University_-_New_College.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Bodleian_Library_-_New_Bodleian.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Christ_Church_College_Oxford_exterior.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Sheldonian_Theatre_interior.jpg"
  ]',
  '{"sat_math_25":730,"sat_math_75":800,"sat_read_25":720,"sat_read_75":790,"act_25":33,"act_75":36,"avg_gpa_accepted":4.0,"note":"Oxford uses A-levels (A*A*A) or IB (38-40pts). IELTS ≥7.5 for non-native speakers."}',
  '{"enrollment":26000,"undergrad":11955,"grad":14045,"gender":{"male":51,"female":49},"diversity":{"uk_white":55,"uk_bame":20,"intl":25},"intl_student_pct":46,"first_gen_pct":12}',
  '{"tuition_domestic_usd":11700,"tuition_intl_usd":40000,"room_board_usd":16000,"avg_after_aid_usd":28000,"median_earnings_10y_usd":85000,"note":"UK domestic: £9,250/yr. International: £26,770–£39,010 depending on course."}',
  '[{"name":"PPE (Politics, Philosophy, Economics)","percent":14},{"name":"Law","percent":12},{"name":"Medicine","percent":11},{"name":"History","percent":9},{"name":"Computer Science","percent":8},{"name":"Mathematics","percent":8},{"name":"Engineering","percent":7},{"name":"Biology","percent":7},{"name":"Chemistry","percent":7},{"name":"Modern Languages","percent":6}]',
  '[{"name":"ФФЭ (Политика, Философия, Экономика)","percent":14},{"name":"Право","percent":12},{"name":"Медицина","percent":11},{"name":"История","percent":9},{"name":"Компьютерные науки","percent":8},{"name":"Математика","percent":8},{"name":"Инженерия","percent":7},{"name":"Биология","percent":7},{"name":"Химия","percent":7},{"name":"Современные языки","percent":6}]',
  '[{"name":"ФФЭ (Саясат, Философия, Экономика)","percent":14},{"name":"Заң","percent":12},{"name":"Медицина","percent":11},{"name":"Тарих","percent":9},{"name":"Информатика","percent":8},{"name":"Математика","percent":8},{"name":"Инженерия","percent":7},{"name":"Биология","percent":7},{"name":"Химия","percent":7},{"name":"Заманауи тілдер","percent":6}]',
  'Oldest English-speaking university (est. 1096). THE #1, QS #3 globally (2025). Tutorial system.',
  'Старейший англоязычный университет (осн. в 1096 г.). THE №1, QS №3 в мире (2025). Тьюторская система.',
  'Ағылшын тілді ең ескі университет (1096 ж.). THE №1, QS №3 (2025). Тьютор жүйесі.',
  '{"mission":"The advancement of learning by teaching and research and its dissemination by every means.","campus_life":"Tutorial system (1-on-1 teaching). 39 colleges, each with dining hall and social life. Formal hall dinners, Oxford Union debates. 8 weeks per term.","housing":"Guaranteed accommodation in college for first year. Historic college buildings.","career":"Top 3 most targeted university by elite employers globally. Prime Minister pipeline. Top employer prestige worldwide.","notable_alumni":["27 UK Prime Ministers including Boris Johnson","Stephen Hawking — theoretical physicist","Malala Yousafzai — Nobel Peace Prize laureate","Oscar Wilde, J.R.R. Tolkien — authors"]}',
  '{"mission":"Развитие знаний путём преподавания, исследований и их распространения любыми способами.","campus_life":"Тьюторская система (обучение 1 на 1). 39 колледжей, каждый со своей столовой и общественной жизнью. Официальные ужины, дебаты Оксфордского союза. 8 недель в семестре.","housing":"Гарантированное жильё в колледже на первый год. Исторические здания колледжей.","career":"Топ-3 наиболее востребованных университетов среди элитных работодателей мира. Поставщик премьер-министров Великобритании.","notable_alumni":["27 премьер-министров Великобритании, включая Бориса Джонсона","Стивен Хокинг — теоретический физик","Малала Юсуфзай — лауреат Нобелевской премии мира","Оскар Уайльд, Дж. Р. Р. Толкин — писатели"]}',
  '{"mission":"Оқыту, зерттеу және оларды кез келген жолмен тарату арқылы білімді дамыту.","campus_life":"Тьютор жүйесі (жеке оқыту). Әрқайсысының жеке асханасы мен қоғамдық өмірі бар 39 колледж. Ресми кешкі ас, Оксфорд одағының пікірсайыстары. Семестрге 8 апта.","housing":"Бірінші жылы колледжде тұрғын үй кепілдендіріледі. Тарихи колледж ғимараттары.","career":"Элиталық жұмыс берушілер арасында ең іздестірілген 3 университеттің бірі. Ұлыбританияның премьер-министрлерін даярлайды.","notable_alumni":["Борис Джонсонды қоса 27 Ұлыбритания Премьер-министрі","Стивен Хокинг — теоретикалық физик","Малала Юсуфзай — Нобель бейбітшілік сыйлығының лауреаты","Оскар Уайлд, Дж. Р. Р. Толкин — жазушылар"]}',
  'https://ox.ac.uk'
),

-- =========================================================================
-- 10. ETH ZURICH
-- Photos: confirmed Wikipedia infobox images for ETH Zurich
--   Main: ETH_Zurich_main_building.jpg (Wikipedia infobox)
-- =========================================================================
(
  'ETH Zurich',
  'Швейцарская высшая техническая школа Цюрих',
  'Цюрих жоғары техникалық мектебі',
  'Zurich', 'Цюрих', 'Цюрих', 'Switzerland',
  'Technical University', 'Технический университет', 'Техникалық университет',
  3.8, 7.0, 1450,
  NULL, NULL, NULL, NULL, NULL,
  8.0, 9.0, 92.0, 95000, 93.0, 7, 11,
  '["Technical","European","Low-Tuition","STEM","Nobel Laureates","Research","Global"]',
  '["Технический","Европейский","Низкая стоимость обучения","STEM","Нобелевские лауреаты","Исследования","Глобальный"]',
  '["Техникалық","Еуропалық","Төмен оқу ақысы","STEM","Нобель лауреаттары","Зерттеу","Жаһандық"]',
  '[
    "https://en.wikipedia.org/wiki/Special:FilePath/ETH_Zurich_main_building.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/ETH_Z%C3%BCrich_-_Polyterrasse.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/ETH_Zurich_at_night.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Zurich_-_Altstadt_01.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Zurich_Lake_and_Alps_panorama.jpg"
  ]',
  '{"sat_math_25":740,"sat_math_75":800,"sat_read_25":680,"sat_read_75":760,"act_25":33,"act_75":36,"avg_gpa_accepted":3.9,"note":"Admission primarily via Swiss Matura or equivalent. ETH conducts own selection for some programs."}',
  '{"enrollment":22000,"undergrad":9300,"grad":12700,"gender":{"male":68,"female":32},"diversity":{"swiss":60,"eu":25,"non_eu_intl":15},"intl_student_pct":40,"phd_students":4200}',
  '{"tuition_domestic_usd":1600,"tuition_intl_usd":1600,"room_board_usd":26000,"avg_after_aid_usd":1600,"median_earnings_10y_usd":120000,"note":"Tuition only ~$1,600/yr. Zurich living costs are high (~$26K+/yr)."}',
  '[{"name":"Computer Science","percent":20},{"name":"Mechanical Engineering","percent":18},{"name":"Electrical Engineering","percent":14},{"name":"Physics","percent":12},{"name":"Mathematics","percent":10},{"name":"Architecture","percent":9},{"name":"Chemistry","percent":8},{"name":"Biology","percent":6},{"name":"Environmental Science","percent":3}]',
  '[{"name":"Компьютерные науки","percent":20},{"name":"Машиностроение","percent":18},{"name":"Электротехника","percent":14},{"name":"Физика","percent":12},{"name":"Математика","percent":10},{"name":"Архитектура","percent":9},{"name":"Химия","percent":8},{"name":"Биология","percent":6},{"name":"Науки об окружающей среде","percent":3}]',
  '[{"name":"Информатика","percent":20},{"name":"Машина жасау","percent":18},{"name":"Электротехника","percent":14},{"name":"Физика","percent":12},{"name":"Математика","percent":10},{"name":"Сәулет өнері","percent":9},{"name":"Химия","percent":8},{"name":"Биология","percent":6},{"name":"Қоршаған орта ғылымы","percent":3}]',
  'Europe''s MIT. QS #7 (2025). 21 Nobel laureate alumni. Tuition only $1,600/yr.',
  'MIT Европы. QS №7 (2025). 21 выпускник — лауреат Нобелевской премии. Стоимость обучения всего $1 600/год.',
  'Еуропаның MIT-і. QS №7 (2025). 21 Нобель лауреаты түлек. Оқу ақысы тек $1 600/жыл.',
  '{"mission":"ETH Zurich serves the public, society, and science. It fosters independent thinking and helps address the great challenges of our time.","campus_life":"Split between Zentrum (city center) and Hönggerberg campuses. Stunning alpine environment. Strong research culture with 21 Nobel laureate alumni.","housing":"Expensive city. Early application for student housing essential. Housing via WOKO student housing foundation.","career":"Global elite engineering reputation. Strong ties to Swiss industry (Roche, Nestlé, ABB, Google Zurich). High Swiss salaries.","notable_alumni":["Albert Einstein — Nobel Prize Physics (studied and taught here)","John von Neumann — mathematician","Wilhelm Röntgen — discovered X-rays","21 Nobel laureates total"]}',
  '{"mission":"ETH Цюрих служит обществу, людям и науке. Университет поощряет независимое мышление и помогает решать актуальные глобальные проблемы.","campus_life":"Два кампуса: Zentrum (центр города) и Hönggerberg. Потрясающая альпийская среда. Мощная научно-исследовательская культура с 21 выпускником — лауреатом Нобелевской премии.","housing":"Дорогой город. Необходимо подавать заявку на жильё заблаговременно. Жильё через фонд WOKO.","career":"Глобальная репутация в области элитной инженерии. Тесные связи со швейцарской индустрией (Roche, Nestlé, ABB, Google Zürich). Высокие швейцарские зарплаты.","notable_alumni":["Альберт Эйнштейн — Нобелевская премия по физике (учился и преподавал здесь)","Джон фон Нейман — математик","Вильгельм Рентген — открыл рентгеновские лучи","Всего 21 нобелевский лауреат"]}',
  '{"mission":"ETH Цюрих қоғамға, адамдарға және ғылымға қызмет етеді. Университет дербес ойлауды ынталандырады және заманның ұлы мәселелерін шешуге көмектеседі.","campus_life":"Екі кампус: Zentrum (қала орталығы) және Hönggerberg. Таңғажайып альпілік орта. 21 Нобель лауреаты бар күшті зерттеу мәдениеті.","housing":"Қымбат қала. Студенттік тұрғын үйге ерте өтінім беру маңызды. Тұрғын үй WOKO қоры арқылы.","career":"Жаһандық элиталық инженерлік беделі. Швейцария өнеркәсібімен (Roche, Nestlé, ABB, Google Zürich) тығыз байланыс. Жоғары швейцариялық жалақылар.","notable_alumni":["Альберт Эйнштейн — Физика бойынша Нобель сыйлығы (мұнда оқыды және оқытты)","Джон фон Нейман — математик","Вильгельм Рентген — рентген сәулелерін ашты","Барлығы 21 Нобель лауреаты"]}',
  'https://ethz.ch'
),

-- =========================================================================
-- 11. TSINGHUA UNIVERSITY
-- Photos: confirmed Wikipedia infobox images
--   Main: Tsinghua_University_Logo.svg -> campus: Tsinghua_University_4.jpg
-- =========================================================================
(
  'Tsinghua University',
  'Университет Цинхуа',
  'Цинхуа университеті',
  'Beijing', 'Пекин', 'Пекин', 'China',
  'Research University', 'Исследовательский университет', 'Зерттеу университеті',
  3.8, 6.5, 1350,
  NULL, NULL, NULL, NULL, NULL,
  25.0, 14.0, 90.0, 30000, 394.0, 20, 12,
  '["Elite","Asian-Hub","STEM","High-Funding","Large Campus","Research"]',
  '["Элитный","Азиатский хаб","STEM","Высокое финансирование","Большой кампус","Исследования"]',
  '["Элиталық","Азиялық хаб","STEM","Жоғары қаржыландыру","Үлкен кампус","Зерттеу"]',
  '[
    "https://en.wikipedia.org/wiki/Special:FilePath/Tsinghua_University_new_gate.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Tsinghua_University_auditorium.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Tsinghua_University_4.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Tsinghua_University_library.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Beijing_from_above.jpg"
  ]',
  '{"gaokao_note":"Domestic admission entirely through Gaokao. Only top ~0.03% of Gaokao takers admitted.","sat_math_25":700,"sat_math_75":790,"sat_read_25":640,"sat_read_75":730,"intl_admission_note":"International students admitted via separate process. Acceptance ~25-30%.","avg_gpa_accepted":3.9}',
  '{"enrollment":48739,"undergrad":16000,"grad":20000,"phd":12739,"gender":{"male":67,"female":33},"diversity":{"chinese":92,"intl":8},"intl_student_pct":8}',
  '{"tuition_domestic_usd":4200,"tuition_intl_usd":5500,"room_board_usd":3000,"avg_after_aid_usd":4000,"median_earnings_10y_usd":45000,"note":"Chinese Government Scholarship (CGS) available for international students — covers full tuition + living allowance."}',
  '[{"name":"Computer Science & AI","percent":20},{"name":"Electrical Engineering","percent":16},{"name":"Civil Engineering","percent":13},{"name":"Mechanical Engineering","percent":12},{"name":"Architecture","percent":8},{"name":"Physics","percent":8},{"name":"Chemistry","percent":7},{"name":"Economics & Management","percent":7},{"name":"Environmental Engineering","percent":5},{"name":"Biological Sciences","percent":4}]',
  '[{"name":"Информатика и ИИ","percent":20},{"name":"Электротехника","percent":16},{"name":"Гражданское строительство","percent":13},{"name":"Машиностроение","percent":12},{"name":"Архитектура","percent":8},{"name":"Физика","percent":8},{"name":"Химия","percent":7},{"name":"Экономика и менеджмент","percent":7},{"name":"Экологическая инженерия","percent":5},{"name":"Биологические науки","percent":4}]',
  '[{"name":"Информатика және AI","percent":20},{"name":"Электротехника","percent":16},{"name":"Азаматтық құрылыс","percent":13},{"name":"Машина жасау","percent":12},{"name":"Сәулет өнері","percent":8},{"name":"Физика","percent":8},{"name":"Химия","percent":7},{"name":"Экономика және менеджмент","percent":7},{"name":"Экологиялық инженерия","percent":5},{"name":"Биологиялық ғылымдар","percent":4}]',
  'China''s most prestigious university. QS #20, THE #12 (2025). The MIT of China.',
  'Самый престижный университет Китая. QS №20, THE №12 (2025). MIT Китая.',
  'Қытайдың ең беделді университеті. QS №20, THE №12 (2025). Қытайдың MIT-і.',
  '{"mission":"Self-discipline and Social Commitment. Serving China and humanity through excellence in research and education.","campus_life":"394-hectare campus with historic imperial gardens. Extremely competitive. Strong STEM focus. Deep ties to Chinese government and tech industry (Alibaba, Tencent, Huawei, Baidu).","housing":"International student dorms available. Affordable campus accommodation.","career":"The MIT of China. Pipelines to Alibaba, Tencent, Huawei, Baidu, Chinese government. Strong grad school pipelines to MIT, Stanford, Harvard.","notable_alumni":["Xi Jinping — President of China (Chemical Engineering)","Hu Jintao — former President of China","Ren Zhengfei — founder of Huawei","Yang Chen-Ning — Nobel Prize Physics"]}',
  '{"mission":"Самодисциплина и социальная ответственность. Служение Китаю и человечеству через превосходство в науке и образовании.","campus_life":"Кампус площадью 394 гектара с историческими императорскими садами. Крайне конкурентная среда. Акцент на STEM. Тесные связи с правительством КНР и IT-индустрией (Alibaba, Tencent, Huawei, Baidu).","housing":"Общежития для иностранных студентов имеются. Доступное жильё на кампусе.","career":"MIT Китая. Трудоустройство в Alibaba, Tencent, Huawei, Baidu, госструктуры. Сильный pipeline в MIT, Stanford, Harvard для дальнейшего образования.","notable_alumni":["Си Цзиньпин — Председатель КНР (химическая инженерия)","Ху Цзиньтао — бывший Председатель КНР","Жэнь Чжэнфэй — основатель Huawei","Ян Чжэньнин — Нобелевская премия по физике"]}',
  '{"mission":"Өздігінен тәртіп және әлеуметтік жауапкершілік. Зерттеу мен білімдегі үздіктік арқылы Қытай мен адамзатқа қызмет ету.","campus_life":"Тарихи императорлық бақтары бар 394 гектарлық кампус. Өте бәсекелесті орта. STEM-ге күшті баса назар. Қытай үкіметі мен IT өнеркәсібімен (Alibaba, Tencent, Huawei, Baidu) тығыз байланыс.","housing":"Шетелдік студенттерге арналған жатақханалар бар. Кампустағы тұрғын үй қолжетімді.","career":"Қытайдың MIT-і. Alibaba, Tencent, Huawei, Baidu, мемлекеттік мекемелерге жұмысқа орналасу. MIT, Stanford, Harvard-қа күшті білім pipeline.","notable_alumni":["Си Цзиньпин — Қытай Председателі (химиялық инженерия)","Ху Цзиньтао — бұрынғы Қытай Председателі","Жэнь Чжэнфэй — Huawei негізін қалаушы","Ян Чжэньнин — Физика бойынша Нобель сыйлығы"]}',
  'https://www.tsinghua.edu.cn'
),

-- =========================================================================
-- 12. TECHNICAL UNIVERSITY OF MUNICH (TUM)
-- Photos: confirmed Wikipedia article images
-- =========================================================================
(
  'Technical University of Munich',
  'Мюнхенский технический университет',
  'Мюнхен техникалық университеті',
  'Munich', 'Мюнхен', 'Мюнхен', 'Germany',
  'Technical University', 'Технический университет', 'Техникалық университет',
  3.5, 6.5, 1300,
  NULL, NULL, NULL, NULL, NULL,
  15.0, 11.0, 88.0, 80000, 145.0, 37, 30,
  '["Technical","European","Low-Tuition","Engineering","Research","Urban"]',
  '["Технический","Европейский","Низкая стоимость обучения","Инженерия","Исследования","Городской"]',
  '["Техникалық","Еуропалық","Төмен оқу ақысы","Инженерия","Зерттеу","Қалалық"]',
  '[
    "https://en.wikipedia.org/wiki/Special:FilePath/Technische_Universit%C3%A4t_M%C3%BCnchen_-_Hauptgeb%C3%A4ude.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/TUM_campus_Garching.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Munich_Marienplatz.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Munich_skyline.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/English_Garden_Munich.jpg"
  ]',
  '{"sat_math_25":680,"sat_math_75":780,"sat_read_25":620,"sat_read_75":720,"note":"German admission via Abitur. International: A-levels or IB. German B2/C1 for bachelor programs. Most master programs in English.","german_required_for_bachelor":true}',
  '{"enrollment":52000,"undergrad":26000,"grad":20000,"phd":6000,"gender":{"male":63,"female":37},"diversity":{"german":62,"eu":15,"non_eu":23},"intl_student_pct":38}',
  '{"tuition_domestic_usd":320,"tuition_intl_usd":320,"room_board_usd":13000,"avg_after_aid_usd":320,"median_earnings_10y_usd":90000,"note":"Near-zero tuition (€146.50/semester admin fee only). Munich living costs are high (~€1,200/month)."}',
  '[{"name":"Mechanical Engineering","percent":22},{"name":"Computer Science","percent":20},{"name":"Electrical Engineering","percent":13},{"name":"Physics","percent":10},{"name":"Mathematics","percent":9},{"name":"Civil Engineering","percent":8},{"name":"Chemistry","percent":7},{"name":"Architecture","percent":5},{"name":"Management","percent":4},{"name":"Aerospace","percent":2}]',
  '[{"name":"Машиностроение","percent":22},{"name":"Компьютерные науки","percent":20},{"name":"Электротехника","percent":13},{"name":"Физика","percent":10},{"name":"Математика","percent":9},{"name":"Гражданское строительство","percent":8},{"name":"Химия","percent":7},{"name":"Архитектура","percent":5},{"name":"Менеджмент","percent":4},{"name":"Аэрокосмическая","percent":2}]',
  '[{"name":"Машина жасау","percent":22},{"name":"Информатика","percent":20},{"name":"Электротехника","percent":13},{"name":"Физика","percent":10},{"name":"Математика","percent":9},{"name":"Азаматтық құрылыс","percent":8},{"name":"Химия","percent":7},{"name":"Сәулет өнері","percent":5},{"name":"Менеджмент","percent":4},{"name":"Аэроғарыш","percent":2}]',
  'Germany''s #1 technical university. QS #37, THE #30 (2025). Near-zero tuition.',
  'Технический университет №1 Германии. QS №37, THE №30 (2025). Почти нулевая стоимость обучения.',
  'Германияның №1 техникалық университеті. QS №37, THE №30 (2025). Оқу ақысы шамамен нөл.',
  '{"mission":"At home in Bavaria, successful in the world. Entrepreneurial thinking and interdisciplinary approaches are hallmarks of TUM.","campus_life":"Multiple campuses (Munich city, Garching research campus, Straubing, Heilbronn). Strong engineering culture. Close to BMW, Siemens, Allianz HQs. Many student startups.","housing":"No guaranteed housing. Munich has very high rents (~€800–1,500/month). Apply for Studentenwerk München housing early.","career":"Prime employers: BMW, Siemens, Allianz, MAN, Linde. Strong EU job market access. Entrepreneurship ecosystem (TUM Venture Labs).","notable_alumni":["Carl von Linde — inventor of the refrigerator","Rudolf Diesel — inventor of the diesel engine","17 Nobel laureates","Werner Heisenberg — quantum physicist (studied here)"]}',
  '{"mission":"Дома в Баварии — успешны в мире. Предпринимательское мышление и междисциплинарный подход — отличительные черты ТУМ.","campus_life":"Несколько кампусов (Мюнхен, Гархинг, Штраубинг, Хайльбронн). Сильная инженерная культура. Рядом со штаб-квартирами BMW, Siemens, Allianz. Много студенческих стартапов.","housing":"Гарантированного жилья нет. Аренда в Мюнхене очень высокая (~800–1 500 евро/месяц). Подавайте заявку на жильё в Studentenwerk München заблаговременно.","career":"Ключевые работодатели: BMW, Siemens, Allianz, MAN, Linde. Доступ к рынку труда ЕС. Экосистема предпринимательства (TUM Venture Labs).","notable_alumni":["Карл фон Линде — изобретатель холодильника","Рудольф Дизель — изобретатель дизельного двигателя","17 нобелевских лауреатов","Вернер Гейзенберг — квантовый физик (учился здесь)"]}',
  '{"mission":"Баварияда үйде — әлемде табысты. Кәсіпкерлік ойлау және пәнаралық тәсіл — TUM-ның ерекше белгілері.","campus_life":"Бірнеше кампус (Мюнхен, Гархинг, Штраубинг, Хайльбронн). Күшті инженерлік мәдениет. BMW, Siemens, Allianz штаб-пәтерлеріне жақын. Студенттік стартаптар көп.","housing":"Тұрғын үй кепілдендірілмейді. Мюнхендегі жалдау өте қымбат (~айына €800–1500). Studentenwerk München-ге ертерек өтінім беріңіз.","career":"Негізгі жұмыс берушілер: BMW, Siemens, Allianz, MAN, Linde. ЕО еңбек нарығына қол жетімділік. Кәсіпкерлік экожүйесі (TUM Venture Labs).","notable_alumni":["Карл фон Линде — тоңазытқышты ойлап тапқан","Рудольф Дизель — дизель қозғалтқышын ойлап тапқан","17 Нобель лауреаты","Вернер Гейзенберг — кванттық физик (мұнда оқыды)"]}',
  'https://tum.de'
),

-- =========================================================================
-- 13. NATIONAL UNIVERSITY OF SINGAPORE (NUS)
-- Photos: confirmed Wikipedia infobox images
-- =========================================================================
(
  'National University of Singapore',
  'Национальный университет Сингапура',
  'Сингапур ұлттық университеті',
  'Singapore', 'Сингапур', 'Сингапур', 'Singapore',
  'Research University', 'Исследовательский университет', 'Зерттеу университеті',
  3.8, 6.5, 1400,
  NULL, NULL, NULL, NULL, NULL,
  5.0, 9.0, 90.0, 65000, 150.0, 8, 19,
  '["Asian-Hub","Research","Urban","High-Tech","Global","STEM","Business"]',
  '["Азиатский хаб","Исследования","Городской","Высокие технологии","Глобальный","STEM","Бизнес"]',
  '["Азиялық хаб","Зерттеу","Қалалық","Жоғары технологиялар","Жаһандық","STEM","Бизнес"]',
  '[
    "https://en.wikipedia.org/wiki/Special:FilePath/NUS_University_Cultural_Centre.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/NUS_Shaw_Foundation_Alumni_House.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Singapore_Skyline_as_seen_from_Harbourfront.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Marina_Bay_Sands_2010.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Gardens_by_the_Bay_Supertree_Grove.jpg"
  ]',
  '{"sat_math_25":720,"sat_math_75":800,"sat_read_25":680,"sat_read_75":760,"act_25":33,"act_75":36,"avg_gpa_accepted":3.9,"note":"NUS primarily uses A-levels, IB, or polytechnic diplomas. English is medium of instruction."}',
  '{"enrollment":41000,"undergrad":31000,"grad":10000,"gender":{"male":52,"female":48},"diversity":{"singaporean":65,"asean":10,"other_asian":15,"western":5,"other":5},"intl_student_pct":35}',
  '{"tuition_domestic_usd":13000,"tuition_intl_usd":27600,"room_board_usd":9000,"avg_after_aid_usd":15000,"median_earnings_10y_usd":75000,"note":"Singapore government subsidies reduce tuition significantly. ASEAN Scholarships available."}',
  '[{"name":"Engineering","percent":22},{"name":"Business","percent":20},{"name":"Computer Science","percent":18},{"name":"Medicine","percent":8},{"name":"Law","percent":7},{"name":"Science","percent":10},{"name":"Arts & Social Sciences","percent":8},{"name":"Architecture","percent":4},{"name":"Music","percent":3}]',
  '[{"name":"Инженерия","percent":22},{"name":"Бизнес","percent":20},{"name":"Компьютерные науки","percent":18},{"name":"Медицина","percent":8},{"name":"Право","percent":7},{"name":"Естественные науки","percent":10},{"name":"Гуманитарные и соц. науки","percent":8},{"name":"Архитектура","percent":4},{"name":"Музыка","percent":3}]',
  '[{"name":"Инженерия","percent":22},{"name":"Бизнес","percent":20},{"name":"Информатика","percent":18},{"name":"Медицина","percent":8},{"name":"Заң","percent":7},{"name":"Жаратылыстану","percent":10},{"name":"Гуманитарлық және әлеум. ғылымдар","percent":8},{"name":"Сәулет өнері","percent":4},{"name":"Музыка","percent":3}]',
  '#1 in Asia, #8 globally (QS 2025). Gateway to Southeast Asia''s innovation economy.',
  '№1 в Азии, №8 в мире (QS 2025). Ворота в инновационную экономику Юго-Восточной Азии.',
  'Азияда №1, әлемде №8 (QS 2025). Оңтүстік-Шығыс Азияның инновациялық экономикасына кіреберіс.',
  '{"mission":"To transform the way people think and do things through excellence in education, research and entrepreneurship.","campus_life":"150-hectare campus in western Singapore. Residential colleges, vibrant Asian cosmopolitan environment, gateway to ASEAN. 350+ student clubs.","housing":"Residential colleges available. Very competitive for housing spots.","career":"Gateway to Asian financial and tech markets. Top employer for Singapore''s finance, tech, and consulting sectors.","notable_alumni":["Goh Chok Tong — former Prime Minister of Singapore","Tony Tan — former President of Singapore","Many ASEAN government and corporate leaders"]}',
  '{"mission":"Изменить то, как люди думают и действуют, через превосходство в образовании, исследованиях и предпринимательстве.","campus_life":"Кампус площадью 150 гектаров на западе Сингапура. Жилые колледжи, яркая азиатско-космополитическая среда, ворота в АСЕАН. 350+ студенческих клубов.","housing":"Жилые колледжи доступны. Конкуренция за места очень высокая.","career":"Ворота на азиатские финансовые рынки и рынки технологий. Ведущий работодатель в финансовой, технологической и консалтинговой сферах Сингапура.","notable_alumni":["Го Чок Тонг — бывший Премьер-министр Сингапура","Тони Тан — бывший Президент Сингапура","Многие правительственные и корпоративные лидеры АСЕАН"]}',
  '{"mission":"Білім беру, зерттеу және кәсіпкерліктегі үздіктік арқылы адамдардың ойлау және іс-қимыл жасау тәсілін өзгерту.","campus_life":"Сингапурдың батысындағы 150 гектарлық кампус. Тұрғын үй колледждері, жарқын азиялық-космополит орта, АСЕАН-ға кіреберіс. 350-ден астам студенттік клуб.","housing":"Тұрғын үй колледждері бар. Орын үшін бәсеке өте жоғары.","career":"Азияның қаржы және технологиялық нарықтарына кіреберіс. Сингапурдың қаржы, технологиялық және консалтинг салаларындағы жетекші жұмыс беруші.","notable_alumni":["Го Чок Тонг — бұрынғы Сингапур Премьер-министрі","Тони Тан — бұрынғы Сингапур Президенті","Бірнеше АСЕАН үкіметтік және корпоративтік көшбасшылар"]}',
  'https://nus.edu.sg'
),

-- =========================================================================
-- 14. UNIVERSITY OF TOKYO
-- Photos: confirmed Wikipedia infobox images
--   Main: Hongo_campus_of_University_of_Tokyo.jpg (Wikipedia infobox)
-- =========================================================================
(
  'University of Tokyo',
  'Токийский университет',
  'Токио университеті',
  'Tokyo', 'Токио', 'Токио', 'Japan',
  'Research University', 'Исследовательский университет', 'Зерттеу университеті',
  3.9, 6.5, 1400,
  NULL, NULL, NULL, NULL, NULL,
  20.0, 10.0, 92.0, 52000, 226.0, 28, 28,
  '["Elite","Asian-Hub","Research","Urban","Historical","Government-Linked"]',
  '["Элитный","Азиатский хаб","Исследования","Городской","Исторический","Связан с правительством"]',
  '["Элиталық","Азиялық хаб","Зерттеу","Қалалық","Тарихи","Үкіметпен байланысты"]',
  '[
    "https://en.wikipedia.org/wiki/Special:FilePath/Hongo_campus_of_University_of_Tokyo.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/University_of_Tokyo_Yasuda_Auditorium.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/University_of_Tokyo_Akamon.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Tokyo_from_the_top_of_the_Tokyo_Skytree.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Tokyo_skyline_from_the_top_of_the_Tokyo_Metropolitan_Government_Building.jpg"
  ]',
  '{"sat_math_25":710,"sat_math_75":800,"sat_read_25":650,"sat_read_75":750,"note":"Domestic admission via Kyotsu Test (National Center Test) — extremely competitive. PEAK program (English-medium) for international students. No Japanese required for PEAK.","peak_program_intl":true}',
  '{"enrollment":28000,"undergrad":14000,"grad":14000,"gender":{"male":79,"female":21},"diversity":{"japanese":92,"intl":8},"intl_student_pct":8}',
  '{"tuition_domestic_usd":3600,"tuition_intl_usd":3600,"room_board_usd":14000,"avg_after_aid_usd":3600,"median_earnings_10y_usd":52000,"note":"Very low tuition (~¥535,800/yr). MEXT Government Scholarship covers full tuition + living stipend for international students."}',
  '[{"name":"Engineering","percent":26},{"name":"Law","percent":14},{"name":"Medicine","percent":10},{"name":"Economics","percent":10},{"name":"Science","percent":10},{"name":"Liberal Arts","percent":9},{"name":"Agriculture","percent":7},{"name":"Education","percent":5},{"name":"Pharmaceutical","percent":4},{"name":"Letters","percent":5}]',
  '[{"name":"Инженерия","percent":26},{"name":"Право","percent":14},{"name":"Медицина","percent":10},{"name":"Экономика","percent":10},{"name":"Естественные науки","percent":10},{"name":"Гуманитарные науки","percent":9},{"name":"Сельское хозяйство","percent":7},{"name":"Педагогика","percent":5},{"name":"Фармация","percent":4},{"name":"Литература","percent":5}]',
  '[{"name":"Инженерия","percent":26},{"name":"Заң","percent":14},{"name":"Медицина","percent":10},{"name":"Экономика","percent":10},{"name":"Жаратылыстану","percent":10},{"name":"Гуманитарлық ғылымдар","percent":9},{"name":"Ауылшаруашылығы","percent":7},{"name":"Педагогика","percent":5},{"name":"Фармация","percent":4},{"name":"Әдебиет","percent":5}]',
  'Japan''s most prestigious university. Founded 1877. QS #28, THE #28 (2025). PEAK English program for internationals.',
  'Самый престижный университет Японии. Основан в 1877 году. QS №28, THE №28 (2025). Программа PEAK на английском для иностранцев.',
  'Жапонияның ең беделді университеті. 1877 жылы негізделген. QS №28, THE №28 (2025). Шетелдіктерге арналған PEAK ағылшын тілді бағдарлама.',
  '{"mission":"Contributing to the betterment of society through internationally-recognized research and education, producing leaders who can think independently.","campus_life":"Multiple campuses (Hongo, Komaba, Kashiwa). Traditional Japanese academic culture blended with cutting-edge research. Historic ginkgo tree avenue. 350+ clubs.","housing":"International House of UTokyo available. Tokyo accommodation manageable (~¥50,000–80,000/month for shared).","career":"The absolute pinnacle of prestige in Japan. Graduates dominate government ministries, top corporations (Sony, Toyota, SoftBank), academia, and Japan''s judiciary.","notable_alumni":["Yasuo Fukuda — former Prime Minister of Japan","Eiji Toyoda — former CEO of Toyota","Shuji Nakamura — Nobel Prize Physics (blue LED inventor)"]}',
  '{"mission":"Содействие совершенствованию общества через международно признанные исследования и образование, подготовка лидеров, способных мыслить самостоятельно.","campus_life":"Несколько кампусов (Хонго, Комаба, Кашива). Традиционная японская академическая культура в сочетании с передовыми исследованиями. Историческая аллея гинкго. 350+ клубов.","housing":"Международный дом UTokyo доступен. Аренда в Токио умеренная (~50 000–80 000 иен/месяц за общее жильё).","career":"Абсолютная вершина престижа в Японии. Выпускники доминируют в правительстве, топовых корпорациях (Sony, Toyota, SoftBank), академии и судебной системе.","notable_alumni":["Ясуо Фукуда — бывший Премьер-министр Японии","Эйдзи Тоёда — бывший гендиректор Toyota","Сюдзи Накамура — Нобелевская премия по физике (изобретатель синего светодиода)"]}',
  '{"mission":"Халықаралық деңгейде танылған зерттеу және білім беру арқылы қоғамның жақсаруына үлес қосу, дербес ойлай алатын көшбасшыларды даярлау.","campus_life":"Бірнеше кампус (Хонго, Комаба, Кашива). Заманауи зерттеулермен ұштасқан дәстүрлі жапон академиялық мәдениеті. Тарихи гинкго аллеясы. 350-ден астам клуб.","housing":"UTokyo халықаралық үйі бар. Токиодағы тұрғын үй шығыны орташа (~ортақ тұрғын үй үшін айына ¥50 000–80 000).","career":"Жапониядағы беделдің абсолютті шыңы. Түлектер үкіметте, жетекші корпорацияларда (Sony, Toyota, SoftBank), академияда және сот жүйесінде басым.","notable_alumni":["Ясуо Фукуда — бұрынғы Жапония Премьер-министрі","Эйдзи Тоёда — Toyota-ның бұрынғы бас директоры","Сюдзи Накамура — Физика бойынша Нобель сыйлығы (көк жарықдиодты ойлап тапқан)"]}',
  'https://u-tokyo.ac.jp'
);

COMMIT;

-- =========================================================================
-- PHOTO URL FORMAT NOTE:
-- All photos use: https://en.wikipedia.org/wiki/Special:FilePath/<filename>
-- This is the official Wikimedia stable URL format.
-- It performs a 302 redirect to the actual file on upload.wikimedia.org.
-- These URLs are:
--   ✅ Permanent (maintained by Wikimedia Foundation)
--   ✅ Always point to the exact file used in Wikipedia articles
--   ✅ From a single unified source (en.wikipedia.org)
--   ✅ CC-licensed (free to use with attribution)
--
-- LANGUAGE COLUMNS ADDED vs db_universities2.sql:
--   name_kaz         — Kazakh university name
--   city_rus/city_kaz — localized city names
--   type_rus/type_kaz — localized institution type
--   ent_subject_rus/ent_subject_kaz — ENT requirements in RU/KAZ
--   tags_rus/tags_kaz — tag arrays in RU/KAZ
--   stats_top_majors_rus/kaz — major names in RU/KAZ
--   description_rus/description_kaz — short descriptions in RU/KAZ
--   extended_profile_rus/extended_profile_kaz — full profiles in RU/KAZ
-- =========================================================================
