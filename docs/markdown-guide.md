# Blog Markdown Guide

This blog uses one shared markdown pipeline:

- `remark-gfm` for GitHub-style markdown features (tables, task lists, footnotes, strikethrough)
- `remark-breaks` so a single newline is rendered as a line break
- `remark-math` + `rehype-katex` for LaTeX math rendering
- `rehype-sanitize` for predictable, safe markdown output

## 1) Post frontmatter

Every post in `src/content/posts/*.md` should start with frontmatter:

```yaml
---
title: "Post Title"
date: "2026-04-23"
updated: "2026-04-24"
tags: ["Writing", "Dev"]
summary: "One short summary sentence for the blog card."
image: "/journal.jpeg"
---
```

Field behavior:

- `title` is shown on blog cards and the post page title
- `date` is shown as `Published ...`
- `updated` is optional; when present it is shown as `Updated ...`
- `tags` power post tags and filtering on `/blog`
- `summary` is shown on blog cards and in metadata description
- `image` is used for the blog card preview image

## 2) Core markdown features

### Headings and paragraphs

```md
# H1
## H2
### H3

First line
Second line

New paragraph
```

Notes:

- H2/H3/H4 headings automatically get clickable anchor links on the post page
- Single newlines create visible line breaks

### Lists, links, and quotes

```md
- Item one
- Item two

1. First
2. Second

[External link](https://example.com)

> This is a blockquote.
```

### Code blocks

````md
```ts
const greeting = "hello";
console.log(greeting);
```
````

Note: code blocks get a copy button automatically on the post page.

### Tables and task lists

```md
| Feature | Status |
| --- | --- |
| Tables | Works |
| Task lists | Works |

- [x] Done
- [ ] Todo
```

### Footnotes

```md
Here is a sentence with a footnote.[^origin]

[^origin]: This is the footnote text.
```

Notes:

- Footnotes are supported via GFM syntax
- Footnote jumps are smooth-scrolled and highlighted on arrival

### LaTeX math

Inline math:

```md
Einstein wrote $E = mc^2$.
```

Block math:

```md
$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$
```

Notes:

- Use single `$...$` for inline math
- Use double `$$...$$` for block math
- Escape a literal dollar sign as `\$`

## 3) Media support

### Standard markdown images (recommended)

```md
![Alt text](/houston.jpeg)
![Animated gif](https://media.example.com/loop.gif)
```

Notes:

- Images and GIFs render inline
- Clicking an unlinked image opens the lightbox preview

### Auto-embed standalone links

If a paragraph contains only a bare URL, it is auto-embedded when supported.

YouTube URLs:

```md
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
https://www.youtube.com/shorts/dQw4w9WgXcQ
```

Direct video file URLs:

```md
https://cdn.example.com/demo.mp4
https://cdn.example.com/demo.webm
```

Direct image file URLs:

```md
https://images.example.com/photo.jpg
https://images.example.com/animation.gif
```

Notes:

- Only standalone bare links are auto-embedded
- Normal inline markdown links stay normal links
- Raw HTML embeds like `<iframe>` or `<video>` are not supported in markdown

## 4) Automatic post-page features

These are automatic and do not require special markdown syntax:

- Top reading progress bar
- Share button (native share when available, clipboard fallback)
- Back-to-top button after scrolling
- Reading-time estimate (`X min read`) based on post content

## 5) Full example post

```md
---
title: "A Complete Example"
date: "2026-04-23"
updated: "2026-04-24"
tags: ["Example", "Markdown"]
summary: "A post showing all supported markdown features."
image: "/journal.jpeg"
---

## Intro

This line breaks
without a blank line because `remark-breaks` is enabled.

### Lists and quote

- One
- Two

> A thoughtful quote.

### Link and footnote

[Portfolio](https://example.com)

This sentence has a footnote.[^1]

[^1]: Footnote content goes here.

### Table

| Name | Value |
| --- | --- |
| Mood | Calm |

### LaTeX

Euler's identity is $e^{i\pi} + 1 = 0$.

$$
\nabla \cdot \vec{E} = \frac{\rho}{\varepsilon_0}
$$

### Code

```ts
function add(a: number, b: number) {
  return a + b;
}
```

### Image

![City skyline](/houston.jpeg)

### YouTube auto-embed

https://www.youtube.com/watch?v=dQw4w9WgXcQ

### MP4 auto-embed

https://cdn.example.com/demo.mp4
```

## Avoid

- Raw HTML for layout or embeds (`<iframe>`, `<video>`, `<div>`, etc.)
- Mixing markdown and HTML when markdown syntax already exists

For style changes, update `src/app/globals.css` under `.markdown-content` selectors.
