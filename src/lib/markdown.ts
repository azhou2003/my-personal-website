import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import path from "path";
import fs from "fs";
import type { BlogMeta } from "./types";
import { BLOG_POSTS_DIR } from "./contentPaths";

export async function getBlogPostBySlug(slug: string) {
  const postPath = path.join(BLOG_POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(postPath)) return null;

  const file = fs.readFileSync(postPath, "utf8");
  const { data, content } = matter(file);
  const processedContent = await remark().use(html).process(content);

  return {
    metadata: data,
    contentHtml: processedContent.toString(),
  };
}

export function getAllBlogPosts(): BlogMeta[] {
  const files = fs.readdirSync(BLOG_POSTS_DIR);
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const fullPath = path.join(BLOG_POSTS_DIR, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);
      return {
        slug,
        title: data.title || slug,
        date: data.date || "",
        tags: data.tags || [],
        summary: data.summary || "",
        image: data.image || undefined,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
