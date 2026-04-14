import matter from "gray-matter";
import { remark } from "remark";
import breaks from "remark-breaks";
import gfm from "remark-gfm";
import html from "remark-html";
import path from "path";
import fs from "fs";
import type { BlogMeta } from "./types";
import { BLOG_POSTS_DIR } from "./contentPaths";
import {
  getSampleBlogPostBySlug,
  getSampleBlogPosts,
  shouldIncludeLocalSampleContent,
} from "./sampleContent";

export async function getBlogPostBySlug(slug: string) {
  const postPath = path.join(BLOG_POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(postPath)) {
    if (!shouldIncludeLocalSampleContent()) return null;
    const samplePost = getSampleBlogPostBySlug(slug);
    if (!samplePost) return null;
    const processedContent = await remark()
      .use(gfm)
      .use(breaks)
      .use(html, { sanitize: false })
      .process(samplePost.content);
    return {
      metadata: samplePost.metadata,
      contentHtml: processedContent.toString(),
    };
  }

  const file = fs.readFileSync(postPath, "utf8");
  const { data, content } = matter(file);
  const processedContent = await remark().use(gfm).use(breaks).use(html, { sanitize: false }).process(content);

  return {
    metadata: data,
    contentHtml: processedContent.toString(),
  };
}

export function getAllBlogPosts(): BlogMeta[] {
  const files = fs.readdirSync(BLOG_POSTS_DIR);
  const filePosts = files
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
    });

  const posts = shouldIncludeLocalSampleContent()
    ? [...filePosts, ...getSampleBlogPosts()]
    : filePosts;

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}
