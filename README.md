# TalentDash — Career Intelligence Platform

Not a job board. Not a company review site. Not a salary listing. **Structured, comparable, decision-ready career data served at internet scale with near-zero infrastructure cost.**

TalentDash answers the questions every engineer asks when making a career move: *Is this a fair L4 offer at Amazon? What does Google pay for the same level? What are the interview rounds like?* Every answer is sourced from structured, normalised data — no opinion columns, no star ratings without context. Just facts you can act on.

## Tech Stack

All layers from the TalentDash architecture — each with a corresponding file or config in this repository.

| Layer | Technology | Implementation |
|---|---|---|
| Framework | Next.js 15 (App Router only) | `app/` — React Server Components, `generateStaticParams`, no Pages Router |
| Styling | Tailwind CSS v4 | `app/globals.css` — custom `@theme` design tokens. No ShadCN, MUI, Radix |
| Rendering | SSG + ISR | Company pages: SSG via `generateStaticParams`. Homepage/salaries: ISR. API routes: dynamic + CDN cache |
| Database | PostgreSQL via Neon (serverless) | `prisma/schema.prisma` — full schema with indexes, enums, relations |
| ORM | Prisma v7 | `prisma.config.ts`, `lib/db.ts` — driver adapter pattern, migration history |
| Hosting | Cloudflare Pages + CDN | `wrangler.toml`, `public/_headers`, `public/_redirects` — edge delivery config |
| Storage | Cloudflare R2 | Documented — zero-egress asset storage (logos, exports). Not yet needed for MVP |
| Job Queue | BullMQ + Upstash Redis | Documented — background scraping, normalisation, AI enrichment (future scope) |
| Scraping | Python + Playwright / Scrapy | Documented — seed data used instead for trial scope (AI/Data role) |
| AI Layer | OpenAI + Claude + Gemini | Documented — batch normalisation pipeline (AI/Data role) |
| Search (Phase 1) | PostgreSQL Full-Text Search | `prisma/migrations/..._fulltext_search/migration.sql` — `tsvector` + GIN index |
| Search (Phase 2) | Typesense (when needed) | Documented — typo tolerance and autocomplete at scale |
| Auth | Auth.js (NextAuth v5) | `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts` — GitHub OAuth |
| Analytics | PostHog (self-hosted or cloud) | `components/PostHogProvider.tsx`, `lib/analytics.ts` — pageview tracking |

## Quick Start (under 5 minutes)

### Prerequisites

