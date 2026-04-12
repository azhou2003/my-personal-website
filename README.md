[Live Site](https://www.anjiezhou.dev/)

# My Personal Website

Personal website built with Next.js App Router, featuring:
- a markdown-powered blog
- a portfolio timeline loaded from JSON
- dark mode support

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS v4 (`@tailwindcss/postcss`)

## Local Development

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

Other scripts:

```bash
npm run build
npm run start
npm run lint
```

## Content

### Blog posts

Location: `src/content/posts/*.md`

Required frontmatter:

```yaml
---
title: "Post Title"
date: "YYYY-MM-DD"
tags: ["Tag1", "Tag2"]
summary: "Brief summary"
image: "/path/to/image.png"
---
```

`slug` is derived from the markdown filename.

### Portfolio projects

Location: `src/content/projects/*.json`

Shape:

```json
{
  "title": "Project title",
  "description": "Brief description",
  "date": "YYYY-MM-DD",
  "tags": ["Next.js", "TypeScript"],
  "images": ["/path/to/image.png"],
  "link": "https://example.com"
}
```

Notes:
- `images` is required and should include at least one image path.
- `link` is optional.

## Project Structure

- `src/app/` - route pages (home, blog, portfolio)
- `src/components/` - reusable UI components
- `src/content/posts/` - blog markdown files
- `src/content/projects/` - portfolio JSON files
- `src/lib/` - content loaders, metadata, utilities, shared types

## Deployment

Deployed on Vercel.
