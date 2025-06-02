"use client";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { PortfolioProject } from "../../lib/portfolio";
import { useState, useMemo, useRef, useEffect } from "react";
import Tag from "../../components/Tag";

const accentClasses = [
  "bg-[#b7c7a3]/70 text-[#4b5d3a] border-[#b7c7a3]",
  "bg-[#ffe066]/70 text-[#a68c1d] border-[#ffe066]",
  "bg-[#ffb385]/70 text-[#a65c1d] border-[#ffb385]",
];
const popupAccentClasses = [
  "bg-[#b7c7a3]/70 text-[#4b5d3a] border-[#b7c7a3] dark:bg-accent-sage dark:text-foreground-dark dark:border-accent-sage",
  "bg-[#ffe066]/70 text-[#a68c1d] border-[#ffe066] dark:bg-accent-yellow dark:text-[#23201c] dark:border-accent-yellow",
  "bg-[#ffb385]/70 text-[#a65c1d] border-[#ffb385] dark:bg-accent-orange dark:text-[#23201c] dark:border-accent-orange",
];

function getTagFrequency(projects: PortfolioProject[]) {
  const freq: Record<string, number> = {};
  projects.forEach((p) => {
    p.tags.forEach((tag) => {
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
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [scrollDir, delay, hasLoaded]);

  return (
    <div
      ref={ref}
      className="opacity-0 translate-y-8 transition-all duration-700 will-change-transform"
    >
      {children}
    </div>
  );
}

export default function PortfolioClient({ projects }: { projects: PortfolioProject[] }) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [triggerKey, setTriggerKey] = useState(0); // For triggering animation on search/tag change

  const allTags = useMemo(() => {
    const freq = getTagFrequency(projects);
    return Array.from(new Set(projects.flatMap((p) => p.tags)))
      .sort((a, b) => {
        if (freq[b] !== freq[a]) return freq[b] - freq[a];
        return a.localeCompare(b);
      });
  }, [projects]);

  const tagFrequency = useMemo(() => getTagFrequency(projects), [projects]);

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        const matchesSearch =
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase());
        const matchesTags =
          selectedTags.length === 0 || selectedTags.every((tag) => p.tags.includes(tag));
        return matchesSearch && matchesTags;
      }),
    [search, selectedTags, projects]
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
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark transition-colors duration-300">
      <Navbar />
      <main className="flex flex-1 flex-col items-center px-4 py-16 w-full">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 font-sans">
          Portfolio
        </h1>
        {/* Centered Search */}
        <div className="flex justify-center mb-8 w-full">
          <input
            type="text"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded border border-border-light dark:border-border-dark bg-white dark:bg-[#23201c] text-[#1a1a1a] dark:text-[#f5f5f5] placeholder:text-border-light dark:placeholder:text-border-dark focus:outline-none"
          />
        </div>
        {/* Frequency Widget (now used for tag filtering) */}
        <div className="w-full max-w-2xl mb-8 flex flex-col items-center">
          <div className="flex flex-wrap gap-2 justify-center">
            {allTags.map((tag, i) => (
              <Tag
                key={tag}
                label={`${tag}: ${tagFrequency[tag]}`}
                colorClass={accentClasses[i % accentClasses.length]}
                onClick={() => handleTagClick(tag)}
                className={selectedTags.includes(tag) ? "ring-2 ring-accent-yellow" : ""}
              />
            ))}
          </div>
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
                <FadeInSection key={triggerKey + '-' + idx} delay={idx * 100}>
                  <div className="relative flex items-center min-h-[180px]">
                    {/* Timeline node */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                      <div className="w-6 h-6 rounded-full bg-accent-yellow border-4 border-[#23201c] dark:border-[#ece7d5] shadow-lg" />
                    </div>
                    {/* Left side */}
                    <div className="w-1/2 flex justify-end pr-10 pl-10">
                      {isLeft ? (
                        <span className="text-base sm:text-lg text-foreground-light dark:text-foreground-dark font-sans select-none whitespace-nowrap">
                          {new Date(project.date).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      ) : (
                        <div className="flex justify-end relative w-full">
                          <div className="group relative flex items-center justify-center">
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="focus:outline-none"
                              tabIndex={0}
                            >
                              <img
                                src={project.images[0] || "/file.svg"}
                                alt={project.title}
                                className="w-[320px] h-[180px] object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-110 group-focus-within:scale-110 cursor-pointer z-10"
                              />
                            </a>
                            {/* Expanding Popup (expands outwards, not stacked) */}
                            <div
                              className="absolute top-1/2 right-full mr-10 origin-right -translate-y-1/2 min-w-[280px] max-w-sm bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl shadow-lg p-6 opacity-0 scale-x-75 group-hover:opacity-100 group-hover:scale-x-100 group-focus-within:opacity-100 group-focus-within:scale-x-100 pointer-events-auto transition-all duration-300 z-30 flex flex-col items-center"
                              tabIndex={-1}
                            >
                              <h2 className="text-lg font-semibold font-sans mb-2 text-foreground-light dark:text-foreground-dark text-center">{project.title}</h2>
                              <div className="flex flex-wrap gap-2 mb-2 justify-center">
                                {project.tags.map((tag, i) => (
                                  <Tag
                                    key={i}
                                    label={tag}
                                    colorClass={popupAccentClasses[i % popupAccentClasses.length]}
                                  />
                                ))}
                              </div>
                              <p className="text-sm mb-2 text-center text-foreground-light dark:text-foreground-dark">{project.description}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Right side */}
                    <div className="w-1/2 flex justify-start pl-10 pr-10">
                      {isLeft ? (
                        <div className="flex justify-start relative w-full">
                          <div className="group relative flex items-center justify-center">
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="focus:outline-none"
                              tabIndex={0}
                            >
                              <img
                                src={project.images[0] || "/file.svg"}
                                alt={project.title}
                                className="w-[320px] h-[180px] object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-110 group-focus-within:scale-110 cursor-pointer z-10"
                              />
                            </a>
                            {/* Expanding Popup (expands outwards, not stacked) */}
                            <div className="absolute top-1/2 left-full ml-10 origin-left -translate-y-1/2 min-w-[280px] max-w-sm bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl shadow-lg p-6 opacity-0 scale-x-75 group-hover:opacity-100 group-hover:scale-x-100 group-focus-within:opacity-100 group-focus-within:scale-x-100 pointer-events-auto transition-all duration-300 z-30 flex flex-col items-center">
                              <h2 className="text-lg font-semibold font-sans mb-2 text-foreground-light dark:text-foreground-dark text-center">{project.title}</h2>
                              <div className="flex flex-wrap gap-2 mb-2 justify-center">
                                {project.tags.map((tag, i) => (
                                  <Tag
                                    key={i}
                                    label={tag}
                                    colorClass={popupAccentClasses[i % popupAccentClasses.length]}
                                  />
                                ))}
                              </div>
                              <p className="text-sm mb-2 text-center text-foreground-light dark:text-foreground-dark">{project.description}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-base sm:text-lg text-foreground-light dark:text-foreground-dark font-sans select-none whitespace-nowrap">
                          {new Date(project.date).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
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
      <Footer />
    </div>
  );
}
