# sec-fillings

Next.js 16 (App Router, Turbopack) + shadcn/ui + Elysia.

## Stack

- **Next.js 16** — App Router, TypeScript, Tailwind CSS v4, `src/` dir, `@/*` alias
- **shadcn/ui** — radix base, `nova` preset, neutral base color, lucide icons
- **Elysia** — mounted at `/api/*` via a Next catch-all route handler
- **Eden Treaty** — end-to-end typed client for the Elysia app
- **Bun** — package manager

## Layout

```
src/
  app/
    api/[[...slugs]]/route.ts   # forwards every /api request to Elysia
    page.tsx
  server/
    index.ts                    # composes routers
    domain.ts                   # Filing, Company, CompanyFilings
    routes/                     # HTTP shape only
    services/                   # business logic
    integrations/edgar/         # SEC client, schemas, mappers
    lib/                        # env, http
  lib/eden.ts                   # typed client (api.health.get(), ...)
  components/ui/                # shadcn components
```

## Commands

```bash
bun run dev       # web + API on :3000
bun run build     # production build + typecheck
bun run test      # bun test, EDGAR fetches mocked
bun run lint
bun x shadcn@latest add <component>
```

Copy `.env.example` to `.env.local`. `SEC_USER_AGENT` must carry a real contact
email or the SEC will throttle you.