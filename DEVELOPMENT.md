# QApp — personalized university admissions workspace

A university profile becomes an actionable admissions plan: program fit, requirements, documents, scholarships and deadlines in one interface.

**Impact Admissions × QIntern Hackathon · 2026 · Hackathon MVP**

## Product

QApp combines an applicant profile with university data to show relevant programs and explain what to do next. The workflow includes profile editing, university comparison, a document checklist, saved progress and an AI advisor.

- Personalized fit scores with reasons and gaps.
- Program filters and scholarship relevance.
- Document uploads, status tracking and deadline timelines.
- An AI chat and generated action plan grounded in the applicant profile.
- Responsive English, Russian and Kazakh interface.

## Architecture

**Next.js · TypeScript · Tailwind CSS · Prisma · SQLite · NextAuth · Vercel AI SDK**

The Next.js application serves both the interface and API routes. Prisma stores profiles, universities, progress and documents. Authentication uses the credentials provider. The scoring workflow combines deterministic profile matching with model-generated explanations; an explicit mock mode supports local demonstration without an OpenAI key.

## Run locally

Use Node.js 18+ and npm. Clone this repository, then:

```bash
npm install
cp .env.example .env.local
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Set `DATABASE_URL` and `AUTH_SECRET` in the local environment. Add `OPENAI_API_KEY` to enable live AI responses; without it, fit scoring and chat use the documented deterministic mock. Open http://localhost:3000.

## Scope

This is a hackathon implementation with a seeded university dataset and an admissions planning workflow. Fit scores are product guidance, rather than admissions decisions. The local SQLite setup and demonstration data should be reviewed before operating a public service.

## Authorship

**[Shakhnazar Akhmer](https://github.com/Eye172)** served as **team lead and principal software developer** in 2026, implementing the application and integrations. Other team members supported research and the pitch. The project was built for the Impact Admissions × QApp case.

[Original detailed documentation in Russian](README.original.md) includes the complete feature inventory, API notes, data model and environment reference.
