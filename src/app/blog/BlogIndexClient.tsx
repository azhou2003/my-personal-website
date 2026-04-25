"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { SearchBar, SortSwitch, TypingAnimation } from "@/components/ui";
import { accentClasses } from "@/components/ui/styles";
import { Tag } from "@/components/ui/tags";
import { BlogPostGrid } from "@/features/blog/components";
import type { BlogMeta } from "@/lib/types";

interface BlogIndexClientProps {
  posts: BlogMeta[];
}

const MAX_VISIBLE_TAGS = 10;

function getTagFrequency(posts: BlogMeta[]) {
  const freq: Record<string, number> = {};
  posts.forEach((post) => {
    if (!Array.isArray(post.tags)) return;
    post.tags.forEach((tag) => {
      freq[tag] = (freq[tag] || 0) + 1;
    });
  });
  return freq;
}

export default function BlogIndexClient({ posts }: BlogIndexClientProps) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [triggerKey, setTriggerKey] = useState(0);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [showAllTags, setShowAllTags] = useState(false);
  const normalizedSearch = search.trim().toLowerCase();
  const tagFrequency = useMemo(() => getTagFrequency(posts), [posts]);

  const allTags = useMemo(
    () =>
      Array.from(new Set(posts.flatMap((post) => post.tags))).sort((a, b) => {
        if (tagFrequency[b] !== tagFrequency[a]) return tagFrequency[b] - tagFrequency[a];
        return a.localeCompare(b);
      }),
    [posts, tagFrequency]
  );

  const visibleTags = useMemo(
    () => (showAllTags ? allTags : allTags.slice(0, MAX_VISIBLE_TAGS)),
    [allTags, showAllTags]
  );

  const filteredPosts = useMemo(
    () =>
      posts
        .filter((post) => {
          const matchesSearch =
            post.title.toLowerCase().includes(normalizedSearch) ||
            post.summary.toLowerCase().includes(normalizedSearch);
          const matchesTags =
            selectedTags.length === 0 || selectedTags.every((tag) => post.tags.includes(tag));
          return matchesSearch && matchesTags;
        })
        .sort((a, b) => {
          if (sortOrder === "desc") {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          }
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }),
    [posts, normalizedSearch, selectedTags, sortOrder]
  );

  useEffect(() => {
    setTriggerKey((prev) => prev + 1);
  }, [search, selectedTags]);

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((entry) => entry !== tag) : [...prev, tag]
    );
  };

  const hasActiveFilters = search.length > 0 || selectedTags.length > 0;

  const handleClearFilters = () => {
    setSearch("");
    setSelectedTags([]);
  };

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16 w-full">
      <p className="section-kicker text-center mb-2">My Blog</p>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-8 font-sans">
        <TypingAnimation text="Thinking Out Loud" speed={42} showCursor />
      </h1>

      <div className="flex justify-center mb-8 w-full">
        <div className="relative w-full max-w-md">
          <SearchBar
            value={search}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
            placeholder="Search by title or summary..."
            className="pr-10"
          />
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              aria-label="Clear search and selected tags"
              className="absolute inset-y-0 right-2 my-auto h-8 w-8 inline-flex items-center justify-center rounded-full text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-yellow"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="w-full max-w-3xl mb-8 flex flex-col items-center gap-3">
        <div className="w-full flex flex-wrap gap-2 justify-center">
          {visibleTags.map((tag, index) => (
            <Tag
              key={tag}
              label={tag}
              colorClass={accentClasses[index % accentClasses.length]}
              onClick={() => handleTagClick(tag)}
              pressed={selectedTags.includes(tag)}
              className={selectedTags.includes(tag) ? "ring-2 ring-accent-yellow" : ""}
            >
              {`${tag}: ${tagFrequency[tag]}`}
            </Tag>
          ))}
        </div>

        {allTags.length > MAX_VISIBLE_TAGS && (
          <button
            type="button"
            onClick={() => setShowAllTags((prev) => !prev)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-text-secondary/40 text-text-secondary hover:text-text-primary hover:border-text-primary/50 transition-colors"
          >
            {showAllTags ? "Show fewer tags" : `Show ${allTags.length - MAX_VISIBLE_TAGS} more tags`}
          </button>
        )}
      </div>

      <div className="flex justify-center mb-8 w-full">
        <SortSwitch value={sortOrder} onChange={setSortOrder} />
      </div>

      <BlogPostGrid posts={filteredPosts} triggerKey={triggerKey} />
    </main>
  );
}
