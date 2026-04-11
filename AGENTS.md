# Agent Instructions

## Project Overview
Personal website built with Next.js 15.3.3, featuring a markdown-powered blog and portfolio section. Single-package, no tests.

## Commands
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - ESLint (only validation available)
- No `typecheck` or `test` scripts exist

## Content Structure
**Blog posts**: `src/content/posts/*.md` (README incorrectly says `src/posts/`)
**Portfolio projects**: `src/content/data/*.json` (README incorrectly says `src/data/`)

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
- **Dark mode**: Class-based (`darkMode: 'class'` in tailwind.config.js)
- **Styling**: Tailwind Typography plugin (`@tailwindcss/typography`) available via `prose` class
- **Custom palette**: Earthy tones - sage `#b7c7a3`, yellow `#ffe066`, orange `#ffb385`; backgrounds light `#fefae0` / dark `#2e2a27`
- **Path alias**: `@/*` maps to `./src/*`

## Architecture
- `src/app/` - Next.js App Router pages
- `src/components/` - UI components
- `src/lib/` - Utilities (markdown parsing, portfolio loader, types, formatting)
- `src/hooks/` - React hooks (dark mode detection)
- `src/content/` - Markdown posts and JSON portfolio data

## Deployment
Vercel (configured in `.vercel/` ignored by git). No CI/CD workflows exist.

## No Test Suite
This project has no test framework. Do not add test files expecting a test runner to exist.
