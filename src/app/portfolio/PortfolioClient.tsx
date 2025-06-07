"use client";
import type { PortfolioProject } from "../../lib/types";
import { useState, useMemo, useRef, useEffect } from "react";
import SearchBar from "../../components/SearchBar";
import { formatDate } from "../../lib/formatDate";
import Image from "next/image";
import SortSwitch from "../../components/SortSwitch";
import { accentClassesLight, accentClassesDark } from "../../components/styles/tagColors";
import { useIsDarkMode } from "../../hooks/useIsDarkMode";
import Tag from "../../components/Tag";
import TagList from "../../components/TagList";
import StaticTagList from "../../components/StaticTagList";

function getTagFrequency(projects: PortfolioProject[]) {
  const freq: Record<string, number> = {};
  projects.forEach((p) => {
    if (!Array.isArray(p.tags)) return;
    p.tags.forEach((tag: string) => {
      freq[tag] = (freq[tag] || 0) + 1;
    });
  });
  return freq;
}

function FadeInSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
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
          // Use faster fade for scroll-out, slower for initial load
          if (scrollDir === 'down') {
            const classes = ['opacity-0', 'fade-out-down'];
            if (hasLoaded) classes.push('duration-500');
            node.classList.add(...classes);
            node.classList.remove('fade-out-up');
          } else {
            const classes = ['opacity-0', 'fade-out-up'];
            if (hasLoaded) classes.push('duration-500');
            node.classList.add(...classes);
            node.classList.remove('fade-out-down');
          }
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [scrollDir, delay, hasLoaded]);
  return (
    <div
      ref={ref}
      className="opacity-0 translate-y-8 transition-all duration-300 will-change-transform"
    >
      {children}
    </div>
  );
}

