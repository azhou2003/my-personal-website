"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Tag from "../../components/Tag";

interface BlogMeta {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  image?: string;
}

const accentClasses = [
  "bg-[#b7c7a3]/70 text-[#4b5d3a] border-[#b7c7a3]", // sage (light mode only)
  "bg-[#ffe066]/70 text-[#a68c1d] border-[#ffe066]", // yellow (light mode only)
  "bg-[#ffb385]/70 text-[#a65c1d] border-[#ffb385]", // orange (light mode only)
];

function FadeInSection({ children, delay = 0, isInitial = false }: { children: React.ReactNode; delay?: number; isInitial?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef<number>(0);
  const [scrollDir, setScrollDir] = useState<'down' | 'up'>('down');
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrollDir(currentY > lastScrollY.current ? 'down' : 'up');
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            node.classList.add('opacity-100', 'translate-y-0');
            node.classList.remove('opacity-0', 'fade-out-up', 'fade-out-down', 'duration-500');
            setHasLoaded(true);
          }, delay);
        } else {
          node.classList.remove('opacity-100', 'translate-y-0');
          // Use faster fade for scroll-out, slower for initial load/filter
          if (scrollDir === 'down') {
            node.classList.add('opacity-0', 'fade-out-down', hasLoaded ? 'duration-500' : '');
            node.classList.remove('fade-out-up');
          } else {
            node.classList.add('opacity-0', 'fade-out-up', hasLoaded ? 'duration-500' : '');
            node.classList.remove('fade-out-down');
          }
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [scrollDir, delay, hasLoaded]);

  return (
    <div
      ref={ref}
      className={`opacity-0 translate-y-8 transition-all will-change-transform ${isInitial ? 'duration-700' : 'duration-500'}`}
    >
      {children}
    </div>
  );
}

export default function BlogIndexClient({ posts }: { posts: BlogMeta[] }) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [triggerKey, setTriggerKey] = useState(0);

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
        const matchesTags =
          selectedTags.length === 0 || selectedTags.every((tag) => p.tags.includes(tag));
        return matchesSearch && matchesTags;
      }),
    [search, selectedTags, posts]
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
    <main className="flex flex-1 flex-col items-center px-4 py-16 w-full">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 font-sans">
        Blog
      </h1>
      {/* Centered Search Bar */}
      <div className="flex justify-center mb-8 w-full">
        <input
          type="text"
          placeholder="Search by title or summary..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 rounded border border-border-light dark:border-border-dark bg-white dark:bg-[#23201c] text-[#1a1a1a] dark:text-[#f5f5f5] placeholder:text-[#b7c7a3] dark:placeholder:text-[#b7c7a3] focus:outline-none"
        />
      </div>
      {/* Tag Filter */}
      <div className="w-full max-w-2xl mb-8 flex flex-col items-center">
        <div className="flex flex-wrap gap-2 justify-center">
          {allTags.map((tag, i) => (
            <Tag
              key={tag}
              label={tag}
              colorClass={accentClasses[i % accentClasses.length]}
              onClick={() => handleTagClick(tag)}
              className={selectedTags.includes(tag) ? "ring-2 ring-accent-yellow" : ""}
            />
          ))}
        </div>
      </div>
      {/* Blog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {filtered.map((post, idx) => (
          <FadeInSection
            key={triggerKey + '-' + post.slug}
            delay={idx * 40}
            isInitial={true}
          >
            <Link
              href={`/blog/${post.slug}`}
              className="group rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow hover:shadow-lg transition-all overflow-hidden flex flex-col"
            >
              <div className="relative w-full h-48 bg-[#ece7d5] dark:bg-[#23201c]">
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
                <h2 className="text-xl font-bold font-sans group-hover:text-accent-yellow transition-colors text-foreground-light dark:text-foreground-dark">
                  {post.title}
                </h2>
                <div className="flex flex-wrap gap-2 mb-1">
                  {post.tags.map((tag, i) => (
                    <Tag
                      key={i}
                      label={tag}
                      colorClass={accentClasses[i % accentClasses.length]}
                    />
                  ))}
                </div>
                <span className="text-xs text-border-light dark:text-border-dark mb-1">
                  {new Date(post.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <p className="text-sm text-foreground-light dark:text-foreground-dark mb-2 line-clamp-2">
                  {post.summary}
                </p>
              </div>
            </Link>
          </FadeInSection>
        ))}
      </div>
    </main>
  );
}
