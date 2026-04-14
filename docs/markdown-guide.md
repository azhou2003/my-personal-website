# Blog Markdown Guide

This project uses a single, shared markdown pipeline for all posts:

- `remark-gfm` for tables, task lists, and strikethrough
- `remark-breaks` so single newlines render as line breaks
- `remark-html` with sanitization enabled for predictable output

## Use Markdown Syntax (Preferred)

Write posts with normal markdown syntax instead of raw HTML tags.

### Headings

```md
# H1
## H2
### H3
```

### Paragraphs and line breaks

```md
First line
Second line

New paragraph
```

### Lists

```md
- Item one
- Item two
- Item three

1. First
2. Second
```

### Links and images

```md
[My link](https://example.com)
![Alt text](/houston.jpeg)
```

### Code blocks

````md
```ts
console.log("hello")
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

## Avoid

- Raw HTML (`<ul>`, `<li>`, `<br>`, etc.)
- Mixed markdown + HTML for basic formatting

The blog now has centralized markdown styling, so formatting updates should happen in one place: `src/app/globals.css` under `.markdown-content` selectors.
