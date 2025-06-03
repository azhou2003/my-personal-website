// src/lib/utils.ts
import matter from "gray-matter";
import fs from "fs";
import path from "path";

export function getSortedBlogPosts(postsDir: string) {
  const postFiles = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  return postFiles
    .map((filename) => {
      const file = fs.readFileSync(path.join(postsDir, filename), "utf8");
      const { data } = matter(file);
      return {
        slug: filename.replace(/\.md$/, ""),
        date: data.date,
        title: data.title || filename,
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getPrevNextPosts<T extends { slug: string }>(posts: T[], currentSlug: string) {
  const currentIdx = posts.findIndex((p) => p.slug === currentSlug);
  const prevPost = currentIdx > 0 ? posts[currentIdx - 1] : null;
  const nextPost = currentIdx < posts.length - 1 ? posts[currentIdx + 1] : null;
  return { prevPost, nextPost };
}
