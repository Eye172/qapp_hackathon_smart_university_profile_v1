# QApp — Умный профиль университета с AI

> **QApp Impact Hackathon 2026** · Impact Admissions × QApp

QApp — персональный AI-admissions консультант для школьников из Казахстана. Платформа анализирует профиль студента (GPA, IELTS, SAT, бюджет, интересы) и превращает страницу каждого университета в персонализированный action plan: подходит ли вуз, какие программы релевантны, что из документов уже готово и что делать прямо сейчас.

---

## 🎯 Задача (по ТЗ)

Страница университета должна отвечать на **7 ключевых вопросов** студента за одно посещение:

| # | Вопрос | Реализация |
|---|---|---|
| 1 | Подходит ли мне этот университет? | AI Fit Score 0–100 с вердиктом |
| 2 | Какие программы мне подойдут? | Programs section с фильтрами и fit score по каждой программе |
| 3 | Какие документы нужны и что готово? | Documents Checklist с прогресс-баром и загрузкой |
| 4 | Что ещё нужно сделать? | Action Plan от AI советника |
| 5 | Когда критичный дедлайн? | Deadline Timeline — визуальная шкала |
| 6 | Какие следующие шаги? | Sticky Sidebar с чеклистом + AI Chat |
| 7 | Почему именно этот университет? | GPT-4o Summary с конкретными числами |

---

## ✅ Что реализовано (MVP + все опциональные улучшения)

ТЗ разделяло требования на **обязательные (MVP)** и **опциональные**. Реализованы **все** из обоих списков.

### Обязательные (MVP)
- **Responsive university profile page** — desktop + mobile, sticky sidebar коллапсируется на мобильном
- **Hero section** — слайдер фотографий кампуса, название (RU/EN/KZ), город, badges (язык · стипендии · дедлайн · AI Match), CTA-кнопки Save / Compare
- **AI Fit / Your Match** — персонализированный score 0–100, статус Qualified/Strong/Partial/Low, причины и gaps
- **Programs section** — поиск + фильтры Field / Language / Degree / Fit Score, карточки с match reason
- **Admission Requirements Checklist** — прогресс-бар, группировка Ready / Missing / Pending, загрузка файлов
- **Deadlines Timeline** — вертикальная визуальная шкала с цветовой индикацией статусов
- **Scholarships section** — карточки с relevance badges High / Medium / Low на основе профиля
- **Sticky Sidebar** — fit score card, quick info, чеклист шагов, CTA
- **Профиль студента** — полный редактор с GPA, IELTS sub-scores, SAT, бюджет, интересы
- **Персонализация** — RS Score и AI Fit пересчитываются под конкретного студента
- **Clean modern UI** — Tailwind v4, framer-motion анимации, glassmorphism карточки

### Опциональные (все реализованы)
- **Backend** — полноценный API на Next.js App Router, Prisma ORM, SQLite (Postgres-ready)
- **Загрузка реальных файлов** — document upload с хранением и статусами `pending → verified`
- **База данных университетов Казахстана** — Nazarbayev University, NURIS, SDU, KBTU и др. с программами, дедлайнами, стипендиями
- **Настоящий AI backend** — OpenAI GPT-4o (chat) + GPT-4o-mini (scoring) через Vercel AI SDK v6
- **Авторизация** — NextAuth v5 с Credentials-провайдером, bcrypt-хэши паролей
- **Сохранение прогресса** — saved/hidden университеты, история чата, документы — всё в БД

---

## 🤖 Как работает AI-персонализация

### Двухуровневая система оценки

**Уровень 1 — RS Score** (`src/lib/rs-score.ts`)
Детерминированный алгоритм без API. Взвешенная сумма по категориям предпочтений студента:

| Категория | Логика |
|---|---|
| Страна / город | Точное совпадение с предпочтениями |
| Направление | Совпадение с полями программ |
| Язык обучения | Совпадение с тегами и программами |
| Бюджет | Дешевейшая программа vs бюджет студента |
| Рейтинг | Мировой рейтинг QS/THE vs предпочтение |
| Стипендии | Есть ли финансирование |
| Уровень обучения | Bachelor / Master / PhD |
| Теги университета | Совпадение с university tags |

