# QApp — Умный поиск университета с ИИ

> Проект для **QApp Impact Hackathon 2026** · Impact Admissions × QApp

QApp — это веб-платформа, которая подбирает зарубежные университеты под конкретного студента с помощью персонального AI-советника, системы оценки совместимости и автоматизированного трекера документов.

---

## 🚀 Что умеет QApp

| Функция | Описание |
|---|---|
| **AI Fit Score** | Каждый университет получает оценку 0–100 на основе GPA, IELTS, бюджета и интересов студента |
| **GPT-4 Советник** | Персонаж «Dr. Alex Morgan» пишет детальный вердикт: сильные стороны, пробелы, план действий, комментарии к каждому графику |
| **Умная лента** | Карусель университетов, отсортированных по RS-баллу совместимости; карточки с анимацией framer-motion |
| **Страница университета** | Hero-слайдер, AI-инсайты, статистика с графиками (Recharts), программы, дедлайны, стипендии |
| **Трекер документов** | Загрузка файлов прямо со страницы университета, статусы: Missing / In Review / Verified |
| **Настройка приоритетов** | Чип-селекторы для стран/городов, направлений, языков, тегов; числовой ввод для GPA/бюджета/рейтинга |
| **Сохранённые и скрытые** | Синхронизированные списки, сохраняются в БД |
| **Авторизация** | NextAuth v5 с Credentials-провайдером, bcrypt-хэши паролей |
| **Лендинг** | Красивая публичная страница-презентация на `/`; авторизованных пользователей редиректит на `/feed` |

---

## 🏗 Технический стек

```
Next.js 15 (App Router, RSC, Suspense streaming)
TypeScript 5.7
Prisma ORM + SQLite (легко меняется на Postgres)
NextAuth v5 (Credentials)
OpenAI GPT-4o-mini (через Vercel AI SDK)
Tailwind CSS v4
framer-motion 12
Recharts 3
Zustand 5
```

---

## 📁 Структура проекта

```
src/
├── app/
│   ├── page.tsx                     # Лендинг (публичный)
│   ├── (auth)/login/                # Страница входа
│   ├── (auth)/register/             # Многошаговая регистрация
│   └── (app)/
│       ├── feed/                    # Лента университетов (карусель)
│       ├── university/[id]/         # Страница университета
│       └── profile/                 # Профиль студента
├── components/
│   ├── university/                  # Все блоки страницы университета
│   │   ├── stats-dashboard.tsx      # Графики Recharts с цветами по барам
│   │   ├── documents-checklist.tsx  # Трекер + загрузка файлов
│   │   ├── sticky-sidebar.tsx       # Боковая панель с AI Fit Ring
│   │   └── ...
│   └── registration/
│       └── step-tags.tsx            # Чип-селекторы предпочтений
├── lib/
│   ├── ai-fit.ts                    # GPT-4 scoring + кэш в БД
│   ├── rs-score.ts                  # Детерминированный RS Score
│   └── preference-categories.ts    # Конфиг категорий предпочтений
└── prisma/
    └── schema.prisma                # Модели БД
```

- Dry, non-personalized information — the same page for every student
- No clear action plan — a student reads but doesn't know what to do
- Documents and deadlines aren't connected to the student's actual status
- No sense of "am I a good fit?" — the page is passive
- No priority hierarchy — everything looks equally important

A Kazakhstani high-school student needs to answer 7 questions fast:
1. Does this university match my profile?
2. Which programs are right for me?
3. What documents do I have / what's missing?
4. What do I still need to prepare?
5. When is the critical deadline?
6. What are my next concrete steps?
7. Why is this a good choice specifically for me?

---

## 3. Solution

QApp Smart University Profile solves this with three layers:

**Personalization engine** — the student's academic profile (GPA, IELTS, SAT, interests, budget, preferred countries) is collected at registration and stored. Every university page is rendered against this profile: fit score, program ranking, document gaps, and scholarship relevance are all computed per-student.

**AI Fit Score** — an OpenAI-backed module reads the student profile + university data and produces a `0–100` score with human-readable reasons ("Strong match: your IELTS 7.0 meets the threshold") and gaps ("Missing: Medical Certificate — required for application"). Falls back to a deterministic mock score if no API key is present.

**Action-first UI** — every block answers one of the 7 questions above. The page is designed to scan in 30 seconds: Fit → Deadline → Documents → Programs → Scholarships → Next Steps.

---

## 4. Features

### Core (fully implemented)
- **Multi-step registration** — account + preferences (field of study, country, language, budget, rank) + priority weighting
- **Personalized Feed** — university cards sorted by AI Fit Score for the current student
- **Smart University Profile page** — full page for each university (`/university/[id]`)
  - Hero section with campus image slider, badges, CTA buttons
  - **AI Fit Card** — circular score chart, reasons, gaps, next steps (OpenAI or mock)
  - **Programs section** — search + filter by field / language / degree, cards sorted by fit score
  - **Deadlines Timeline** — visual vertical timeline with status indicators
  - **Documents Checklist** — grouped by status (Ready / Pending / Missing) with progress bar
  - **Scholarships section** — relevance badges per student profile
  - **Sticky Sidebar** — fit score, quick info, CTA, checklist (collapses on mobile)
  - **AI Chat Advisor** — ask questions about the university; real AI answers via OpenAI or mock suggestions
