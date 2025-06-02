import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getBlogPostBySlug } from "../../../lib/markdown";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

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

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) return notFound();

  const { metadata: data, contentHtml: content } = post;

  // Get all blog post slugs for prev/next navigation
  const postsDir = path.join(process.cwd(), "src/posts");
  const postFiles = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  const posts = postFiles
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

  const currentIdx = posts.findIndex((p) => p.slug === params.slug);
  const prevPost = currentIdx > 0 ? posts[currentIdx - 1] : null;
  const nextPost = currentIdx < posts.length - 1 ? posts[currentIdx + 1] : null;

  return (
    <main className="max-w-2xl mx-auto py-16 px-4">
      <Link href="/blog" className="text-accent underline text-sm mb-8 inline-block">
        ← Back to Blog
      </Link>
      <h1 className="text-3xl font-bold mb-2">{data.title || params.slug}</h1>
      {data.date && <p className="text-muted text-sm mb-6">{data.date}</p>}
      {data.tags && Array.isArray(data.tags) && (
        <div className="flex flex-wrap gap-2 mb-8">
          {data.tags.map((tag: string) => (
            <span
              key={tag}
              className={`px-2 py-1 rounded text-xs font-medium border transition-all cursor-pointer hover:scale-110 hover:shadow-md 
                bg-[#b7c7a3]/70 text-[#4b5d3a] border-[#b7c7a3] dark:bg-[#3f4a36] dark:text-[#e6e4d9] dark:border-[#b7c7a3]`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
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
