# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Build for production
npm run preview   # Preview production build
```

No linting or test commands are configured in this project.

## Environment Variables

Requires a `.env.local` file with:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Architecture

**Stack:** React 19 + TypeScript + Vite + React Router v7 + Supabase + Tailwind CSS (CDN)

**Deployed on Vercel** with SPA routing (`vercel.json` redirects all routes to `/index.html`).

### Directory Layout

- `src/views/` — Page-level route components (one file per route)
- `src/components/` — Shared UI components (Navbar, Footer, Card, etc.)
- `src/lib/supabase.ts` — Supabase client initialization (single instance, imported everywhere)

### Routing (`App.tsx`)

All views are lazy-loaded via `React.lazy()`. Routes:

| Path | View | Notes |
|------|------|-------|
| `/` | Home | Card grid dashboard |
| `/blog` | Blog | Posts with category filter |
| `/blog/:slug` | BlogPost | Individual post |
| `/fotografias` | Projects | Photography gallery |
| `/fotografias/:slug` | ProjectDetail | Single project |
| `/details` | Details | Ejes de Desarrollo |
| `/archivos` | Archives | Archive listing |
| `/about` | About | About page |
| `/login` | Login | Auth page (no Navbar) |
| `/publicar` | PublishPost | Protected |
| `/editar/:slug` | PublishPost | Protected |

`ProtectedRoute` wraps `/publicar` and `/editar/:slug` — checks Supabase session and redirects to `/login` if unauthenticated.

### Data Layer

No global state management. Each view fetches data directly from Supabase using `useEffect` + `useState`. The Supabase client at `src/lib/supabase.ts` is the single entry point for all DB and auth operations.

**Database tables:** `posts`, `categories`, `projects`, `certificates`, `profiles`

**Auth:** Email/password via Supabase Auth. Session checked with `supabase.auth.getSession()`. Navbar shows logout button when a session exists.

### Styling

Tailwind CSS is loaded via CDN in `index.html` (not installed as a package — do not run `npx tailwindcss`). All styling uses Tailwind utility classes directly. Brand colors: purple `#702d8d` (primary), cyan `#5cc8d7` (secondary).

### Path Alias

`@/` resolves to the project root (configured in `vite.config.ts` and `tsconfig.json`).
