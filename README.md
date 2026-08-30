# Mizan — IraqLLM-Bench

**ميزان** — أول إطار تقييم وطني للنماذج اللغوية الكبيرة في العربية العامة
والعراقية والسياق العراقي.

Mizan is the national benchmark for large language models in Arabic, with a
dedicated **Iraqi Arabic** track. It measures how well any model — local or
global — actually understands Arabic and Iraq across six axes, on two
separately-scored tracks, with a sealed private test set that keeps every
score honest.

> Primary name: **Mizan**. Project codename: **IraqLLM-Bench**.

---

## ⚠️ Security note (read before pushing)

This repository must **never** contain secrets. The `.env` file (API keys,
database password) is git-ignored on purpose. If you ever committed a real
key by accident, rotate it immediately. Use `.env.example` as the template.

---

## What's inside

- **Dual-track benchmark**: `arabic` (general MSA) + `iraqi` (dialect &
  Iraqi context), scored and displayed separately plus an overall average.
- **Six axes**: comprehension, generation, translation (Iraqi-only),
  knowledge, official documents, safety.
- **Backend**: React 19 + Vite + TypeScript, tRPC, Express, Drizzle ORM,
  PostgreSQL. Self-hosted auth (bcrypt + JWT httpOnly cookies).
- **Contamination control**: private test items store only a SHA-256 hash
  manifest — their content is never stored on the platform.
- **Governance**: admin publish/retract with SHA-256 verification
  certificates and a public verification portal.
- **Evaluation runner** (`runner/`): provider-agnostic (Anthropic / OpenAI
  / echo), auto-scores multiple-choice and extraction items per (track,
  axis) with Wilson 95% confidence intervals, and holds open-generation
  items for human judging. Emits `mizan-results-v1` JSON.
- **Bilingual UI**: Arabic (default) and English, with automatic RTL/LTR
  switching and a header language toggle.

## Tech stack

React 19 · Vite · TypeScript · tRPC · Express · Drizzle ORM · PostgreSQL ·
Tailwind CSS · shadcn/ui

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Create your env file from the template and fill in real values
cp .env.example .env
#    then edit .env: DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY

# 3. Create the database schema
npm run db:generate
npm run db:migrate

# 4. Import the pilot item bank
npm run import:items -- --file data/pilot-0.1-part1.jsonl --version pilot-0.1
npm run import:items -- --file data/pilot-0.1-part2.jsonl --version pilot-0.1

# 5. Run the app (server on :3000, client on :5173)
npm run dev
```

A full step-by-step Arabic guide is in `docs/RUN_GUIDE_ar.pdf`, and the
bilingual runbook is in `RUNBOOK.md`.

## Running an evaluation

```bash
npm run eval -- \
  --items data/pilot-0.1-part1.jsonl \
  --items2 data/pilot-0.1-part2.jsonl \
  --provider anthropic \
  --model claude-haiku-4-5 \
  --developer Anthropic \
  --version pilot-0.1 \
  --out data/results-haiku.json

npm run import:results -- --file data/results-haiku.json
```

Then sign in to `/dashboard` and publish the run to the leaderboard.

## Project structure

```
client/     React front-end (bilingual, RTL-aware)
server/     tRPC + Express API, auth, importers, governance
shared/     Shared types and the JSONL item contract
runner/     Standalone evaluation runner (never touches the platform DB)
drizzle/    Database schema and migrations
data/       Pilot item bank (JSONL)
docs/       Item Writing Guidelines + Arabic run guide
```

## Methodology

Items are **originally authored** in Iraqi Arabic — never translated from
foreign benchmarks. See `docs/ITEM_WRITING_GUIDELINES_v1.md` for the full
authoring standard. The public development split lives in `data/`; the
official private test set is sealed and never published.

## Status

Pilot phase. The platform is functionally complete and has been run
end-to-end against real models. The item bank is being expanded toward the
300–500-item pilot target described in the project roadmap.

## License

See `LICENSE`.
