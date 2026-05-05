# Blog Markdown Guide

This project uses a shared markdown pipeline for blog posts:

- `remark-gfm` for tables, task lists, footnotes, and strikethrough
- `remark-breaks` so single newlines render as line breaks
- `remark-math` + `rehype-katex` for LaTeX
- `rehype-highlight` for syntax-highlighted code blocks
- `rehype-sanitize` for safe output

## Post frontmatter

Posts live in `src/content/posts/*.md` and start with YAML frontmatter.

```yaml
---
title: "Post Title"
date: "2026-04-24"
updated: "2026-04-25"
tags: ["Tag1", "Tag2"]
summary: "Short summary used on blog cards."
image: "/journal.jpeg"
---
```

Frontmatter fields and behavior:

- `title` (optional) - defaults to slug when missing
- `date` (optional in code, recommended in practice) - shown as `Published ...`
- `updated` (optional) - shown as `Updated ...`
- `tags` (optional) - defaults to `[]`; used for filters and related posts
- `summary` (optional) - defaults to `""`; used in cards and metadata
- `image` (optional) - used in blog card preview

## Core markdown syntax

### Headings and line breaks

```md
## Heading
This line breaks
without a blank line.
```

### Lists, links, quotes, strikethrough

```md
- Bullet
1. Ordered

[Link](https://example.com)

> Quote

~~strikethrough~~
```

### Syntax-highlighted code blocks

````md
```ts
function add(a: number, b: number) {
  return a + b;
}
```
````

### Tables and task lists

```md
| Feature | Status |
| --- | --- |
| Tables | Works |

- [x] Done
- [ ] Todo
```

### Footnotes

```md
Text with footnote.[^origin]

[^origin]: Footnote content.
```

Footnote links support both directions (reference -> footer and footer -> reference).

Reference-style example:

```md
Recent LLM progress has been fast.[^openai]
Transformer architecture remains foundational.[^attention]

[^openai]: OpenAI, "GPT-4 Technical Report," 2023. https://arxiv.org/abs/2303.08774
[^attention]: Vaswani et al., "Attention Is All You Need," NeurIPS 2017. https://arxiv.org/abs/1706.03762
```

Reusing a citation in multiple places:

```md
First mention of this source.[^book]
Later mention of the same source.[^book]

[^book]: Cal Newport, *Deep Work*, Grand Central Publishing, 2016.
```

### LaTeX math

```md
Inline: $E = mc^2$

$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$
```

Use `\$` for a literal dollar sign.

## Content enhancements

### Callouts

Use blockquotes with markers:

```md
> [!NOTE] This is a note.
> [!TIP] This is a tip.
> [!WARNING] This is a warning.
```

### Images, captions, and size variants

Standard image:

```md
![Alt text](/houston.jpeg)
```

Caption and size options (`wide` or `full`) using alt metadata:

```md
![Alt text | Caption text | wide](/houston.jpeg)
![Alt text | Full width image | full](/journal.jpeg)
```

Both `wide` and `full` remain constrained to the post content width (no bleed outside the markdown column).

Images and GIFs are zoomable when not wrapped in links.

## Auto-embed standalone links

If a paragraph contains only a bare URL, the post auto-embeds it when supported.

YouTube:

```md
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
https://www.youtube.com/shorts/dQw4w9WgXcQ
```

Direct media files:

```md
https://cdn.example.com/demo.mp4
https://cdn.example.com/demo.webm
https://images.example.com/photo.jpg
https://images.example.com/anim.gif
```

GitHub Gist card preview:

```md
https://gist.github.com/octocat/9257657
```

Gists render as a linked preview card (title + URL), not a full inline script embed.

Regular inline links remain normal links.

## Automatic post page features

These work automatically on post pages:

- Reading progress bar at the top
- Reading time estimate
- Heading anchor links copy the section URL
- Table of contents with the post title as the first item (links to top), indexing `##`, `###`, and `####` headings
- Collapsible table of contents toggle on smaller screens (including mobile), opening as an overlay panel
- Related posts based on shared tags (up to 2 posts; ties break by newer `date` first)
- Reader preferences (`A-`, `A+`, measure, and line spacing) in a dedicated row below tags (`measure` is hidden on mobile)

`markdown-qa-showcase.md` is available in development and hidden in production (excluded from listings and direct route access).

## Avoid

- Raw HTML for layout/embeds (`<iframe>`, `<video>`, etc.)
- Mixing markdown and HTML when markdown syntax already exists

For style updates, edit `.markdown-content` rules in `src/app/globals.css`.
