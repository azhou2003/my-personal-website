import matter from "gray-matter";
import path from "path";
import fs from "fs";

export interface BlogMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  image?: string;
}

export function getAllBlogPosts(): BlogMeta[] {
  const postsDir = path.join(process.cwd(), "src/posts");
  const files = fs.readdirSync(postsDir);
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const fullPath = path.join(postsDir, file);
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
