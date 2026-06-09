# AMA2K LinkUp

Zimbabwe's social connection and dating app for true love, hookups, friendships, and meeting new people — with Tinder-style swipe matching and a modern purple design.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/ama2k-linkup run dev` — run the frontend (port 21141)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Wouter routing, TanStack Query, shadcn/ui, Tailwind CSS
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/db/src/schema/` — Drizzle DB schema (profiles, swipes, matches, messages)
- `artifacts/api-server/src/routes/` — API route handlers
- `artifacts/ama2k-linkup/src/pages/` — React pages (discover, matches, messages, profile, setup)
- `artifacts/ama2k-linkup/src/index.css` — Global theme (purple primary, warm accent)

## Architecture decisions

- `MY_PROFILE_ID = 1` is hardcoded as the "current user" — first profile in DB is always you
- Swipe matching: mutual likes automatically create match records for both users
- Discovery feed excludes already-swiped profiles using a NOT IN query
- Messages poll every 3 seconds for new content (no WebSocket needed for MVP)
- Profile photos use Unsplash URLs for seed data

## Product

- **Discover**: Swipe profile cards (like/pass/super-like). Shows match celebration modal on mutual like.
- **Matches**: Lists all mutual matches with last message preview. New matches shown as circles.
- **Messages**: Full conversation view per match with auto-scroll and message starters.
- **Profile**: View/edit own profile with photo, bio, interests, and lookingFor.
- **Setup**: Onboarding flow to create a profile (shown when no profile exists).

## User preferences

- Zimbabwe-focused dating app
- Modern purple design
- Swipe matching like Tinder

## Gotchas

- MY_PROFILE_ID is always 1 — the first seed profile (Chiedza Moyo) is "you"
- Run `pnpm --filter @workspace/db run push` after any schema changes
- Always run codegen after spec changes: `pnpm --filter @workspace/api-spec run codegen`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
