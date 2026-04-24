import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { StaticTagList } from "@/components/ui/tags";
import {
  BackToTopButton,
  BlogTableOfContents,
  MarkdownContent,
  ReaderPreferences,
  ReadingProgress,
} from "@/features/blog/components";
import { formatDate } from "@/lib/formatDate";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/markdown";
import { getPrevNextPosts } from "@/lib/utils";

type BlogPageParams = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: BlogPageParams }): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getBlogPostBySlug(resolvedParams.slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.metadata.title || resolvedParams.slug,
    description: post.metadata.summary || "",
  };
}

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: { params: BlogPageParams }) {
  const resolvedParams = await params;
  const post = await getBlogPostBySlug(resolvedParams.slug);
  if (!post) return notFound();

  const { metadata: data, contentHtml: content, readingTimeMinutes } = post;
  const currentTags = data.tags ?? [];
  const metadataParts = [
    data.date ? `Published ${formatDate(data.date)}` : null,
    data.updated ? `Updated ${formatDate(data.updated)}` : null,
    `${readingTimeMinutes} min read`,
  ].filter((part): part is string => Boolean(part));

  const posts = getAllBlogPosts()
    .map(({ slug, title, date }) => ({ slug, title, date }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const { prevPost, nextPost } = getPrevNextPosts(posts, resolvedParams.slug);

  const relatedPosts = getAllBlogPosts()
    .filter((post) => post.slug !== resolvedParams.slug)
    .map((post) => ({
      post,
      overlap: post.tags.filter((tag) => currentTags.includes(tag)).length,
    }))
    .filter((entry) => entry.overlap > 0)
    .sort((a, b) => {
      if (b.overlap !== a.overlap) {
        return b.overlap - a.overlap;
      }

      return new Date(b.post.date).getTime() - new Date(a.post.date).getTime();
    })
    .slice(0, 2)
    .map((entry) => entry.post);

  return (
    <>
      <ReadingProgress />
      <BackToTopButton />
      <BlogTableOfContents />
      <main className="blog-post-shell mx-auto w-full py-16 px-4">
        <Link href="/blog" className="text-accent underline text-sm mb-8 inline-block">
          <span className="inline-flex items-center gap-1">
            <ArrowLeft size={14} aria-hidden="true" />
            Back to Blog
          </span>
        </Link>
        <header className="blog-post-header">
          <h1 className="blog-post-title text-3xl font-bold">{data.title || resolvedParams.slug}</h1>
          <div className="blog-post-meta-row">
            <div className="blog-post-meta-tools">
              <p className="blog-post-meta text-muted text-sm">{metadataParts.join(" · ")}</p>
            </div>
          </div>
          {data.tags && Array.isArray(data.tags) && <StaticTagList tags={data.tags} className="blog-post-tags" />}
          <div className="blog-post-reader-row">
            <ReaderPreferences />
          </div>
          <div className="blog-post-content-divider" aria-hidden="true" />
        </header>
        <MarkdownContent html={content} />
        {relatedPosts.length > 0 && (
          <section className="blog-related-section mt-14 pt-8">
            <h2 className="mb-4 text-lg font-semibold">Related posts</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="blog-related-card rounded-lg px-4 py-3 text-sm"
                >
                  <p className="font-medium text-foreground-light dark:text-foreground-dark">{related.title}</p>
                  <p className="mt-1 text-xs text-muted">{formatDate(related.date)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
        <div
          className={`flex justify-between items-center mt-16 ${relatedPosts.length === 0 ? "blog-post-pagination-divider pt-8" : ""}`}
        >
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}`}
              className="text-accent underline text-base px-2 py-1 rounded hover:bg-accent-yellow/20 transition-colors"
            >
              <span className="inline-flex items-center gap-1">
                <ArrowLeft size={14} aria-hidden="true" />
                Previous: {prevPost.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {nextPost ? (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="text-accent underline text-base px-2 py-1 rounded hover:bg-accent-yellow/20 transition-colors ml-auto"
            >
              <span className="inline-flex items-center gap-1">
                Next: {nextPost.title}
                <ArrowRight size={14} aria-hidden="true" />
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </main>
    </>
  );
}
