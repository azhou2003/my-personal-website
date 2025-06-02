# My Personal Website

This is a personal website built with [Next.js](https://nextjs.org), featuring a markdown-powered blog and a portfolio section. The site is fully responsive, supports dark mode, and is easily extensible.

---

## 🚀 Getting Started

To run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the site.

---

## ✍️ Adding a Blog Post

Blog posts are written in Markdown and stored in `src/posts/`.

**To add a new blog post:**
1. Create a new `.md` file in `src/posts/` (e.g., `my-new-post.md`).
2. Add frontmatter at the top of the file:

   ```markdown
   ---
   title: My New Blog Post
   date: "2024-06-01"
   tags: ["Next.js", "React"]
   summary: "A short summary of my new post."
   image: "/path/to/image.png"
   ---
   
   Your blog content goes here. You can use Markdown syntax!
   ```

3. Save the file. The post will automatically appear on the blog page.

---

## 🗂️ Adding a Portfolio Project

Portfolio projects are defined as JSON files in `src/data/`.

**To add a new project:**
1. Create a new `.json` file in `src/data/` (e.g., `my-cool-project.json`).
2. Use the following structure:

   ```json
   {
     "title": "My Cool Project",
     "description": "A brief description of the project.",
     "date": "2024-05-15",
     "tags": ["Next.js", "TypeScript"],
     "images": ["/path/to/image.png"],
     "link": "https://github.com/yourusername/my-cool-project"
   }
   ```

3. Save the file. The project will automatically appear in the portfolio section.

---

## 🌐 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---
