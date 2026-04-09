# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev       # Start dev server with Turbopack (default bundler) at localhost:3000
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

> **Note:** As of Next.js 16, `next build` no longer runs the linter automatically.

## Architecture

This is a **Next.js 16** app using the **App Router** with React 19, TypeScript, and Tailwind CSS v4.

- `app/layout.tsx` — Root layout (required, contains `<html>` and `<body>`)
- `app/page.tsx` — Home page route (`/`)
- `app/globals.css` — Global styles (Tailwind CSS)
- `public/` — Static assets served from `/`

### Key conventions in this version

- **Turbopack** is the default bundler (`next dev` uses it automatically). Use `next dev --webpack` to opt out.
- **Layouts and pages are Server Components by default.** Add `'use client'` only when you need interactivity, browser APIs, state, or effects.
- **`params` in dynamic routes is now a `Promise`** — you must `await params` before accessing its properties:
  ```tsx
  export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
  }
  ```
- **ESLint config** should use `eslint.config.mjs` (flat config format), not the legacy `.eslintrc.*`.
- **Environment variables** — only `NEXT_PUBLIC_*` vars are exposed to the client bundle; others are replaced with empty strings at build time.
- **Tailwind CSS v4** is used — check its docs for breaking changes from v3 (e.g., configuration via CSS instead of `tailwind.config.js`).

Before writing any Next.js code, read the relevant guide in `node_modules/next/dist/docs/`.

## Coding Standards

Before generating any code, always check the `/docs` directory for a relevant standards file and follow it. For example, before writing any UI code, read `docs/ui.md`.
