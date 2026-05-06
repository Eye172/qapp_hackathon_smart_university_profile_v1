-- =========================================================================
-- DATABASE: QApp Ecosystem
-- LAYER: User Identity Node (Students)
-- =========================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `grade` int(11) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'Kazakhstan',
  `city` varchar(100) DEFAULT NULL,
  
  -- Academic Core
  `gpa` decimal(3,1) DEFAULT NULL,
  `gpa_max` decimal(3,1) DEFAULT 5.0,
  `ielts` decimal(3,1) DEFAULT NULL,
  `sat` int(11) DEFAULT NULL,
  
  -- Logistics & Preferences
  `budget_status` varchar(100) DEFAULT NULL,
  `priority_tags` JSON DEFAULT NULL,
  `documents` JSON DEFAULT NULL,
  
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================================
-- MOCK USERS (Для тестов рекомендательной ленты и графиков)
-- =========================================================================

INSERT INTO `students` (`name`, `email`, `password_hash`, `grade`, `city`, `gpa`, `ielts`, `sat`, `budget_status`, `priority_tags`, `documents`) VALUES
('Aliya Bekova', 'aliya@qapp.kz', 'hash_1', 11, 'Astana', 4.7, 7.0, 1380, 'Needs Scholarship', 
'[{"tag": "STEM", "weight": 8}, {"tag": "Urban", "weight": 5}, {"tag": "State-Funded", "weight": 4}, {"tag": "English-medium", "weight": 3}]', 
'{"passport": "READY", "photo": "READY", "medical_cert": "MISSING", "transcript": "READY", "diploma": "PENDING"}'),

('Dias Nurmagambetov', 'dias@qapp.kz', 'hash_2', 12, 'Almaty', 3.8, 6.0, 1150, 'Self-Funded', 
'[{"tag": "Business", "weight": 7}, {"tag": "Urban", "weight": 6}, {"tag": "Bilingual", "weight": 7}]', 
'{"passport": "READY", "photo": "MISSING", "medical_cert": "MISSING", "transcript": "READY", "diploma": "READY"}'),

('Aizhan Smagulova', 'aizhan@qapp.kz', 'hash_3', 12, 'Shymkent', 4.0, 7.5, 1500, 'Needs Scholarship', 
'[{"tag": "Ivy League", "weight": 10}, {"tag": "Research", "weight": 5}, {"tag": "High-Funding", "weight": 5}]', 
'{"passport": "READY", "photo": "READY", "medical_cert": "READY", "transcript": "READY", "diploma": "READY"}');

COMMIT;