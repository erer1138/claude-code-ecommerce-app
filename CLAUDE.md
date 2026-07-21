# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — run ESLint (flat config via `eslint.config.mjs`)

There is no test setup yet (no test runner is configured or listed in `package.json`).

## Architecture

This is a fresh, unmodified `create-next-app` scaffold (Next.js 16.2.10, React 19, App Router) — no e-commerce features have been built yet despite the repo name. Current state:

- `src/app/` — App Router root. `layout.tsx` defines the root HTML shell and loads the Geist fonts; `page.tsx` is the default starter homepage.
- `src/app/globals.css` — global styles, imported by the root layout. Tailwind v4 is wired in via `@tailwindcss/postcss` (see `postcss.config.mjs`) — no `tailwind.config` file is used (v4 uses CSS-based config).
- `public/` — static assets referenced by the starter page (svg logos).
- Path alias `@/*` maps to `src/*` (see `tsconfig.json`).

Since the App Router structure, conventions, and APIs may differ from the Next.js you were trained on, consult `node_modules/next/dist/docs/01-app/` (getting-started, guides, api-reference) before adding routes, layouts, data fetching, or server actions.
