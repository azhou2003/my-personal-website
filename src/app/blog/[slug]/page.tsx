import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getBlogPostBySlug } from "../../../lib/markdown";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getSortedBlogPosts, getPrevNextPosts } from "../../../lib/utils";
import { formatDate } from "../../../lib/formatDate";
import StaticTagList from "../../../components/StaticTagList";
import ShareButton from "../../../components/ShareButton";
import { BLOG_POSTS_DIR } from "../../../lib/contentPaths";

type BlogPageParams = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: BlogPageParams }): Promise<Metadata> {
  const resolvedParams = await params;
  const postPath = path.join(BLOG_POSTS_DIR, `${resolvedParams.slug}.md`);
  try {
    const file = fs.readFileSync(postPath, "utf8");
    const { data } = matter(file);
    return {
      title: data.title || resolvedParams.slug,
      description: data.summary || data.description || "",
    };
  } catch {
    return { title: "Post not found" };
  }
}

export async function generateStaticParams() {
  const files = fs.readdirSync(BLOG_POSTS_DIR).filter((f) => f.endsWith(".md"));
  return files.map((file) => ({ slug: file.replace(/\.md$/, "") }));
}

export default async function BlogPostPage({ params }: { params: BlogPageParams }) {
  const resolvedParams = await params;
  const post = await getBlogPostBySlug(resolvedParams.slug);
  if (!post) return notFound();

  const { metadata: data, contentHtml: content } = post;

  // Get all blog post slugs for prev/next navigation
  const posts = getSortedBlogPosts(BLOG_POSTS_DIR);
  const { prevPost, nextPost } = getPrevNextPosts(posts, resolvedParams.slug);

  return (
    <main className="max-w-2xl mx-auto py-16 px-4">
      <Link href="/blog" className="text-accent underline text-sm mb-8 inline-block">
        ← Back to Blog
      </Link>      <h1 className="text-3xl font-bold mb-2">{data.title || resolvedParams.slug}</h1>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {data.date && <p className="text-muted text-sm">{formatDate(data.date)}</p>}
          <ShareButton title={data.title || resolvedParams.slug} />
        </div>
      </div>
      {data.tags && Array.isArray(data.tags) && <StaticTagList tags={data.tags} className="mb-8" />}
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
