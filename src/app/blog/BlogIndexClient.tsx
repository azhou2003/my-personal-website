"use client";
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import StaticTagList from "../../components/StaticTagList";
import { accentClassesLight, accentClassesDark } from "../../components/styles/tagColors";
import { useIsDarkMode } from "../../hooks/useIsDarkMode";
import SearchBar from "../../components/SearchBar";
import SortSwitch from "../../components/SortSwitch";
import TypingAnimation from "../../components/TypingAnimation";
import { formatDate } from "../../lib/formatDate";
import type { BlogMeta } from "../../lib/types";
import Tag from "../../components/Tag";
import FadeInSection from "../../components/FadeInSection";

export default function BlogIndexClient({ posts }: { posts: BlogMeta[] }) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [triggerKey, setTriggerKey] = useState(0);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const isDarkMode = useIsDarkMode();

  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap((p) => p.tags))).sort(),
    [posts]
  );

  const filtered = useMemo(
    () =>
      posts
        .filter((p) => {
          const matchesSearch =
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.summary.toLowerCase().includes(search.toLowerCase());
          const matchesTags =
            selectedTags.length === 0 || selectedTags.every((tag) => p.tags.includes(tag));
          return matchesSearch && matchesTags;
        })
        .sort((a, b) => {
          if (sortOrder === "desc") {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          } else {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }
        }),
    [search, selectedTags, posts, sortOrder]
  );

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // When search or selectedTags change, update triggerKey to force re-mount FadeInSection
  useEffect(() => {
    setTriggerKey((k) => k + 1);
  }, [search, selectedTags]);
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16 w-full">      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-8 font-sans">
        <TypingAnimation 
          text="Thinking Out Loud"
          speed={120}
          showCursor={true}
        />
      </h1>
      {/* Search Bar */}
      <div className="flex justify-center mb-8 w-full">
        <SearchBar
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="Search by title or summary..."
        />
      </div>
      {/* Tag Filter */}
      <div className="w-full max-w-2xl mb-8 flex flex-col items-center">
        <div className="flex flex-wrap gap-2 justify-center">
          {allTags.map((tag, i) => (
            <Tag
              key={tag}
              label={tag}
              colorClass={(isDarkMode ? accentClassesDark : accentClassesLight)[i % accentClassesLight.length]}
              onClick={() => handleTagClick(tag)}
              className={selectedTags.includes(tag) ? "ring-2 ring-accent-yellow" : ""}
            />
          ))}
        </div>
      </div>
      {/* Sort Controls */}
      <div className="flex justify-center mb-8 w-full">
        <SortSwitch value={sortOrder} onChange={setSortOrder} />
      </div>
      {/* Blog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {filtered.map((post, idx) => (          <FadeInSection
            key={triggerKey + '-' + post.slug}
            delay={idx * 25}
          >
            <Link
              href={`/blog/${post.slug}`}
              className="group rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-md hover:shadow-2xl transition-all overflow-hidden flex flex-col h-80 transform-gpu hover:scale-105 focus:scale-105 duration-300"
            >
              <div className="relative w-full h-48 bg-[var(--color-card-muted-bg)]">
                {post.image && (
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover object-center"
                  />
                )}
              </div>
              <div className="flex-1 flex flex-col p-4 gap-2">
                <h2 className="text-xl font-bold font-sans group-hover:text-accent-yellow transition-colors text-foreground-light dark:text-foreground-dark">
                  {post.title}
                </h2>
                <StaticTagList tags={post.tags} className="mb-1" />
                <span className="text-xs text-border-light dark:text-border-dark mb-1">
                  {formatDate(post.date)}
                </span>
                <div className="relative flex-1 overflow-hidden">
                  <p className="text-sm text-foreground-light dark:text-foreground-dark mb-2">
                    {post.summary}
                  </p>
                  <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent pointer-events-none" />
                </div>
              </div>
            </Link>
          </FadeInSection>
        ))}
      </div>
    </main>
  );
}
