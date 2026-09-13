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
  server/index.ts               # the Elysia app (add routes here)
  lib/eden.ts                   # typed client (api.health.get(), ...)
  components/ui/                # shadcn components
```

## Commands

```bash
bun run dev     # dev server on :3000
bun run build   # production build + typecheck
bun run lint
bun x shadcn@latest add <component>
```

Set `NEXT_PUBLIC_APP_URL` for the Eden client when not on `http://localhost:3000`.
