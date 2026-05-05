import matter from "gray-matter";
import { remark } from "remark";
import breaks from "remark-breaks";
import gfm from "remark-gfm";
import math from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import path from "path";
import fs from "fs";
import type { BlogFrontmatter, BlogMeta } from "./types";
import { BLOG_POSTS_DIR } from "./contentPaths";

const QA_SHOWCASE_SLUG = "markdown-qa-showcase";

function isQAShowcaseHiddenInCurrentEnv() {
  return process.env.NODE_ENV === "production";
}

function estimateReadingTimeMinutes(markdown: string) {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$[^$\n]+\$/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, " $1 ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[>#*_~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const words = plainText ? plainText.split(" ").length : 0;

  return Math.max(1, Math.ceil(words / 200));
}

async function renderMarkdown(content: string) {
  const processedContent = await remark()
    .use(gfm)
    .use(breaks)
    .use(math)
    .use(remarkRehype, {
      clobberPrefix: "",
      footnoteBackContent: "Back",
      footnoteBackLabel: "Back to reference",
    })
    .use(rehypeSanitize, { clobberPrefix: "" })
    .use(rehypeKatex)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(content);

  return processedContent.toString();
}

export async function getBlogPostBySlug(slug: string) {
  if (isQAShowcaseHiddenInCurrentEnv() && slug === QA_SHOWCASE_SLUG) {
    return null;
  }

  const postPath = path.join(BLOG_POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(postPath)) return null;

  const file = fs.readFileSync(postPath, "utf8");
  const { data: rawData, content } = matter(file);
  const data = rawData as BlogFrontmatter;
  const contentHtml = await renderMarkdown(content);
  const readingTimeMinutes = estimateReadingTimeMinutes(content);
  const metadata: BlogFrontmatter = {
    title: data.title || slug,
    date: data.date || "",
    updated: data.updated || undefined,
    tags: Array.isArray(data.tags) ? data.tags : [],
    summary: data.summary || "",
    image: data.image || undefined,
  };

  return {
    metadata,
    contentHtml,
    readingTimeMinutes,
  };
}

export function getAllBlogPosts(): BlogMeta[] {
  const files = fs.readdirSync(BLOG_POSTS_DIR);
  const posts = files
    .filter((file) => file.endsWith(".md"))
    .filter((file) => !(isQAShowcaseHiddenInCurrentEnv() && file.replace(/\.md$/, "") === QA_SHOWCASE_SLUG))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const fullPath = path.join(BLOG_POSTS_DIR, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data: rawData } = matter(fileContents);
      const data = rawData as BlogFrontmatter;
      return {
        slug,
        title: data.title || slug,
        date: data.date || "",
        updated: data.updated || undefined,
        tags: Array.isArray(data.tags) ? data.tags : [],
        summary: data.summary || "",
        image: data.image || undefined,
      };
    });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}