Каждая категория имеет вес `priority 1–20` — студент настраивает приоритеты на странице профиля.

**Уровень 2 — GPT-4o-mini Fit Score** (`src/lib/ai-fit.ts`)
AI-советник анализирует полный JSON профиля студента + данные университета. Возвращает:

```json
{
  "fitScore": 82,
  "summary": "На основе вашего профиля...",
  "strengths": ["GPA 4.7/5.0 превышает минимум 3.5...", "..."],
  "gaps": ["IELTS Writing 6.5 ниже предпочтительного 7.0...", "..."],
  "actionPlan": ["1. Пересдать IELTS через 8 недель...", "..."],
  "chartComments": {
    "scores": "Ваши баллы находятся в верхнем квартиле...",
    "majors": "Computer Science совпадает с 3 из 5 топ-программ...",
    "financial": "Бюджет покрывает 2 из 4 программ с учётом грантов...",
    "demographics": "25% международных студентов, сильное CS-сообщество..."
  },
  "breakdown": { "academic": 90, "language": 72, "financial": 65, "interest": 95 }
}
```

Веса: academic 35% · language 25% · financial 20% · interest 20%

**Кэш** — результаты хранятся в таблице `AIFitEvaluation` (ключ = djb2-хэш профиля + `PROMPT_VERSION`). Без `OPENAI_API_KEY` работает детерминированный mock-fallback — приложение **полностью функционально без API**.

**AI Chat Advisor** (`/api/llm/chat`) — модель `gpt-4o` с полным контекстом студента из БД (GPA, IELTS, документы, сохранённые вузы, предпочтения). Streaming-ответы через Vercel AI SDK.

---

## 🏗 Технический стек

| Слой | Технология | Версия |
|---|---|---|
| Framework | Next.js App Router (RSC, Suspense streaming) | 15.1.7 |
| Language | TypeScript | 5.7 |
| Styling | Tailwind CSS v4 + CSS custom properties | 4.0 |
| Animations | framer-motion | 12 |
| Charts | Recharts (Bar, Radar, custom tooltips) | 3 |
| UI Primitives | Radix UI Dialog, Lucide icons | latest |
| State | Zustand | 5 |
| Auth | NextAuth v5 (Credentials + JWT) | 5.0-beta |
| ORM | Prisma | 6 |
| Database | SQLite dev / Postgres prod | — |
| AI — scoring | OpenAI GPT-4o-mini via Vercel AI SDK | SDK v6 |
| AI — chat | OpenAI GPT-4o via Vercel AI SDK | SDK v6 |
| Analytics | Vercel Analytics + Speed Insights | 2.0 |

---

## 📁 Структура проекта

```
src/
├── app/
│   ├── page.tsx                        # Лендинг (публичный, redirect → /feed если авторизован)
│   ├── (auth)/
│   │   ├── login/                      # Страница входа
│   │   └── register/                   # 3-шаговая регистрация: аккаунт → предпочтения → приоритеты
│   └── (app)/
│       ├── feed/                       # Карусель университетов, sorted by RS Score
│       ├── university/[id]/            # Полная страница университета с AI
│       ├── profile/                    # Профиль студента + редактор предпочтений
│       ├── search/                     # Поиск по университетам
│       ├── timeline/                   # Дедлайны всех сохранённых вузов
│       └── settings/                   # Язык (EN/RU/KZ), тема
├── components/
│   ├── university/
│   │   ├── hero-slider.tsx             # Слайдер фото кампуса
│   │   ├── stats-dashboard.tsx         # Recharts: баллы, специальности, финансы, демография
│   │   ├── ai-insights-client.tsx      # AI Fit ring + strengths/gaps/action plan
│   │   ├── programs-section.tsx        # Программы с поиском и фильтрами
│   │   ├── deadline-timeline.tsx       # Визуальная временная шкала
│   │   ├── documents-checklist.tsx     # Чеклист документов + загрузка файлов
│   │   ├── scholarships-section.tsx    # Стипендии с relevance badges
│   │   └── sticky-sidebar.tsx         # Sticky summary: score, checklist, CTA
│   ├── shared/
│   │   └── ai-chat-sheet.tsx          # GPT-4o чат (Radix Dialog, streaming)
│   └── registration/
│       └── step-tags.tsx              # Чип-селекторы предпочтений
├── lib/
│   ├── rs-score.ts                    # RS Score engine (детерминированный, без API)
│   ├── ai-fit.ts                      # GPT-4o-mini scoring + DB cache
│   ├── ai/prompts.ts                  # System prompts для Dr. Alex Morgan
│   └── preference-categories.ts      # Конфиг 9 категорий предпочтений
├── store/
│   ├── useSessionStore.ts             # Профиль студента в памяти
│   ├── useAlgorithmStore.ts           # Состояние алгоритма сортировки
│   └── useSettingsStore.ts            # Язык + тема
└── prisma/
    ├── schema.prisma                  # 12 моделей БД
    ├── seed.ts                        # Сидирование университетов Казахстана
    └── migrations/                   # История миграций
```

