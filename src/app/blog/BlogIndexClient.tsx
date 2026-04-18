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

export default function BlogIndexClient({ posts }: BlogIndexClientProps) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [triggerKey, setTriggerKey] = useState(0);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const normalizedSearch = search.trim().toLowerCase();

  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap((post) => post.tags))).sort(),
    [posts]
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

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16 w-full">
      <p className="section-kicker text-center mb-2">My Blog</p>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-8 font-sans">
        <TypingAnimation text="Thinking Out Loud" speed={42} showCursor />
      </h1>

      <div className="flex justify-center mb-8 w-full">
        <SearchBar
          value={search}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
          placeholder="Search by title or summary..."
        />
      </div>

      <div className="w-full max-w-2xl mb-8 flex flex-col items-center">
        <div className="flex flex-wrap gap-2 justify-center">
          {allTags.map((tag, index) => (
            <Tag
              key={tag}
              label={tag}
              colorClass={accentClasses[index % accentClasses.length]}
              onClick={() => handleTagClick(tag)}
              pressed={selectedTags.includes(tag)}
              className={selectedTags.includes(tag) ? "ring-2 ring-accent-yellow" : ""}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center mb-8 w-full">
        <SortSwitch value={sortOrder} onChange={setSortOrder} />
      </div>

      <BlogPostGrid posts={filteredPosts} triggerKey={triggerKey} />
    </main>
  );
}
