# QApp — Контекст сессии для нового IDE
> Дата: 4 мая 2026 · Ветка: `feature/university-profile-redesign`

---

## Что это за проект

**QApp** — Next.js 15 (App Router) веб-приложение для подбора зарубежных университетов.  
Хакатон QApp Impact 2026. Репо: `Eye172/qapp_hackathon_smart_university_profile_v1`

**Stack:** Next.js 15, TypeScript, Prisma + SQLite, NextAuth v5, OpenAI GPT-4o-mini (Vercel AI SDK), Tailwind CSS v4, framer-motion, Recharts, Zustand.

---

## Что было сделано в этой сессии (все задачи ✅)

### 1. Фикс авторизации
- **Файл:** `src/auth.ts`
- Убран `PrismaAdapter` из конфига NextAuth (мешал Credentials-провайдеру)
- **Файл:** `src/app/(auth)/login/page.tsx`
- Убраны дефолтные тестовые credentials, улучшено отображение ошибок, редирект через `router.replace`

### 2. Регистрация — чип-селекторы вместо текстового ввода
- **Файл:** `src/lib/preference-categories.ts`
  - Добавлено поле `options?: string[]` в `PreferenceCategoryConfig`
  - Убрана отдельная категория `cities`, объединена с `countries` (теперь «Country & City»)
  - Добавлена новая категория `universityTags` (Research Intensive, Top Ranked, и т.д.)
  - Все текстовые категории теперь имеют `options` — строгий выбор из списка
- **Файл:** `src/components/registration/step-tags.tsx`
  - Полный рефакторинг: категории с `options` показывают чип-сетку (кликабельные), с поиском для длинных списков (>10 опций)
  - Числовые категории (GPA, бюджет, рейтинг) — прежний текстовый ввод
  - Вынесен `CategoryRow` как отдельный компонент (чтобы `useMemo` не был внутри `.map()`)

### 3. Убраны кнопки "Start Application"
- `src/components/university/sticky-sidebar.tsx` — убрана кнопка
- `src/components/university/university-cta.tsx` — убрана кнопка из мобильного CTA

### 4. Оптимизация загрузки страницы университета
- **Файл:** `src/app/(app)/university/[id]/page.tsx`
- Рефакторинг `getUniversityFromDB` — возвращает `{ profile, scholarships, deadlines }`
- Параллельный `Promise.all` для: данные университета + профиль студента + предпочтения
- Убраны дублирующие запросы к БД

### 5. Плавность карусели
- **Файл:** `src/app/(app)/feed/page.tsx`
- Изменён `SPRING` конфиг framer-motion: `stiffness: 160, damping: 28, mass: 1.1` для более плавного движения карточек

### 6. Редизайн графиков StatsDashboard
- **Файл:** `src/components/university/stats-dashboard.tsx`
- Полный рефакторинг: цветные бары (разный цвет для каждого), RadarChart для ключевых метрик, демография, финансы, топ-программы

### 7. Загрузка файлов документов
- **Файл:** `src/components/university/documents-checklist.tsx`
- Реальная загрузка: скрытый `<input type="file">` на каждый документ
- При выборе файла → PUT `/api/documents/[id]` → обновление статуса и имени файла в БД
- Локальный state обновляется, кнопка блокируется во время загрузки

### 8. Улучшение GPT-промпта
- **Файл:** `src/lib/ai-fit.ts`
  - Промпт переписан: персонаж «Dr. Alex Morgan» — советник с 20+ лет опыта
  - Новый JSON-формат ответа: `fitScore`, `summary`, `strengths[]`, `gaps[]`, `actionPlan[]`, `chartComments{scores,majors,financial,demographics}`, `breakdown{academic,language,financial,interest}`
  - `PROMPT_VERSION = "v3"` добавлен в хэш кэша — старые кэши автоматически инвалидируются
- **Файл:** `src/app/(app)/university/[id]/page.tsx`
  - `AIAdvisorSection` — показывает богатый rich-UI: вердикт советника, списки strengths/gaps, пилюли breakdown, пронумерованный action plan
  - `AIChartComments` — новый server-компонент рендерит GPT-комментарии под каждым графиком (4 карточки: Scores, Majors, Financial, Demographics)
  - Оба компонента завёрнуты в `<React.Suspense fallback={null}>`

### 9. RS Score — новые категории
- **Файл:** `src/lib/rs-score.ts`
  - `countries` теперь также матчит по `university.city` (substring-match)
  - Добавлен блок `universityTags` — пропорциональный match по `university.tags[]`
  - `studyLevel` нормализует `"Bachelor's"` → `"bachelor"` перед сравнением

### 10. Лендинг
- **Файл:** `src/app/page.tsx`
- Убран `UnifiedShell` (старый «всё на одном экране»)
- Заменён полноценным лендингом: hero, статистика, 6 фич, 3 шага, CTA, footer
- Авторизованных пользователей автоматически редиректит на `/feed`

---

## Ключевые файлы — что в них

| Файл | Назначение |
|---|---|
| `src/lib/ai-fit.ts` | GPT scoring, PROMPT_VERSION=v3, tryParseLLMResponse возвращает полный JSON в reasons |
| `src/lib/rs-score.ts` | Детерминированный RS Score, поддержка universityTags и city-match |
| `src/lib/preference-categories.ts` | Конфиг категорий, options[] для чип-селекторов |
| `src/app/(app)/university/[id]/page.tsx` | AIAdvisorSection (rich), AIChartComments (server+Suspense), parallel fetching |
| `src/components/university/stats-dashboard.tsx` | Recharts: цветные бары, RadarChart, финансы, демография |
| `src/components/university/documents-checklist.tsx` | Загрузка файлов через PUT /api/documents/[id] |
| `src/components/registration/step-tags.tsx` | CategoryRow компонент, чип-сетка с поиском |
| `src/app/page.tsx` | Лендинг + redirect для auth пользователей |
| `prisma/schema.prisma` | Модели: University, StudentProfile, AIFitEvaluation, UserPreferenceCategory, StudentDocument |

---

## Что ещё можно сделать (backlog)

- [ ] Тест нового GPT-промпта на реальном аккаунте с OpenAI API key
- [ ] Анимация появления лендинга (framer-motion)
- [ ] Страница `/saved` — список сохранённых университетов
- [ ] Deployment на Vercel (поменять DATABASE_URL на Postgres)
- [ ] Добавить скриншоты в README
- [ ] Мобильная адаптация чип-селекторов (прокрутка по горизонтали)
- [ ] Добавить поле `city` как отдельный критерий в профиль студента

---

## Запуск

```bash
npm install
cp .env.example .env.local  # заполни AUTH_SECRET и OPENAI_API_KEY
npm run db:generate
npm run db:migrate
npm run dev
```

Текущая ветка: `feature/university-profile-redesign`  
Порты 3000–3002 могут быть заняты если dev-сервер уже запущен.
