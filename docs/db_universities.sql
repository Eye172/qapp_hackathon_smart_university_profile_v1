-- =========================================================================
-- DATABASE: QApp Ecosystem
-- LAYER: Discovery & Profile Matrices (Universities)
-- DESCRIPTION: Maximum density JSON payloads for Recharts and LLM Context
-- =========================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `universities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `name_ru` varchar(255) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `country` varchar(100) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  
  -- HARD CONSTRAINTS (Математика алгоритма)
  `min_gpa` decimal(3,1) DEFAULT NULL,
  `min_ielts` decimal(3,1) DEFAULT NULL,
  `min_sat` int(11) DEFAULT NULL,
  
  -- ALGORITHM & UI PAYLOADS
  `tags` JSON DEFAULT NULL,
  `photos` JSON DEFAULT NULL,
  
  -- CHART DATA PAYLOADS (Recharts)
  `stats_test_scores` JSON DEFAULT NULL,
  `stats_demographics` JSON DEFAULT NULL,
  `stats_financials` JSON DEFAULT NULL,
  `stats_top_majors` JSON DEFAULT NULL,
  
  -- LLM CONTEXT PAYLOAD (Пища для ИИ)
  `extended_profile` JSON DEFAULT NULL,
  
  `description` text DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- =========================================================================
-- SEEDING: 12 MAXIMUM DENSITY UNIVERSITY PROFILES
-- =========================================================================

INSERT INTO `universities` (
  `name`, `name_ru`, `city`, `country`, `type`, `min_gpa`, `min_ielts`, `min_sat`, 
  `tags`, `photos`, `stats_test_scores`, `stats_demographics`, `stats_financials`, `stats_top_majors`, `extended_profile`, `description`, `website`
) VALUES

-- 1. NAZARBAYEV UNIVERSITY (Kazakhstan)
('Nazarbayev University', 'Назарбаев Университет', 'Astana', 'Kazakhstan', 'Research', 4.0, 6.5, 1200, 
'["Research", "English-medium", "State-Funded", "STEM", "Modern Campus", "Urban"]', 
'["https://images.unsplash.com/photo-1541339907198-e08756dedf3f", "https://images.unsplash.com/photo-1523050854058-8df90110c9f1", "https://images.unsplash.com/photo-1507842217343-583bb7270b66", "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158", "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a"]', 
'{"sat_math_25": 650, "sat_math_75": 780, "sat_read_25": 600, "sat_read_75": 710}', 
'{"enrollment": 7089, "gender": {"male": 48.4, "female": 51.6}, "diversity": {"asian": 90, "white": 5, "intl": 5}}', 
'{"tuition": 0, "room_board": 1500, "avg_after_aid": 0, "median_earnings": 15000}', 
'[{"name": "Computer Science", "percent": 22}, {"name": "Engineering", "percent": 18}, {"name": "Political Science", "percent": 12}, {"name": "Biology", "percent": 10}]',
'{"mission": "To be a world-class research university in Kazakhstan.", "campus_life": "Vibrant English-speaking environment with over 100 student clubs and strict academic integrity.", "housing": "Guaranteed modern dormitories on campus for all years.", "career": "High placement in Big4, MBB, and international tech giants."}',
'Kazakhstan’s premier research university. World-class education fully in English.', 'https://nu.edu.kz'),

-- 2. KAZAKH-BRITISH TECHNICAL UNIVERSITY (Kazakhstan)
('Kazakh-British Technical University', 'КБТУ', 'Almaty', 'Kazakhstan', 'Technical', 3.5, 6.0, 1100, 
'["Technical", "Urban", "Industry Partnerships", "Energy & IT", "Bilingual", "Business"]', 
'["https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3", "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846", "https://images.unsplash.com/photo-1584697964400-2af6a2f6204c", "https://images.unsplash.com/photo-1522071820081-009f0129c71c", "https://images.unsplash.com/photo-1531482615713-2afd69097998"]', 
'{"sat_math_25": 550, "sat_math_75": 650, "sat_read_25": 500, "sat_read_75": 600}', 
'{"enrollment": 4200, "gender": {"male": 60.5, "female": 39.5}, "diversity": {"asian": 95, "white": 3, "intl": 2}}', 
'{"tuition": 4000, "room_board": 1200, "avg_after_aid": 2000, "median_earnings": 12000}', 
'[{"name": "Petroleum Eng", "percent": 25}, {"name": "Computer Science", "percent": 20}, {"name": "Finance", "percent": 15}]',
'{"mission": "Providing specialized technical education for the energy and IT sectors.", "campus_life": "Historic building in the center of Almaty, strong corporate ties.", "housing": "Dorms available but limited.", "career": "Direct pipelines to KazMunayGas, Chevron, and top IT firms."}',
'Top technical university in Kazakhstan with deep industry ties.', 'https://kbtu.edu.kz'),

-- 3. AL-FARABI KAZAKH NATIONAL UNIVERSITY (Kazakhstan)
('Al-Farabi Kazakh National University', 'КазНУ им. аль-Фараби', 'Almaty', 'Kazakhstan', 'Comprehensive', 3.0, 5.5, NULL, 
'["Comprehensive", "Historical", "Large Campus", "Humanities", "Sciences"]', 
'["https://images.unsplash.com/photo-1562774053-701939374585", "https://images.unsplash.com/photo-1522071820081-009f0129c71c", "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a", "https://images.unsplash.com/photo-1532094349884-543bc11b234d", "https://images.unsplash.com/photo-1503676260728-1c00da094a0b"]', 
'{"sat_math_25": null, "sat_math_75": null, "sat_read_25": null, "sat_read_75": null}', 
'{"enrollment": 25000, "gender": {"male": 45, "female": 55}, "diversity": {"asian": 95, "intl": 5}}', 
'{"tuition": 3500, "room_board": 1000, "avg_after_aid": 1500, "median_earnings": 10000}', 
'[{"name": "Intl Relations", "percent": 15}, {"name": "Law", "percent": 12}, {"name": "Biology", "percent": 10}]',
'{"mission": "The oldest comprehensive university in the nation.", "campus_life": "Massive campus (KazGUU grad) with a strong student community.", "housing": "Large dormitory network.", "career": "Strong alumni network in government and public sectors."}',
'The oldest and largest university in Kazakhstan.', 'https://www.kaznu.kz'),

-- 4. MIT (USA)
('Massachusetts Institute of Technology', 'Массачусетский технологический институт', 'Cambridge', 'USA', 'Research', 4.0, 7.0, 1500, 
'["Elite", "STEM", "Global Leader", "Urban", "High-Funding"]', 
'["https://images.unsplash.com/photo-1550159440-41da367d38cc", "https://images.unsplash.com/photo-1519389950473-47ba0277781c", "https://images.unsplash.com/photo-1532094349884-543bc11b234d", "https://images.unsplash.com/photo-1503676260728-1c00da094a0b", "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40"]', 
'{"sat_math_25": 780, "sat_math_75": 800, "sat_read_25": 730, "sat_read_75": 780}', 
'{"enrollment": 4576, "gender": {"male": 55, "female": 45}, "diversity": {"asian": 35, "white": 22, "hispanic": 15, "black": 8, "intl": 11}}', 
'{"tuition": 57000, "room_board": 18000, "avg_after_aid": 18535, "median_earnings": 110000}', 
'[{"name": "Computer Science", "percent": 30}, {"name": "Mathematics", "percent": 12}, {"name": "Physics", "percent": 10}]',
'{"mission": "To advance knowledge in science, technology, and areas that best serve the world.", "campus_life": "Intense, highly collaborative, hackathon culture.", "housing": "Guaranteed housing 4 years.", "career": "Unmatched pipelines to top tech, finance, and academia."}',
'A global leader in science, engineering, and tech innovation.', 'https://web.mit.edu'),

-- 5. STANFORD UNIVERSITY (USA)
('Stanford University', 'Стэнфордский университет', 'Stanford', 'USA', 'Research', 4.0, 7.0, 1500, 
'["Elite", "Silicon Valley", "Entrepreneurship", "Research", "Warm Climate"]', 
'["https://images.unsplash.com/photo-1501504905252-473c47e087f8", "https://images.unsplash.com/photo-1629851608681-37050201d1c3", "https://images.unsplash.com/photo-1522071820081-009f0129c71c", "https://images.unsplash.com/photo-1519389950473-47ba0277781c", "https://images.unsplash.com/photo-1532094349884-543bc11b234d"]', 
'{"sat_math_25": 750, "sat_math_75": 800, "sat_read_25": 720, "sat_read_75": 770}', 
'{"enrollment": 7645, "gender": {"male": 50.2, "female": 49.8}, "diversity": {"asian": 25, "white": 30, "hispanic": 17, "black": 7, "intl": 11}}', 
'{"tuition": 58000, "room_board": 19000, "avg_after_aid": 17500, "median_earnings": 105000}', 
'[{"name": "Computer Science", "percent": 18}, {"name": "Human Biology", "percent": 10}, {"name": "Economics", "percent": 9}]',
'{"mission": "To promote the public welfare by exercising an influence in behalf of humanity.", "campus_life": "Sunny, massive campus, heavy startup culture.", "housing": "97% of undergrads live on campus.", "career": "Heart of Silicon Valley. Direct access to VC funding."}',
'Located in Silicon Valley, known for entrepreneurial spirit.', 'https://stanford.edu'),

-- 6. HARVARD UNIVERSITY (USA)
('Harvard University', 'Гарвардский университет', 'Cambridge', 'USA', 'Research', 4.0, 7.5, 1520, 
'["Elite", "Historical", "Ivy League", "Humanities", "Law", "High-Funding"]', 
'["https://images.unsplash.com/photo-1555529733-0e670560f0e1", "https://images.unsplash.com/photo-1541339907198-e08756dedf3f", "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a", "https://images.unsplash.com/photo-1507842217343-583bb7270b66", "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"]', 
'{"sat_math_25": 750, "sat_math_75": 800, "sat_read_25": 740, "sat_read_75": 800}', 
'{"enrollment": 7153, "gender": {"male": 49.5, "female": 50.5}, "diversity": {"asian": 25, "white": 36, "hispanic": 12, "black": 10, "intl": 12}}', 
'{"tuition": 55000, "room_board": 19500, "avg_after_aid": 16000, "median_earnings": 100000}', 
'[{"name": "Economics", "percent": 14}, {"name": "Computer Science", "percent": 11}, {"name": "Government", "percent": 10}]',
'{"mission": "To educate the citizens and citizen-leaders for our society.", "campus_life": "Deeply historic, intense networking, residential house system.", "housing": "Residential houses (like Harry Potter).", "career": "Elite pipelines to Wall Street, Law, and Politics."}',
'Ivy League research university renowned globally.', 'https://harvard.edu'),

-- 7. UNIVERSITY OF OXFORD (UK)
('University of Oxford', 'Оксфордский университет', 'Oxford', 'UK', 'Research', 4.0, 7.5, 1470, 
'["Elite", "Historical", "Collegiate", "Humanities", "Global"]', 
'["https://images.unsplash.com/photo-1565022536102-f7645c84354a", "https://images.unsplash.com/photo-1549405096-74db62c9cb00", "https://images.unsplash.com/photo-1582736166580-c11df5b3fb07", "https://images.unsplash.com/photo-1580975618413-524f0c4bb21f", "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3"]', 
'{"sat_math_25": 740, "sat_math_75": 800, "sat_read_25": 730, "sat_read_75": 790}', 
'{"enrollment": 11955, "gender": {"male": 51, "female": 49}, "diversity": {"white": 65, "asian": 15, "black": 4, "intl": 22}}', 
'{"tuition": 45000, "room_board": 15000, "avg_after_aid": 30000, "median_earnings": 85000}', 
'[{"name": "PPE", "percent": 15}, {"name": "Law", "percent": 12}, {"name": "Medicine", "percent": 10}]',
'{"mission": "Advancement of learning by teaching and research.", "campus_life": "Tutorial system (1-on-1 teaching), formal dinners, collegiate life.", "housing": "Living in historic colleges.", "career": "Top employer prestige globally."}',
'The oldest university in the English-speaking world.', 'https://ox.ac.uk'),

-- 8. TSINGHUA UNIVERSITY (China)
('Tsinghua University', 'Университет Цинхуа', 'Beijing', 'China', 'Research', 3.8, 6.5, 1350, 
'["Elite", "Asian-Hub", "STEM", "High-Funding", "Large Campus"]', 
'["https://images.unsplash.com/photo-1596706935706-c8524de63f82", "https://images.unsplash.com/photo-1584697964400-2af6a2f6204c", "https://images.unsplash.com/photo-1523050854058-8df90110c9f1", "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846", "https://images.unsplash.com/photo-1531482615713-2afd69097998"]', 
'{"sat_math_25": 700, "sat_math_75": 790, "sat_read_25": 650, "sat_read_75": 740}', 
'{"enrollment": 16000, "gender": {"male": 65, "female": 35}, "diversity": {"asian": 92, "intl": 8}}', 
'{"tuition": 6000, "room_board": 3000, "avg_after_aid": 4000, "median_earnings": 40000}', 
'[{"name": "Computer Science", "percent": 25}, {"name": "Civil Engineering", "percent": 15}, {"name": "Electrical", "percent": 14}]',
'{"mission": "Self-discipline and Social Commitment.", "campus_life": "Highly competitive, massive research funding, beautiful historic gardens.", "housing": "International student dorms available.", "career": "The MIT of China, deep ties to government and tech giants."}',
'China’s premier institution for engineering and CS.', 'https://www.tsinghua.edu.cn'),

-- 9. TUM (Germany)
('Technical University of Munich', 'Мюнхенский технический университет', 'Munich', 'Germany', 'Technical', 3.5, 6.5, 1300, 
'["Technical", "European", "Low-Tuition", "Engineering", "Research", "Urban"]', 
'["https://images.unsplash.com/photo-1498243691581-b145c3f54a5a", "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158", "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846", "https://images.unsplash.com/photo-1584697964400-2af6a2f6204c", "https://images.unsplash.com/photo-1507842217343-583bb7270b66"]', 
'{"sat_math_25": 680, "sat_math_75": 780, "sat_read_25": 620, "sat_read_75": 720}', 
'{"enrollment": 50000, "gender": {"male": 65, "female": 35}, "diversity": {"white": 60, "asian": 25, "intl": 38}}', 
'{"tuition": 3000, "room_board": 12000, "avg_after_aid": 3000, "median_earnings": 70000}', 
'[{"name": "Mechanical Eng", "percent": 25}, {"name": "Computer Science", "percent": 22}, {"name": "Physics", "percent": 12}]',
'{"mission": "At home in Bavaria, successful in the world.", "campus_life": "Strong focus on practical engineering and startups.", "housing": "Highly competitive city housing, no guaranteed dorms.", "career": "Ties to BMW, Siemens, Allianz."}',
'Germany’s top-ranked technical university.', 'https://tum.de'),

-- 10. NUS (Singapore)
('National University of Singapore', 'Национальный университет Сингапура', 'Singapore', 'Singapore', 'Research', 3.8, 6.5, 1400, 
'["Asian-Hub", "Research", "Urban", "High-Tech", "Global"]', 
'["https://images.unsplash.com/photo-1555436169-20e93ea9a7ff", "https://images.unsplash.com/photo-1541339907198-e08756dedf3f", "https://images.unsplash.com/photo-1523050854058-8df90110c9f1", "https://images.unsplash.com/photo-1522071820081-009f0129c71c", "https://images.unsplash.com/photo-1519389950473-47ba0277781c"]', 
'{"sat_math_25": 720, "sat_math_75": 800, "sat_read_25": 680, "sat_read_75": 760}', 
'{"enrollment": 31000, "gender": {"male": 52, "female": 48}, "diversity": {"asian": 85, "white": 5, "intl": 30}}', 
'{"tuition": 25000, "room_board": 10000, "avg_after_aid": 15000, "median_earnings": 60000}', 
'[{"name": "Business", "percent": 18}, {"name": "Computer Science", "percent": 16}, {"name": "Engineering", "percent": 20}]',
'{"mission": "To transform the way people think and do things through education.", "campus_life": "Ultra-modern, highly globalized hub in Asia.", "housing": "Residential colleges available.", "career": "Gateway to Asian financial and tech markets."}',
'Top university in Asia with a global approach.', 'https://nus.edu.sg'),

-- 11. ETH ZURICH (Switzerland)
('ETH Zurich', 'Швейцарская высшая техническая школа', 'Zurich', 'Switzerland', 'Technical', 3.8, 7.0, 1450, 
'["Technical", "European", "Low-Tuition", "STEM", "Nobel Laureates"]', 
'["https://images.unsplash.com/photo-1513628253939-010e64ac66cd", "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a", "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158", "https://images.unsplash.com/photo-1507842217343-583bb7270b66", "https://images.unsplash.com/photo-1549405096-74db62c9cb00"]', 
'{"sat_math_25": 740, "sat_math_75": 800, "sat_read_25": 690, "sat_read_75": 760}', 
'{"enrollment": 22000, "gender": {"male": 68, "female": 32}, "diversity": {"white": 75, "asian": 15, "intl": 40}}', 
'{"tuition": 1500, "room_board": 18000, "avg_after_aid": 1500, "median_earnings": 95000}', 
'[{"name": "Physics", "percent": 20}, {"name": "Computer Science", "percent": 18}, {"name": "Architecture", "percent": 12}]',
'{"mission": "To serve society through research and education.", "campus_life": "Rigorous academics, stunning alpine environment.", "housing": "Expensive city living, early application needed.", "career": "Elite engineering reputation globally."}',
'World-class university for science and technology.', 'https://ethz.ch'),

-- 12. UNIVERSITY OF TOKYO (Japan)
('University of Tokyo', 'Токийский университет', 'Tokyo', 'Japan', 'Research', 3.9, 6.5, 1400, 
'["Elite", "Asian-Hub", "Research", "Urban", "Historical"]', 
'["https://images.unsplash.com/photo-1583417319070-4a69db38a482", "https://images.unsplash.com/photo-1596706935706-c8524de63f82", "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3", "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846", "https://images.unsplash.com/photo-1531482615713-2afd69097998"]', 
'{"sat_math_25": 710, "sat_math_75": 800, "sat_read_25": 660, "sat_read_75": 750}', 
'{"enrollment": 28000, "gender": {"male": 80, "female": 20}, "diversity": {"asian": 95, "intl": 10}}', 
'{"tuition": 5000, "room_board": 12000, "avg_after_aid": 5000, "median_earnings": 50000}', 
'[{"name": "Engineering", "percent": 25}, {"name": "Law", "percent": 15}, {"name": "Medicine", "percent": 10}]',
'{"mission": "To nurture global leaders.", "campus_life": "Traditional Japanese academic culture mixed with high-tech research.", "housing": "Dorms available for first years.", "career": "The absolute pinnacle of prestige in Japan."}',
'Japan’s most prestigious university.', 'https://u-tokyo.ac.jp');

COMMIT;