- **Student Profile page** — edit personal info, academic scores, document statuses
- **Preference editor** — adjust category priorities with a visual budget gauge
- **Search page** — find universities with live filtering
- **Settings** — language toggle (EN / RU / KZ), theme

### Backend (fully implemented)
- **Authentication** — NextAuth v5 with credentials (bcrypt), JWT sessions
- **Database** — Prisma ORM + SQLite (easily swappable to Postgres)
- **University data** — seeded Kazakhstani universities (Nazarbayev University, NURIS, SDU, KBTU, etc.) with programs, deadlines, scholarship info, and acceptance criteria. Data is stored in the SQLite database and served via API routes.
- **AI Fit cache** — results cached in DB by a deterministic profile hash. If no `OPENAI_API_KEY` is set, the system falls back to a rule-based score calculated from GPA thresholds, language match, field overlap, and budget fit.
- **Document tracking** — per-student document status (ready / pending / missing)
- **Chat sessions** — conversation history persisted per user + university

---

## 5. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + custom CSS variables |
| Animations | Framer Motion |
| UI Components | Radix UI, Lucide React, Recharts |
| State | Zustand |
| Auth | NextAuth v5 (credentials + JWT) |
| ORM | Prisma 6 |
| Database | SQLite (dev) — Postgres-ready |
| AI | Vercel AI SDK + OpenAI GPT-4o-mini |
| Deployment | Vercel / Netlify ready |

---

## 6. How to Run

### Prerequisites
- Node.js 18+
- npm or pnpm

### Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd QAppImpactHackathonProjectV2

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Отредактируй .env.local — заполни AUTH_SECRET и OPENAI_API_KEY
```

Что нужно заполнить:

| Переменная | Описание |
|---|---|
| `DATABASE_URL` | `file:./prisma/dev.db` для локальной разработки |
| `AUTH_SECRET` | Случайная строка: `openssl rand -base64 32` |
| `OPENAI_API_KEY` | Ключ OpenAI — нужен для AI Fit и чата советника |
| `OPENAI_MODEL` | Необязательно, по умолчанию `gpt-4o-mini` |

### 3. Инициализировать базу данных

```bash
npm run db:generate   # Prisma Client
npm run db:migrate    # Создать таблицы
npm run db:seed       # Загрузить университеты (опционально)
```

### 4. Запустить

```bash
npm run dev
# → http://localhost:3000
```

---

## 🌐 Основные маршруты

| Маршрут | Описание |
|---|---|
| `/` | Публичный лендинг |
| `/register` | Регистрация (3 шага: аккаунт → предпочтения → приоритеты) |
| `/login` | Вход |
| `/feed` | Персонализированная лента университетов |
| `/university/[id]` | Полная страница университета с AI |
| `/profile` | Профиль студента |

---

## 🤖 Как работает AI Fit

1. **RS Score** (`src/lib/rs-score.ts`) — детерминированный алгоритм, не требует API. Оценивает совпадение по стране/городу, направлению, языку, бюджету, рейтингу, стипендии, уровню обучения, тегам университета.

2. **GPT-4 Score** (`src/lib/ai-fit.ts`) — персонаж «Dr. Alex Morgan» анализирует профиль студента и данные университета. Возвращает JSON с полями:
   - `fitScore` — итоговый балл
   - `summary` — вердикт советника (3–5 предложений)
   - `strengths` — конкретные сильные стороны с цифрами
   - `gaps` — пробелы с планом устранения
   - `actionPlan` — 4 конкретных шага
   - `chartComments` — комментарии к каждому графику (scores, majors, financial, demographics)
   - `breakdown` — разбивка по осям (academic/language/financial/interest)

3. **Кэш** — результаты хранятся в таблице `AIFitEvaluation` в БД. Ключ кэша включает `PROMPT_VERSION = "v3"` — смена версии сбрасывает старые кэши.

---

## 🔒 Безопасность

- `.env.local` исключён из git через `.gitignore` — **API-ключи не попадают в репозиторий**
- Пароли хешируются через `bcryptjs`
- Все API-роуты проверяют `session.user.id` перед изменением данных
- БД (`*.db`) тоже исключена из git

---

## 📸 Скриншоты

> Лендинг → Лента → Страница университета → AI Советник → Трекер документов

*(добавь скриншоты в `/docs/screenshots/` и обнови этот раздел)*

---

## 👥 Команда

Проект создан в рамках **QApp Impact Hackathon 2026**.

---

## 📄 Лицензия

MIT
