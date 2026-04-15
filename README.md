[Live Site](https://www.anjiezhou.dev/)

# My Personal Website

Personal website built with Next.js App Router, featuring:
- a markdown-powered blog
- a portfolio section loaded from JSON
- a slide-driven About section loaded from JSON
- rotating footer quotes loaded from JSON
- dark mode support

## Tech Stack

- Next.js 15.5.15
- React 19
- TypeScript
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- Framer Motion
- Gray Matter + Remark (markdown parsing/rendering)

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

Note: this project currently has no `test` or dedicated `typecheck` script.

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

Optional frontmatter:

```yaml
updated: "YYYY-MM-DD"
```

Use `updated` only when a post has a meaningful content revision after publish.
Example:

```yaml
---
title: "Post Title"
date: "2026-04-13"
updated: "2026-04-15"
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

### Footer quotes

Location: `src/content/quotes/footerQuotes.json`

Shape:

```json
[
  {
    "text": "Build with care, then improve with feedback.",
    "author": "Site default"
  }
]
```

Notes:
- File should be a JSON array.
- `text` is required.
- `author` is optional.

### About slides

Location: `src/content/slides/*.json`

Shape:

```json
{
  "id": "home",
  "eyebrow": "About Me",
  "title": "Hey, I'm Anjie.",
  "pillText": "Meet Anjie",
  "imageSrc": "/cartoon-houston.png",
  "imageAlt": "Picture description",
  "imagePosition": "center",
  "paragraphs": ["Paragraph one", "Paragraph two"],
  "links": [
    {
      "label": "GitHub",
      "href": "https://github.com/example",
      "icon": "github",
      "external": true
    }
  ]
}
```

Notes:
- Required fields: `id`, `eyebrow`, `title`, `imageAlt`, `paragraphs`.
- Optional fields: `pillText`, `imageSrc`, `imagePosition`, `links`.
- Allowed `links[].icon` values: `email`, `github`, `linkedin`, `external`, `goodreads`, `blog`, `steam`.
- Slides are loaded in filename sort order (`01-*.json`, `02-*.json`, etc.).

## Project Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - reusable UI components
- `src/content/posts/` - blog markdown files
- `src/content/projects/` - portfolio JSON files
- `src/content/quotes/` - footer quote JSON data
- `src/content/slides/` - About section slide JSON data
- `src/hooks/` - custom React hooks
- `src/lib/` - content loaders, metadata, utilities, shared types

## Deployment

Deployed on Vercel.