---

## ⚙️ Быстрый старт

### Требования
- Node.js 18+
- npm

### 1. Клонировать

```bash
git clone https://github.com/Eye172/qapp_hackathon_smart_university_profile_v1.git
cd qapp_hackathon_smart_university_profile_v1
npm install
```

### 2. Переменные окружения

```bash
cp .env.example .env.local
```

Отредактируй `.env.local`:

| Переменная | Значение | Обязательно |
|---|---|---|
| `DATABASE_URL` | `file:./prisma/dev.db` | ✅ |
| `AUTH_SECRET` | `openssl rand -base64 32` | ✅ |
| `OPENAI_API_KEY` | Ключ OpenAI | Нет — без него работает mock |
| `OPENAI_MODEL` | `gpt-4o-mini` (по умолчанию) | Нет |

> **Без `OPENAI_API_KEY`** приложение полностью работает — AI Fit и чат переключаются на детерминированный mock-режим.

### 3. База данных

```bash
npm run db:generate    # Prisma Client
npm run db:migrate     # Создать таблицы
npm run db:seed        # Загрузить университеты Казахстана
```

### 4. Запустить

```bash
npm run dev
# → http://localhost:3000
```

### Дополнительные команды

```bash
npm run db:studio      # Prisma Studio — визуальный просмотр БД
npm run db:reset       # Полный сброс + пересидирование
npm run build          # Production build
npm run typecheck      # TypeScript проверка
```

---

## 🌐 Маршруты

| Маршрут | Описание |
|---|---|
| `/` | Публичный лендинг (redirect → /feed для авторизованных) |
| `/register` | Регистрация: аккаунт → чип-предпочтения → числовые приоритеты |
| `/login` | Вход |
| `/feed` | Карусель университетов, sorted by RS Score |
| `/university/[id]` | Полная страница университета с AI |
| `/profile` | Профиль студента + редактор предпочтений |
| `/search` | Поиск по университетам |
| `/timeline` | Дедлайны всех сохранённых вузов |
| `/settings` | Язык (EN/RU/KZ), тема |

---

## 🗄 База данных

12 моделей Prisma:

```
User → StudentProfile → StudentDocument
                     → UserPreferenceCategory → UserPreferenceValue
University → Program
           → Scholarship
           → Deadline
           → AIFitEvaluation   (кэш AI scoring)
           → UserUniversity    (saved / hidden)
ChatSession → ChatMessage
```

SQLite в dev — меняется на Postgres одной строкой в `schema.prisma`.

---

## 🔒 Безопасность

- `.env.local` исключён из git — **API-ключи не попадают в репозиторий**
- Пароли хешируются через `bcryptjs` (cost factor 12)
- Все API-роуты проверяют `session.user.id` перед изменением данных
- БД (`*.db`) исключена из git — только схема и миграции

---

## 📸 Скриншоты

> Лендинг → Лента → Страница университета → AI Советник → Трекер документов

*(добавь скриншоты в `/docs/screenshots/` и обнови этот раздел)*

---

## 👥 Команда

Проект создан в рамках **QApp Impact Hackathon 2026** · Impact Admissions × QApp.

---

## 📄 Лицензия

MIT

