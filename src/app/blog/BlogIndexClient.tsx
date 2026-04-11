"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
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
  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileSlug, setActiveMobileSlug] = useState<string | null>(null);
  const [peekHeights, setPeekHeights] = useState<Record<string, number>>({});
  const cardRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const titleRowRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const updateMobileState = () => setIsMobile(mediaQuery.matches);

    updateMobileState();
    mediaQuery.addEventListener("change", updateMobileState);
    return () => mediaQuery.removeEventListener("change", updateMobileState);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setActiveMobileSlug(null);
      return;
    }

    const firstSlug = filtered[0]?.slug ?? null;
    setActiveMobileSlug((prev) => prev ?? firstSlug);
  }, [isMobile, filtered]);

  useEffect(() => {
    if (!isMobile || typeof window === "undefined") return;

    let ticking = false;

    const updateActiveCard = () => {
      const viewportCenterY = window.innerHeight / 2;
      const visibleCards: Array<{ slug: string; rect: DOMRect }> = [];

      for (const post of filtered) {
        const card = cardRefs.current[post.slug];
        if (!card) continue;

        const rect = card.getBoundingClientRect();
        const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
        if (!isVisible) continue;

        visibleCards.push({ slug: post.slug, rect });
      }

      if (visibleCards.length === 0) return;

      const nearBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 20;

      let bestSlug: string | null = null;

      if (nearBottom) {
        bestSlug = visibleCards.reduce((best, current) =>
          current.rect.bottom > best.rect.bottom ? current : best
        ).slug;
      } else {
        let bestDistance = Number.POSITIVE_INFINITY;
        for (const item of visibleCards) {
          const cardCenterY = item.rect.top + item.rect.height / 2;
          const distance = Math.abs(cardCenterY - viewportCenterY);

          if (distance < bestDistance) {
            bestDistance = distance;
            bestSlug = item.slug;
          }
        }
      }

      if (bestSlug) {
        setActiveMobileSlug((prev) => (prev === bestSlug ? prev : bestSlug));
      }
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateActiveCard();
        ticking = false;
      });
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [isMobile, filtered]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const measurePeekHeights = () => {
      const next: Record<string, number> = {};

      for (const post of filtered) {
        const row = titleRowRefs.current[post.slug];
        if (!row) continue;
        next[post.slug] = Math.ceil(row.getBoundingClientRect().height);
      }

      setPeekHeights((prev) => {
        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(next);
        if (prevKeys.length !== nextKeys.length) return next;
        for (const key of nextKeys) {
          if (prev[key] !== next[key]) return next;
        }
        return prev;
      });
    };

    measurePeekHeights();
    const rafId = window.requestAnimationFrame(measurePeekHeights);
    window.addEventListener("resize", measurePeekHeights);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", measurePeekHeights);
    };
  }, [filtered]);

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16 w-full">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-8 font-sans">
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
        {filtered.map((post, idx) => {
          const isActiveOnMobile = isMobile && activeMobileSlug === post.slug;
          const peekHeight = peekHeights[post.slug] ?? 78;
          const panelStyle: CSSProperties = {
            background: "var(--color-blog-panel-bg-tinted)",
            borderTopColor: "var(--color-blog-panel-border-tinted)",
            boxShadow: "var(--color-blog-panel-shadow-tinted)",
          };

          return (
            <FadeInSection
              key={triggerKey + "-" + post.slug}
            delay={idx * 25}
          >
            <Link
              ref={(node) => {
                cardRefs.current[post.slug] = node;
              }}
              href={`/blog/${post.slug}`}
              style={{ borderColor: "var(--color-blog-panel-border-tinted)" }}
              className="group relative block w-full h-80 rounded-lg border bg-background-light dark:bg-background-dark shadow-md hover:shadow-2xl transition-all overflow-hidden transform-gpu sm:hover:scale-[1.02] sm:focus:scale-[1.02] duration-300"
            >
              <div className="absolute inset-0 bg-[var(--color-card-muted-bg)]">
                {post.image && (
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover object-center"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />
              </div>

              <div
                style={{ ...panelStyle, "--peek-height": `${peekHeight}px` } as CSSProperties}
                className={`absolute inset-x-0 bottom-0 border-t transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isActiveOnMobile
                    ? "translate-y-0"
                    : "translate-y-[calc(100%-var(--peek-height))] sm:group-hover:translate-y-0 sm:group-focus-within:translate-y-0"
                }`}
              >
                <div
                  ref={(node) => {
                    titleRowRefs.current[post.slug] = node;
                  }}
                  className="px-4 pt-3 pb-3"
                >
                  <h2 className="text-xl font-bold font-sans text-foreground-light dark:text-foreground-dark leading-tight">
                    {post.title}
                  </h2>
                </div>

                <div
                  className={`px-4 pb-4 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isActiveOnMobile
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 sm:group-focus-within:opacity-100 sm:group-focus-within:translate-y-0"
                  }`}
                >
                  <StaticTagList tags={post.tags} className="mb-1" />
                  <span className="text-xs text-border-light dark:text-border-dark block">
                    {formatDate(post.date)}
                  </span>
                  <p className="text-sm text-foreground-light dark:text-foreground-dark line-clamp-3 mt-1">
                    {post.summary}
                  </p>
                </div>
              </div>
            </Link>
          </FadeInSection>
          );
        })}
      </div>
    </main>
  );
}
