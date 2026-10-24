# AgentForge1

Autonomous revenue workflows for SaaS teams: Stripe billing, customer onboarding flows, and AI-powered operations managed from a single control plane.

## Run & Operate

- `pnpm install`
- `pnpm dev` — run API + browser app together
- `pnpm run typecheck` — full workspace typecheck
- `pnpm run build` — build all packages
- `docker compose up --build` — run everything in one environment
- Required env: `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLIENT_URL`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod
- Frontend: React + Vite + TypeScript
- Payments: Stripe Checkout + webhook handling
- Deployment: Docker Compose

## Where things live

- `artifacts/api-server/` — Express Stripe API and workflow engine
- `artifacts/mockup-sandbox/` — React dashboard front end
- `lib/db/` — PostgreSQL schema and Drizzle setup
- `lib/api-zod/` — request/response validation contracts
- `docker-compose.yml` — one-command local deployment

## Architecture decisions

- Payment orchestration is handled server-side so the frontend never stores secret or card data.
- Webhooks are source-of-truth for payment status changes to avoid trusting the browser.
- Shared validation schemas live in `lib/api-zod` so backend and UI agree on contracts.
- Docker Compose keeps the app and database local-first for rapid iteration and easy hosting transitions.

## Product

This platform combines a Stripe-backed SaaS checkout, a lightweight workflow dashboard, and a durable backend so an AI or ops team can trigger customer onboarding and billing from one place.

## User preferences

- Keep all payments and webhook validation server-side.
- Treat Stripe as the system of record whenever the payment state changes.
- Prefer explicit environment variables over hard-coded secrets.

## Gotchas

- The Stripe webhook secret must be configured before production use.
- `pnpm install` must complete before running the API or Vite app.
- Local development assumes a Postgres instance is available at `localhost:5432` or via Docker Compose.

## Pointers

- See the `tsconfig.base.json` and workspace package manifests for workspace structure.
