import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import BlogIndexClient from "./BlogIndexClient";
import matter from "gray-matter";
import path from "path";
import fs from "fs";

interface BlogMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  image?: string;
}

export const dynamic = "force-static";

function getAllPosts(): BlogMeta[] {
  // This function must only run on the server!
  const postsDir = path.join(process.cwd(), "src", "posts");
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  const posts: BlogMeta[] = files.map((file) => {
    const filePath = path.join(postsDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);
    return {
      slug: file.replace(/\.md$/, ""),
      title: data.title,
      date: data.date,
      tags: data.tags || [],
      summary: data.summary || "",
      image: data.image || undefined,
    };
  });
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return posts;
}

export default function BlogIndexPage() {
  // This file must NOT have 'use client' at the top!
  const posts = getAllPosts();
  return (
    <div className="min-h-screen flex flex-col bg-background-light text-foreground-light transition-colors">
      <Navbar />
      <BlogIndexClient posts={posts} />
      <Footer />
    </div>
  );
}
