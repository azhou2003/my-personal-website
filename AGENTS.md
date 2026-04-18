# Agent Instructions

## Project Overview
Personal website built with Next.js 15.5.15, featuring a markdown-powered blog and portfolio section. Single-package, no tests.

## Commands
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - ESLint (only validation available)
- No `typecheck` or `test` scripts exist

## Content Structure
**Blog posts**: `src/content/posts/*.md` (README incorrectly says `src/posts/`)
**Portfolio projects**: `src/content/projects/*.json`

Blog post frontmatter:
```yaml
---
title: "Post Title"
date: "YYYY-MM-DD"
tags: ["Tag1", "Tag2"]
summary: "Brief summary."
image: "/path/to/image.png"
---
```

## Stack Details
- **Tailwind v4**: Uses `@tailwindcss/postcss` (CSS-first config), not v3-style `tailwind.config.js` with `@apply` directives
- **Dark mode**: Class-based (`darkMode: 'class'` in tailwind.config.js) and managed by `next-themes`
- **Styling**: Tailwind Typography plugin (`@tailwindcss/typography`) available via `prose` class
- **Custom palette**: Earthy tones - sage `#b7c7a3`, yellow `#ffe066`, orange `#ffb385`; backgrounds light `#fefae0` / dark `#2e2a27`
- **Path alias**: `@/*` maps to `./src/*`

## Architecture
- `src/app/` - Next.js App Router pages
- `src/components/layout/` - Layout shell components (`Navbar`, `Footer`, `PageLayout`, `GlobalStars`)
- `src/components/theme/` - Theme provider/toggle wrappers around `next-themes`
- `src/components/ui/` - Shared reusable UI building blocks
- `src/components/ui/tags/` - Shared tag primitives
- `src/features/blog/components/` - Blog-specific interactive components
- `src/features/home/components/` - Home-specific components (includes `hero-orbit/`)
- `src/features/portfolio/components/` - Portfolio-specific timeline and related components
- `src/lib/` - Utilities (markdown parsing, portfolio loader, types, formatting)
- `src/content/` - Markdown posts and JSON portfolio data

## Conventions For Future Agents
- Prefer `@/` imports over long relative imports when crossing folders.
- Prefer barrel exports where available:
  - `@/components/layout`
  - `@/components/theme`
  - `@/components/ui`
  - `@/components/ui/styles`
  - `@/components/ui/tags`
  - `@/features/blog/components`
  - `@/features/home/components`
  - `@/features/portfolio/components`
- For theme-dependent colors, use CSS variables in `src/app/globals.css` (`:root` + `.dark`) instead of duplicating light/dark JS logic.
- Avoid per-component DOM theme observers or localStorage theme toggles; use `next-themes`.
- Keep interactive feature logic inside its feature folder when possible (for example, timeline logic under `src/features/portfolio/components`).
- Keep `src/app/*Client.tsx` files focused on orchestration (filters/props/wiring) and move heavy UI/scroll logic into feature components.
- Use semantic interactive elements (`button`, `a`) for controls (including filter tags), and include `aria-pressed` for toggle-like controls.

## Deployment
Vercel (configured in `.vercel/` ignored by git). No CI/CD workflows exist.

## No Test Suite
This project has no test framework. Do not add test files expecting a test runner to exist.
