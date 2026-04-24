---
title: "Markdown QA Showcase"
date: "2026-04-23"
updated: "2026-04-23"
tags: ["QA", "Markdown", "Docs", "Musings"]
summary: "A single post that exercises every documented markdown and blog rendering feature."
image: "/journal.jpeg"
---

### Markdown QA Showcase

This post alternates markdown source and rendered output for each feature.

###### source = raw markdown, render = actual output

- [Headings and line breaks](#headings-and-line-breaks)
- [Lists, links, quotes, strikethrough](#lists-links-quotes-strikethrough)
- [Code block](#code-block)
- [Table and task list](#table-and-task-list)
- [Footnotes](#footnotes)
- [LaTeX](#latex)
- [Callouts](#callouts)
- [Standard markdown images](#standard-markdown-images)
- [Image captions and width variants](#image-captions-and-width-variants)
- [Auto-embed bare links](#auto-embed-bare-links)
- [Automatic post page behaviors](#automatic-post-page-behaviors)

#### Headings and line breaks

###### source

````md
## Sample H2 heading

### Sample H3 heading

#### Sample H4 heading

This line breaks
without a blank line.
````

###### render

## Sample H2 heading

### Sample H3 heading

#### Sample H4 heading

This line breaks
without a blank line.

---

#### Lists, links, quotes, strikethrough

###### source

````md
- First bullet
- Second bullet

1. First ordered item
2. Second ordered item

Use [example.com](https://example.com) for a regular inline link.

> This is a blockquote used for QA.

~~This text is struck through.~~
````

###### render

- First bullet
- Second bullet

1. First ordered item
2. Second ordered item

Use [example.com](https://example.com) for a regular inline link.

> This is a blockquote used for QA.

~~This text is struck through.~~

---

#### Code block

###### source

````md
```ts
function add(a: number, b: number) {
  return a + b;
}
```
````

###### render

```ts
function add(a: number, b: number) {
  return a + b;
}
```

---

#### Table and task list

###### source

````md
| Feature | Status |
| --- | --- |
| Tables | Works |
| Task lists | Works |

- [x] Documented
- [ ] Ship it
````

###### render

| Feature | Status |
| --- | --- |
| Tables | Works |
| Task lists | Works |

- [x] Documented
- [ ] Ship it

---

#### Footnotes

###### source

````md
This sentence has a footnote.[^qa-note-render]
This sentence cites a reference source.[^qa-ref]

[^qa-note-render]: Footnote content for QA validation.
[^qa-ref]: Vaswani et al., "Attention Is All You Need," NeurIPS 2017. https://arxiv.org/abs/1706.03762
````

###### render

This sentence has a footnote.[^qa-note-render]
This sentence cites a reference source.[^qa-ref]

---

#### LaTeX

###### source

````md
Inline math: $E = mc^2$.

$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$

Escaped dollar sign: \$5.
````

###### render

Inline math: $E = mc^2$.

$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$

Escaped dollar sign: \$5.

---

#### Standard markdown images

###### source

````md
![Local image sample](/houston.jpeg)
![Remote gif sample](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2I3M2VvM2NybmJ5d3ppM2U0a3VhYzV2a2Y4azByM3Q4dHZ5aGx3NiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7aD2saalBwwftBIY/giphy.gif)
````

###### render

![Local image sample](/houston.jpeg)
![Remote gif sample](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2I3M2VvM2NybmJ5d3ppM2U0a3VhYzV2a2Y4azByM3Q4dHZ5aGx3NiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7aD2saalBwwftBIY/giphy.gif)

---

#### Image captions and width variants

###### source

````md
![Houston skyline | City caption | wide](/houston.jpeg)
![Journal cover | Full width variant | full](/journal.jpeg)
````

###### render

![Houston skyline | City caption | wide](/houston.jpeg)
![Journal cover | Full width variant | full](/journal.jpeg)

---

#### Callouts

###### source

````md
> [!NOTE] This is a note callout.

> [!TIP] This is a tip callout.

> [!WARNING] This is a warning callout.
````

###### render

> [!NOTE] This is a note callout.

> [!TIP] This is a tip callout.

> [!WARNING] This is a warning callout.

---

#### Auto-embed bare links

###### source

````md
https://www.youtube.com/watch?v=dQw4w9WgXcQ

https://youtu.be/dQw4w9WgXcQ

https://www.youtube.com/shorts/dQw4w9WgXcQ

https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4

https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm

https://upload.wikimedia.org/wikipedia/commons/a/a9/Example.jpg

https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2I3M2VvM2NybmJ5d3ppM2U0a3VhYzV2a2Y4azByM3Q4dHZ5aGx3NiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7aD2saalBwwftBIY/giphy.gif

https://gist.github.com/octocat/9257657
````

###### render

https://www.youtube.com/watch?v=dQw4w9WgXcQ

https://youtu.be/dQw4w9WgXcQ

https://www.youtube.com/shorts/dQw4w9WgXcQ

https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4

https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm

https://upload.wikimedia.org/wikipedia/commons/a/a9/Example.jpg

https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2I3M2VvM2NybmJ5d3ppM2U0a3VhYzV2a2Y4azByM3Q4dHZ5aGx3NiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7aD2saalBwwftBIY/giphy.gif

https://gist.github.com/octocat/9257657

_Gist is shown as a linked preview card._

---

#### Automatic post page behaviors

###### source

_n/a (automatic, no special markdown required)_

###### render

- Reading progress bar appears at top while scrolling.
- Back-to-top button appears after scrolling down.
- Share button is shown in the metadata row.
- Reader preferences buttons (`A-`, `A+`, and measure toggle) are shown in their own row below tags.
- Sticky table of contents appears on large screens and tracks `##`, `###`, and `####` headings.
- Related posts show up to 2 items; ties are resolved by newer `date` first.
- Heading anchors (`#`) copy the section URL.

[^qa-note-render]: Footnote content for QA validation.
[^qa-ref]: Vaswani et al., "Attention Is All You Need," NeurIPS 2017. https://arxiv.org/abs/1706.03762