export default function PortfolioClient({ projects }: { projects: PortfolioProject[] }) {
  const [search, setSearch] = useState("");
  const [triggerKey, setTriggerKey] = useState(0); // For triggering animation on search/tag change
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const isDarkMode = useIsDarkMode();

  const tagFrequency = useMemo(() => getTagFrequency(projects), [projects]);

  const allTags = useMemo(() => {
    return Array.from(new Set(projects.flatMap((p) => p.tags)))
      .sort((a, b) => {
        if (tagFrequency[b] !== tagFrequency[a]) return tagFrequency[b] - tagFrequency[a];
        return a.localeCompare(b);
      });
  }, [projects, tagFrequency]);

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filtered = useMemo(
    () =>
      projects
        .filter((p) => {
          const matchesSearch =
            typeof p.title === 'string' && p.title.toLowerCase().includes(search.toLowerCase()) ||
            typeof p.description === 'string' && p.description.toLowerCase().includes(search.toLowerCase());
          const matchesTags =
            Array.isArray(p.tags) && (selectedTags.length === 0 || selectedTags.every((tag) => p.tags.includes(tag)));
          return matchesSearch && matchesTags;
        })
        .sort((a, b) => {
          if (sortOrder === "desc") {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          } else {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }
        }),
    [search, selectedTags, projects, sortOrder]
  );

  // When search or selectedTags change, update triggerKey to force re-mount FadeInSection
  useEffect(() => {
    setTriggerKey((k) => k + 1);
  }, [search, selectedTags]);  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16 w-full">      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-8 font-sans">
        <span>From </span>
        <span className="relative inline-block">
          <span 
            className={`transition-all duration-500 ease-in-out text-[#ffe066] dark:text-[#ffe066] ${
              sortOrder === "desc" 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 -translate-y-2"
            }`}
            style={{ 
              position: sortOrder === "desc" ? "static" : "absolute",
              left: sortOrder === "desc" ? "auto" : "0"
            }}
          >
            Present
          </span>
          <span 
            className={`transition-all duration-500 ease-in-out text-[#ffb385] dark:text-[#ffb385] ${
              sortOrder === "asc" 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-2"
            }`}
            style={{ 
              position: sortOrder === "asc" ? "static" : "absolute",
              left: sortOrder === "asc" ? "auto" : "0"
            }}
          >
            Past
          </span>
        </span>
        <span> to </span>
        <span className="relative inline-block">
          <span 
            className={`transition-all duration-500 ease-in-out text-[#ffb385] dark:text-[#ffb385] ${
              sortOrder === "desc" 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 translate-y-2"
            }`}
            style={{ 
              position: sortOrder === "desc" ? "static" : "absolute",
              left: sortOrder === "desc" ? "auto" : "0"
            }}
          >
            Past
          </span>
          <span 
            className={`transition-all duration-500 ease-in-out text-[#ffe066] dark:text-[#ffe066] ${
              sortOrder === "asc" 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 -translate-y-2"
            }`}
            style={{ 
              position: sortOrder === "asc" ? "static" : "absolute",
              left: sortOrder === "asc" ? "auto" : "0"
            }}
          >
            Present
          </span>
        </span>
      </h1>
      {/* Search Bar */}
      <div className="flex justify-center mb-8 w-full">
        <SearchBar
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="Search by title or description..."
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
            >
              {`${tag}: ${tagFrequency[tag]}`}
            </Tag>
          ))}
        </div>
      </div>
      {/* Sort Controls */}
      <div className="flex justify-center mb-8 w-full">
        <SortSwitch value={sortOrder} onChange={setSortOrder} />
      </div>
      {/* Project Timeline */}
      <div className="relative w-full max-w-4xl mx-auto py-16 flex justify-center overflow-x-visible">
        {/* Full-height vertical timeline line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-[#23201c] dark:bg-[#ece7d5] -translate-x-1/2 z-0" style={{ minHeight: '100%' }} />
        <div className="flex flex-col gap-24 w-full relative z-10">
          {filtered.length === 0 && (
            <div className="text-center text-border-light dark:text-border-dark">
              No projects found.
            </div>
          )}
          {filtered.map((project, idx) => {
            const isLeft = idx % 2 === 0;
            return (
              <FadeInSection key={triggerKey + '-' + idx} delay={idx * 40}>
                <div className="relative flex items-center min-h-[180px] group">
                  {/* Timeline node */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto">
                    <div className="w-6 h-6 rounded-full border-4 border-[#23201c] dark:border-[#ece7d5] shadow-lg bg-[#23201c] dark:bg-[#ece7d5] transition-transform duration-300 group-hover:scale-125 group-focus:scale-125" />
                  </div>                  {/* Left side */}
                  <div className="w-1/2 flex justify-end pr-4 sm:pr-6 md:pr-8 lg:pr-10 pl-4 sm:pl-6 md:pl-8 lg:pl-10">
                    {isLeft ? (
                      <span
                        className="text-base sm:text-lg text-foreground-light dark:text-foreground-dark font-sans select-none whitespace-nowrap transition-transform duration-300 group-hover:scale-110 group-focus:scale-110"
                      >
                        {formatDate(project.date)}
                      </span>
                    ) : (                      <div className="flex justify-end relative w-full">
                        <div className="group relative flex items-center justify-center">
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="focus:outline-none"                            tabIndex={0}                          >                            <div className="relative w-44 sm:w-48 md:w-56 lg:w-64 xl:w-72 h-26 sm:h-28 md:h-32 lg:h-36 xl:h-40 mx-2 sm:mx-0 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 group-hover:scale-110 group-focus-within:scale-110 cursor-pointer z-10">
                              <Image
                                src={project.images[0] || "/file.svg"}
                                alt={project.title}
                                fill
                                className="object-cover"
                                priority={idx < 2}
                              />
                            </div>
                          </a>
                          {/* Expanding Popup (expands outwards, not stacked) */}                          <div
                            className="absolute top-1/2 right-full mr-10 origin-right -translate-y-1/2 min-w-[280px] max-w-sm bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl shadow-lg p-6 opacity-0 scale-x-75 group-hover:opacity-100 group-hover:scale-x-100 group-focus-within:opacity-100 group-focus-within:scale-x-100 hovered:opacity-100 hovered:scale-x-100 pointer-events-auto transition-all duration-300 z-30 flex flex-col items-center"
                            tabIndex={-1}
                          >
                            <h2 className="text-lg font-semibold font-sans mb-2 text-foreground-light dark:text-foreground-dark text-center">{project.title}</h2>
                            <div className="flex flex-wrap gap-2 mb-2 justify-center">
                              <StaticTagList tags={project.tags} className="mb-2 justify-center" />
                            </div>
                            <p className="text-sm mb-2 text-center text-foreground-light dark:text-foreground-dark">{project.description}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>                  {/* Right side */}
                  <div className="w-1/2 flex justify-start pl-4 sm:pl-6 md:pl-8 lg:pl-10 pr-4 sm:pr-6 md:pr-8 lg:pr-10">
                    {isLeft ? (                      <div className="flex justify-start relative w-full">
                        <div className="group relative flex items-center justify-center">
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="focus:outline-none"                            tabIndex={0}                          >                            <div className="relative w-44 sm:w-48 md:w-56 lg:w-64 xl:w-72 h-26 sm:h-28 md:h-32 lg:h-36 xl:h-40 mx-2 sm:mx-0 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 group-hover:scale-110 group-focus-within:scale-110 cursor-pointer z-10">
                              <Image
                                src={project.images[0] || "/file.svg"}
                                alt={project.title}
                                fill
                                className="object-cover"
                                priority={idx < 2}
                              />
                            </div>
                          </a>                          {/* Expanding Popup (expands outwards, not stacked) */}
                          <div className="absolute top-1/2 left-full ml-10 origin-left -translate-y-1/2 min-w-[280px] max-w-sm bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl shadow-lg p-6 opacity-0 scale-x-75 group-hover:opacity-100 group-hover:scale-x-100 group-focus-within:opacity-100 group-focus-within:scale-x-100 hovered:opacity-100 hovered:scale-x-100 pointer-events-auto transition-all duration-300 z-30 flex flex-col items-center">
                            <h2 className="text-lg font-semibold font-sans mb-2 text-foreground-light dark:text-foreground-dark text-center">{project.title}</h2>
                            <div className="flex flex-wrap gap-2 mb-2 justify-center">
                              <StaticTagList tags={project.tags} className="mb-2 justify-center" />
                            </div>
                            <p className="text-sm mb-2 text-center text-foreground-light dark:text-foreground-dark">{project.description}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-base sm:text-lg text-foreground-light dark:text-foreground-dark font-sans select-none whitespace-nowrap transition-transform duration-300 group-hover:scale-110 group-focus:scale-110"
                        tabIndex={0}
                      >
                        {formatDate(project.date)}
                      </span>
                    )}
                  </div>
                </div>
              </FadeInSection>
            );
          })}
        </div>
      </div>
    </main>
  );
}