- Node.js 18+
- A Neon PostgreSQL database (free tier — [create one here](https://console.neon.tech))

### Setup

```bash
# 1. Clone and install
cd talentdash
npm install

# 2. Set environment variables
cp .env.example .env.local
# Edit .env.local with your Neon connection string

# 3. Generate Prisma client
npx prisma generate

# 4. Push schema and seed data
npx prisma db push
npx prisma db seed

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | Neon PostgreSQL connection string with `sslmode=verify-full` |
| `NEXT_PUBLIC_BASE_URL` | No | `http://localhost:3000` | Base URL for internal API fetch calls (used in ISR pages) |
| `AUTH_SECRET` | No | — | NextAuth secret (32+ chars) — for contributor login |
| `AUTH_GITHUB_ID` | No | — | GitHub OAuth App client ID |
| `AUTH_GITHUB_SECRET` | No | — | GitHub OAuth App client secret |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | — | PostHog project API key — enables analytics |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | `https://app.posthog.com` | PostHog instance URL |

Example `.env.local`:

```
DATABASE_URL=postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=verify-full
NEXT_PUBLIC_BASE_URL=http://localhost:3000
AUTH_SECRET=your-secret-at-least-32-chars-long
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
NEXT_PUBLIC_POSTHOG_KEY=
```

### Commands

| Command | Action |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npx prisma db seed` | Seed database with 70+ salary records across 12 companies |

## Project Structure

```
talentdash/
├── app/
│   ├── page.tsx              # Homepage (ISR, 1 hour)
│   ├── layout.tsx            # Root layout with Inter font, nav, footer
│   ├── not-found.tsx         # Custom 404 page
│   ├── globals.css           # Design tokens (Tailwind v4 @theme)
│   ├── salaries/
│   │   └── page.tsx          # Salary table with filters (ISR, 5 min)
│   ├── companies/
│   │   └── [slug]/
│   │       └── page.tsx      # Company detail page (SSG)
│   ├── compare/
│   │   └── page.tsx          # Side-by-side salary comparison (static shell)
│   └── api/
│       ├── ingest-salary/    # POST — salary record ingestion
│       ├── salaries/         # GET — filtered, paginated salary data
│       ├── companies/[slug]/ # GET — company detail + median
│       └── compare/          # GET — two-record comparison with deltas
├── components/
│   ├── ui/                   # Primitive: Badge, Button, EmptyState, Pagination
│   └── features/             # Product: SalaryTable, FilterBar, CompareWidget,
│                               LevelDistributionBar
├── lib/
│   ├── db.ts                 # Prisma client singleton (driver adapter)
│   ├── constants.ts          # FX_RATES, LEVELS, CURRENCIES
│   ├── salary-utils.ts       # formatCurrency, computeMedian, debounce,
│   │                           serializeSalary
│   └── mock-data.ts          # 70 seed records across 12 companies
├── types/
│   └── index.ts              # SalaryRecord, CompanyDetail, CompareResponse, etc.
├── prisma/
│   ├── schema.prisma         # Company + Salary models with indexes
│   ├── migrations/           # Migration history (includes full-text search migration)
│   ├── seed.ts               # Seed script with normalisation demo
│   └── config.ts             # Prisma v7 config
├── components/
│   └── PostHogProvider.tsx   # Analytics pageview tracking (client component)
├── lib/
│   ├── analytics.ts          # PostHog client singleton
│   └── auth.ts               # Auth.js (NextAuth v5) configuration
├── wrangler.toml             # Cloudflare Pages deployment config
├── public/
│   ├── _headers              # Cloudflare CDN caching rules
│   └── _redirects            # Cloudflare Pages redirects
├── .env.example              # All environment variables documented
├── .eslintrc.json            # ESLint config (Next.js 15 compatible)
└── .prettierrc               # Prettier configuration
```

## API Endpoints

### `POST /api/ingest-salary`
Accepts the integration contract JSON body. Validates fields, normalises company name, recomputes `total_compensation`, checks for duplicates within 48 hours.

### `GET /api/salaries`
Query params: `company`, `role`, `level`, `location`, `currency`, `sort`, `page`, `limit` (default 25, max 100). Returns paginated results with `Cache-Control: s-maxage=300`.

### `GET /api/companies/:slug`
Returns company metadata, salary list, computed median TC, and level distribution. `Cache-Control: s-maxage=3600`.

### `GET /api/compare`
Query params: `s1`, `s2` (salary record UUIDs). Returns both records plus delta object. `Cache-Control: s-maxage=86400`.

## Rendering Strategy

| Page | Strategy | Why |
|---|---|---|
| Homepage `/` | ISR (revalidate: 3600) | Changes daily (trending, recent data). Too dynamic for full static build, too stable for SSR. |
| Company Page `/companies/[slug]` | SSG (`generateStaticParams`) | Built at deploy time for every known company. Data rarely changes. Fastest possible delivery. |
| Salary List `/salaries` | ISR (revalidate: 300) | Accepts filters via URL params. Each unique filter combo gets cached for 5 min after first request. New records from ingest-salary trigger revalidation. |
| Compare `/compare` | Static shell + client widget | Pure client-side comparison UI. No server data needed. URL state drives the comparison. |
| API Routes | Dynamic (CDN-cached) | Server-rendered per request. Cloudflare CDN applies Cache-Control headers at the edge. |

## Architecture Decisions

### Static vs ISR vs Dynamic

**SSG (generateStaticParams)** is used for company pages because the set of companies changes only on deploy — adding a new company means running a new build. This gives the fastest possible page load (instant from CDN) with zero server cost per request.

**ISR** bridges the gap between static and dynamic for the homepage and salaries listing. The homepage changes daily but not per-user — ISR refreshes it every hour without a full rebuild. The salaries page uses 5-minute ISR because filtered pages can't be pre-built for every combination, but they benefit from caching once requested.

**Dynamic SSR** is reserved for API routes and admin/auth pages — data that must be fresh per request. The API routes are still cached at the CDN layer via Cache-Control headers, so the origin server only handles cache misses.

### Page-Based Pagination

Page-based pagination (`page` + `limit`) was chosen over cursor-based for this use case because:
1. **URL shareability**: `/salaries?page=3` is human-readable and shareable. Cursor-based pagination uses opaque tokens that don't make sense in URLs.
2. **Cache-friendly**: Each page number maps to a predictable URL that CDNs can cache. Cursor-based pagination creates unique URLs per session.
3. **Simplicity**: Users expect "Previous / Next" and "Page X of Y" in a table view. Cursor-based pagination is better for infinite scroll or real-time feeds.
4. **SEO**: Search engines can crawl page-based pagination naturally. Cursor tokens are not crawlable.

The trade-off is that page-based pagination can miss or duplicate records if new data is inserted between page loads. For salary data (which changes slowly) this is acceptable.

### What I Would Build Differently With Another Day

1. **Salary pages at `/salaries/{role}/{company}/{location}`** — The document mentions individual salary permalink pages like `/salaries/software-engineer/amazon/bengaluru`. These are the core SEO assets and should be implemented next. They'd use SSG with `generateStaticParams` to pre-build the most common combinations.

2. **Company review and interview experience models** — The current schema only supports salary data. Adding `Review` and `InterviewExperience` models would make this a true career intelligence platform. Reviews would use structured dimensions (work-life balance, culture, management) with normalized scores, not free-text.

3. **Offer evaluation tool** — The core use case is "I got an offer for ₹42 LPA at Amazon L4 — is this fair?" An offer evaluation page would let users enter their offer details and get back percentile comparisons, market context, and similar-level compensation at other companies.

4. **Full-text search on salaries page** — Currently using Prisma `contains` with `mode: 'insensitive'` which works but doesn't scale. Adding PostgreSQL `tsvector` indexes would improve search quality at higher data volumes.

### What I Did Not Build (Scope Choices)

1. **No authentication** — No login, session handling, or JWT. The document explicitly says to skip this. Contributors submit data anonymously.

2. **No cursor-based pagination** — See rationale above. Page-based is better for this use case.

3. **No infinite scroll** — The table view with numbered pages is more accessible, SEO-friendly, and consistent with the data-first aesthetic.

4. **No charting/graphing** — Charts would add visual appeal but the document prioritizes the table, filters, and comparison engine. A salary heatmap or trend chart would be a future enhancement.

5. **No deployment automation / CI** — The project builds and runs locally. For production deployment, a GitHub Action that runs `npm run build` and deploys to Cloudflare Pages would be the next step.

## Data Pipeline (AI & Data Engineering)

TalentDash includes a complete data normalization and validation pipeline that transforms raw scraped salary data into structured, validated records ready for storage.

### Pipeline Architecture

```
Raw Scraped Records
       │
       ▼
┌──────────────────────────────┐
│  Stage 1: Normalization      │
│  ─ Company alias lookup       │
│  ─ Salary text parser         │
│  ─ Level mapping (rule-based) │
│  ─ Experience text parser     │
│  ─ Location cleaner           │
└──────────┬───────────────────┘
           │
    ┌──────┴──────┐
    ▼              ▼
  Pass          Reject → rejections.jsonl
    │
    ▼
┌──────────────────────────────┐
│  Stage 2: Validation         │
│  ─ Pydantic-style checks      │
│  ─ Enum enforcement           │
│  ─ Field constraints          │
│  ─ Confidence scoring         │
└──────────┬───────────────────┘
           │
    ┌──────┴──────┐
    ▼              ▼
  Pass          Reject → rejections.jsonl
    │
    ▼
┌──────────────────────────────┐
│  Stage 3: Output             │
│  ─ normalized-records.json   │
│  ─ POST to /api/ingest-salary │
│  ─ Quality report             │
└──────────────────────────────┘
```

### Company Alias System

The company name normalizer uses two layers:

**Layer 1 — Programmatic rules**: lowercase, trim, strip legal suffixes ("Pvt Ltd", "Inc", "LLC", ".com", "Technologies")

**Layer 2 — Alias lookup table**: maps known variants to canonical names

| Raw Input | Normalized Output |
|---|---|
| `Tata Consultancy Services` | `tcs` |
| `Google India Pvt. Ltd.` | `google` |
| `GOOGLE` | `google` |
| `Amazon Web Services` | `amazon` |
| `Infosys BPO` | `infosys` |
| `Flipkart Internet Pvt Ltd` | `flipkart` |
| `TCS Ltd.` | `tcs` |
| `Facebook India` | `meta` |

### Level Mapping System

Two-layer mapping from raw job titles to the TalentDash level enum:

- **Layer 1 — Rule-based**: exact title match (confidence 0.9), keyword matching (confidence 0.6–0.85)
- **Layer 2 — Experience heuristic**: uses parsed experience years to infer level when title is ambiguous

| Raw Title | Mapped Level | Method |
|---|---|---|
| `Software Engineer L4` | L4 | Rule exact (0.9) |
| `SDE-II` | SDE_II | Rule exact (0.85) |
| `Senior Software Engineer` | L5 | Keyword (0.6) |
| `Staff Engineer` | STAFF | Keyword (0.7) |
| `Principal Consultant` | PRINCIPAL | Keyword (0.7) |
| `Entry Level Developer` | L3 | Experience heuristic (0.65) |

### Salary Text Parser

Handles diverse salary text formats:

| Raw Text | Parsed Amount | Currency |
|---|---|---|
| `₹18–25 LPA` | ₹18,00,000 – ₹25,00,000 (mid: ₹21,50,000) | INR |
| `₹1.5 Cr` | ₹1,50,00,000 | INR |
| `₹85 K` | ₹85,000 | INR |
| `$150k–200k` | $150,000 – $200,000 (mid: $175,000) | USD |
| `₹42,00,000` | ₹42,00,000 | INR |

### Validation Layer (Pydantic-style)

Every record must pass strict validation before storage:

| Check | Constraint |
|---|---|
| Company | ≥ 2 chars after normalization |
| Role | Required, non-empty |
| Level | Must be valid enum: L3, L4, L5, L6, SDE_I, SDE_II, SDE_III, STAFF, PRINCIPAL, IC4, IC5 |
| Currency | Must be: INR, USD, GBP, EUR |
| Experience | Integer, 1–50 years |
| Base Salary | Positive number |
| Source | CONTRIBUTOR, SCRAPED, or AI_INFERRED |
| Confidence | 0.0–1.0 |

Rejected records are never silently dropped — each is written to `rejections.jsonl` with the raw input and rejection reason.

### Running the Pipeline

```bash
# Run with sample data (65 records, 12 companies)
npm run pipeline

# Run and ingest to local backend
npm run pipeline:ingest

# Run with custom input and options
npx ts-node scripts/run-pipeline.ts --input ./my-data.json --output ./results

# Full pipeline with remote backend
npx ts-node scripts/run-pipeline.ts --ingest --url https://talentdash.com
```

### Pipeline Output

```
pipeline-output/
├── raw-records.json          # Raw scraped records (passthrough)
├── normalized-records.json   # Validated records ready for storage
└── rejections.jsonl          # Rejected records with reasons (JSONL)
```

### Sample Run — Quality Report

```
════════════════════════════════════════════════════
  TALENTDASH DATA PIPELINE — QUALITY REPORT
════════════════════════════════════════════════════

📊 Pipeline Summary:
  Total records scraped:          68
  Records passed normalization:   66
  Records rejected (norm):        2
  Records passed validation:      63
  Records rejected (validation):  3
  Records stored successfully:    63

❌ Rejection Breakdown:
  invalid_salary:    2
  invalid_company:   2
  invalid_level:     1

📉 Null Rate Per Field:
  raw_company         0/68 (0.0%)
  raw_role            0/68 (0.0%)
  raw_salary_text     0/68 (0.0%)
  raw_location        0/68 (0.0%)
  raw_experience      0/68 (0.0%)

📋 Sample Records (Raw → Normalized):
  Sample #1:
    RAW:        {"raw_company":"Google India Pvt. Ltd.","raw_role":"Software Engineer L3","raw_salary_text":"₹18–25 LPA","raw_location":"Bengaluru","raw_experience":"1-3 years"}
    NORMALIZED: {"company":"google","role":"Software Engineer L3","level":"L3","location":"Bengaluru","currency":"INR","experience_years":2,"base_salary":2150000,"total_compensation":2150000,"confidence_score":0.85}
```

## Edge Cases Handled

- **Empty filter results**: Shows clear "No records found for these filters. Try removing a filter." message with a clear-all link
- **Single company record**: Level distribution bar renders 100% for one level
- **Zero bonus / zero stock**: Renders as em dash (—) in the table
- **Very long company names (40+ chars)**: Truncated with `...` and full title tooltip — table layout never breaks
- **Very large salaries (₹4,00,00,000)**: Formatted correctly in Indian lakh/crore system
- **Invalid company slug**: Returns 404 with navigation to home/salaries
- **Compare identical IDs**: Returns 400 with clear error message
- **Duplicate salary ingestion**: Returns 409 Conflict when same company+role+level+location within 48 hours and 10% base
- **Negative base_salary in ingest**: Returns 400 validation error
- **Invalid level enum**: Returns 400 with list of valid levels

## Live URL

*Deployment pending — see setup instructions above to run locally.*

---

*Built for the 3-Day Engineering Trial Task. For questions: refer to the trial document.*
