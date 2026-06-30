# Mekalin Visual Engine

> A competency assessment and visualization SaaS platform for Instructional Designers.

## Vision

The Mekalin Visual Engine is a modern, serverless-first SaaS application that empowers Instructional Designers to assess, visualize, and grow their professional competencies. It renders interactive "competency constellations" that map expertise across domains, clusters, and individual skills.

### Core Principles

- **Scalability** — Handle viral growth from anonymous assessments without infrastructure intervention
- **Privacy-first** — Anonymous assessment flow with optional progressive identity revelation
- **Performance** — Sub-second visualization rendering for complex competency maps
- **Developer velocity** — Small team, maximum leverage through managed services
- **Global reach** — CDN-first delivery for a worldwide audience

## Key Features

- **Anonymous Competency Assessments** — Zero-friction entry, no login required
- **Interactive Competency Constellation** — D3.js/Visx-powered radial visualization of proficiency
- **Progressive Identity** — Start anonymous, optionally save and track progress
- **Practice Playground** — Targeted skill improvement exercises
- **Team Analytics** — Aggregate competency views for team leads
- **PDF Reports** — Branded, exportable competency profiles

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router), Tailwind CSS 4, D3.js + Visx |
| State | Zustand + TanStack Query |
| Backend | Supabase (PostgreSQL, Auth, Edge Functions, Storage) |
| Hosting | Vercel (Edge Network) |
| CI/CD | GitHub Actions |
| Analytics | PostHog + Vercel Analytics |

## Getting Started

```bash
# Prerequisites: Node 20+, pnpm, Docker (for local Supabase)
git clone https://github.com/chaitprabhu/mekalin-visual-engine.git
cd mekalin-visual-engine
pnpm install

# Start local Supabase
supabase start

# Run migrations & seed
supabase db reset

# Start dev server
pnpm dev
```

## Project Structure

```
mekalin-visual-engine/
├── app/
│   ├── (marketing)/        # Landing page, about, pricing
│   ├── (assessment)/       # Assessment flow (no auth required)
│   ├── (dashboard)/        # Authenticated area
│   ├── (team)/             # Team admin area
│   └── api/                # Next.js API routes
├── components/
│   ├── ui/                 # Design system
│   ├── assessment/         # Question renderer, progress
│   ├── visualizer/         # D3/Visx competency charts
│   └── playground/         # Practice lab components
├── lib/
│   ├── supabase/           # Client & server instances
│   ├── scoring/            # Scoring utilities
│   └── utils/
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript definitions
└── supabase/
    └── migrations/         # Database migrations
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
POSTHOG_KEY=
SENTRY_DSN=
```

## License

Proprietary — Aurelia Engineering Team
