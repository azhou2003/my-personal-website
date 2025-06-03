import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getBlogPostBySlug } from "../../../lib/markdown";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getSortedBlogPosts, getPrevNextPosts } from "../../../lib/utils";
import { accentClassesLight, accentClassesDark } from "../../../components/styles/tagColors";
import { useIsDarkMode } from "../../../hooks/useIsDarkMode";
import TagList from "../../../components/TagList";
import BlogPostTags from "./BlogPostTags";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const postPath = path.join(process.cwd(), "src", "posts", `${params.slug}.md`);
  try {
    const file = fs.readFileSync(postPath, "utf8");
    const { data } = matter(file);
    return {
      title: data.title || params.slug,
      description: data.description || "",
    };
  } catch {
    return { title: "Post not found" };
  }
}

export async function generateStaticParams() {
  const fs = await import("fs");
  const path = await import("path");
  const postsDir = path.join(process.cwd(), "src/content/posts");
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  return files.map((file) => ({ slug: file.replace(/\.md$/, "") }));
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) return notFound();

  const { metadata: data, contentHtml: content } = post;

  // Get all blog post slugs for prev/next navigation
  const postsDir = path.join(process.cwd(), "src/content/posts");
  const posts = getSortedBlogPosts(postsDir);
  const { prevPost, nextPost } = getPrevNextPosts(posts, params.slug);

  return (
    <main className="max-w-2xl mx-auto py-16 px-4">
      <Link href="/blog" className="text-accent underline text-sm mb-8 inline-block">
        ← Back to Blog
      </Link>
      <h1 className="text-3xl font-bold mb-2">{data.title || params.slug}</h1>
      {data.date && <p className="text-muted text-sm mb-6">{data.date}</p>}
      {data.tags && Array.isArray(data.tags) && <BlogPostTags tags={data.tags} />}
      <article
        className="prose prose-neutral dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <div className="flex justify-between items-center mt-16">
        {prevPost ? (
          <Link
            href={`/blog/${prevPost.slug}`}
            className="text-accent underline text-base px-2 py-1 rounded hover:bg-accent-yellow/20 transition-colors"
          >
            ← Previous: {prevPost.title}
          </Link>
        ) : (
          <div />
        )}
        {nextPost ? (
          <Link
            href={`/blog/${nextPost.slug}`}
            className="text-accent underline text-base px-2 py-1 rounded hover:bg-accent-yellow/20 transition-colors ml-auto"
          >
            Next: {nextPost.title} →
          </Link>
        ) : (
          <div />
        )}
      </div>
    </main>
  );
}
