"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

interface BlogMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  image?: string;
}

const accentClasses = [
  "bg-[#b7c7a3]/70 text-[#4b5d3a] border-[#b7c7a3]", // sage
  "bg-[#ffe066]/70 text-[#a68c1d] border-[#ffe066]", // yellow
  "bg-[#ffb385]/70 text-[#a65c1d] border-[#ffb385]", // orange
];

export default function BlogIndexClient({ posts }: { posts: BlogMeta[] }) {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap((p) => p.tags))).sort(),
    [posts]
  );

  const filtered = useMemo(
    () =>
      posts.filter((p) => {
        const matchesSearch =
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.summary.toLowerCase().includes(search.toLowerCase());
        const matchesTag = !selectedTag || p.tags.includes(selectedTag);
        return matchesSearch && matchesTag;
      }),
    [search, selectedTag, posts]
  );

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16 w-full">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 font-sans">Blog</h1>
      {/* Centered Search Bar */}
      <div className="flex justify-center mb-8 w-full">
        <input
          type="text"
          placeholder="Search by title or summary..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded border border-border-light bg-white text-base focus:outline-none"
        />
      </div>
      {/* Tag Filter */}
      <div className="w-full max-w-2xl mb-8 flex flex-col items-center">
        <div className="flex flex-wrap gap-2 justify-center">
          {allTags.map((tag, i) => (
            <button
              key={tag}
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors focus:outline-none flex items-center justify-center
                ${accentClasses[i % accentClasses.length]}
                ${selectedTag === tag ? 'ring-2 ring-accent-yellow' : ''}
              `}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      {/* Blog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-4xl">
        {filtered.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-lg border border-border-light bg-white shadow hover:shadow-lg transition-all overflow-hidden flex flex-col"
          >
            <div className="relative w-full h-48 bg-gray-100">
              {post.image && (
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-contain object-center"
                />
              )}
            </div>
            <div className="flex-1 flex flex-col p-4 gap-2">
              <h2 className="text-xl font-bold font-sans group-hover:text-accent-yellow transition-colors">
                {post.title}
              </h2>
              <div className="flex flex-wrap gap-2 mb-1">
                {post.tags.map((tag, i) => (
                  <span
                    key={i}
                    className={`px-2 py-1 rounded-full border text-xs font-medium ${accentClasses[i % accentClasses.length]}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="text-xs text-border-light mb-1">
                {new Date(post.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <p className="text-sm text-foreground-light/80 mb-2 line-clamp-2">
                {post.summary}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
