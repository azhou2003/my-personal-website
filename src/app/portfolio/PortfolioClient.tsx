"use client";
import type { PortfolioProject } from "@/lib/types";
import { useState, useMemo, useEffect, useRef } from "react";
import { FadeInSection, SearchBar, SortSwitch } from "@/components/ui";
import { accentClasses } from "@/components/ui/styles";
import { StaticTagList, Tag } from "@/components/ui/tags";
import { formatDate } from "@/lib/formatDate";
import Image from "next/image";

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

export default function PortfolioClient({ projects }: { projects: PortfolioProject[] }) {
  const [search, setSearch] = useState("");
  const [triggerKey, setTriggerKey] = useState(0); // For triggering animation on search/tag change
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMobileIndex, setActiveMobileIndex] = useState<number | null>(null);
  const [activeDesktopIndex, setActiveDesktopIndex] = useState<number | null>(null);
  const [timelineScaleByIndex, setTimelineScaleByIndex] = useState<Record<number, number>>({});
  const timelineRowRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const lastScrollYRef = useRef(0);
  const lastSnapAtRef = useRef(0);
  const wheelBurstRef = useRef({ lastTs: 0, accumulated: 0 });
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
    if (typeof document === "undefined" || typeof window === "undefined") return;

    if (isMobile) {
      wheelBurstRef.current.accumulated = 0;
      return;
    }

    const getClosestIndexToViewportCenter = () => {
      const viewportCenterY = window.innerHeight / 2;
      let closestIndex: number | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (let idx = 0; idx < filtered.length; idx += 1) {
        const row = timelineRowRefs.current[idx];
        if (!row) continue;

        const rect = row.getBoundingClientRect();
        const rowCenterY = rect.top + rect.height / 2;
        const distance = Math.abs(rowCenterY - viewportCenterY);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = idx;
        }
      }

      return closestIndex;
    };

    const scrollToIndex = (targetIndex: number) => {
      const targetRow = timelineRowRefs.current[targetIndex];
      if (!targetRow) return;

      const rect = targetRow.getBoundingClientRect();
      const targetCenterY = window.scrollY + rect.top + rect.height / 2;
      const targetTop = targetCenterY - window.innerHeight / 2;
      const maxTop = document.documentElement.scrollHeight - window.innerHeight;
      const clampedTop = Math.max(0, Math.min(targetTop, maxTop));

      window.scrollTo({ top: clampedTop, behavior: "auto" });
      setActiveDesktopIndex(targetIndex);
    };

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 3) return;

      const now = window.performance.now();
      if (now - wheelBurstRef.current.lastTs > 140) {
        wheelBurstRef.current.accumulated = 0;
      }
      wheelBurstRef.current.lastTs = now;
      wheelBurstRef.current.accumulated += event.deltaY;

      let effectiveDelta = 0;
      if (Math.abs(event.deltaY) >= 48) {
        effectiveDelta = event.deltaY;
        wheelBurstRef.current.accumulated = 0;
      } else if (Math.abs(wheelBurstRef.current.accumulated) >= 48) {
        effectiveDelta = wheelBurstRef.current.accumulated;
        wheelBurstRef.current.accumulated = 0;
      }

      if (effectiveDelta === 0) return;
      if (now - lastSnapAtRef.current < 65) return;
      lastSnapAtRef.current = now;

      const currentIndex = activeDesktopIndex ?? getClosestIndexToViewportCenter();
      if (currentIndex === null) return;

      const direction = effectiveDelta > 0 ? 1 : -1;
      const strength = Math.abs(effectiveDelta);
      let step = 1;
      if (strength >= 520) {
        step = 4;
      } else if (strength >= 360) {
        step = 3;
      } else if (strength >= 220) {
        step = 2;
      }

      const unclampedTarget = currentIndex + direction * step;
      const targetIndex = Math.max(0, Math.min(unclampedTarget, filtered.length - 1));
      if (targetIndex === currentIndex) return;

      event.preventDefault();
      scrollToIndex(targetIndex);
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [isMobile, filtered, activeDesktopIndex]);

  useEffect(() => {
    if (!isMobile) {
      setActiveMobileIndex(null);
      return;
    }
    setActiveMobileIndex((prev) => prev ?? (filtered.length > 0 ? 0 : null));
  }, [isMobile, filtered.length]);

  useEffect(() => {
    if (!isMobile || typeof window === "undefined") return;

    let ticking = false;
    lastScrollYRef.current = window.scrollY;

    const updateActiveTimelineItem = () => {
      const currentScrollY = window.scrollY;
      const isScrollingUp = currentScrollY < lastScrollYRef.current;
      lastScrollYRef.current = currentScrollY;

      const visibleRows: Array<{ idx: number; rect: DOMRect }> = [];
      for (let idx = 0; idx < filtered.length; idx += 1) {
        const row = timelineRowRefs.current[idx];
        if (!row) continue;
        const rect = row.getBoundingClientRect();
        const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
        if (!isVisible) continue;
        visibleRows.push({ idx, rect });
      }

      if (visibleRows.length === 0) return;
      if (filtered.length === 0) return;

      const nearTop = currentScrollY <= 20;
      const mobileBottomActivationOffset = 96;
      const nearBottom =
        currentScrollY + window.innerHeight >=
        document.documentElement.scrollHeight - mobileBottomActivationOffset;
      const atAbsoluteBottom =
        currentScrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;

      if ((nearBottom && !isScrollingUp) || atAbsoluteBottom) {
        const lastIndex = filtered.length - 1;
        setActiveMobileIndex((prev) => (prev === lastIndex ? prev : lastIndex));
        return;
      }

      let nextIndex: number;
      if (nearTop) {
        nextIndex = visibleRows.reduce((best, current) =>
          current.rect.top < best.rect.top ? current : best
        ).idx;
      } else {
        const viewportAnchorY = window.innerHeight * (isScrollingUp ? 0.42 : 0.5);
        nextIndex = visibleRows.reduce((best, current) => {
          const bestDistance = Math.abs(best.rect.top + best.rect.height / 2 - viewportAnchorY);
          const currentDistance = Math.abs(current.rect.top + current.rect.height / 2 - viewportAnchorY);
          return currentDistance < bestDistance ? current : best;
        }).idx;
      }

      setActiveMobileIndex((prev) => {
        if (prev === nextIndex) return prev;
        if (prev === null) return nextIndex;

        const viewportAnchorY = window.innerHeight * (isScrollingUp ? 0.42 : 0.5);
        const prevVisible = visibleRows.find((item) => item.idx === prev);
        const nextVisible = visibleRows.find((item) => item.idx === nextIndex);
        if (!prevVisible || !nextVisible) return nextIndex;

        const prevDistance = Math.abs(prevVisible.rect.top + prevVisible.rect.height / 2 - viewportAnchorY);
        const nextDistance = Math.abs(nextVisible.rect.top + nextVisible.rect.height / 2 - viewportAnchorY);
        const switchThreshold = isScrollingUp ? 0 : 8;

        return nextDistance + switchThreshold < prevDistance ? nextIndex : prev;
      });
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateActiveTimelineItem();
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

    let ticking = false;

    const updateTimelineScales = () => {
      const viewportCenterY = window.innerHeight / 2;
      const influenceDistance = window.innerHeight * 0.55;
      const nextScaleByIndex: Record<number, number> = {};
      let closestIndex: number | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (let idx = 0; idx < filtered.length; idx += 1) {
        const row = timelineRowRefs.current[idx];
        if (!row) continue;

        const rect = row.getBoundingClientRect();
        const rowCenterY = rect.top + rect.height / 2;
        const distance = Math.abs(rowCenterY - viewportCenterY);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = idx;
        }
        const normalized = Math.min(distance / influenceDistance, 1);
        const scale = 1.12 - normalized * 0.22;

        nextScaleByIndex[idx] = Number(scale.toFixed(3));
      }

      setTimelineScaleByIndex((prev) => {
        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(nextScaleByIndex);
        if (prevKeys.length !== nextKeys.length) return nextScaleByIndex;
        for (const key of nextKeys) {
          const numericKey = Number(key);
          if (prev[numericKey] !== nextScaleByIndex[numericKey]) return nextScaleByIndex;
        }
        return prev;
      });

      setActiveDesktopIndex((prev) => (prev === closestIndex ? prev : closestIndex));
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateTimelineScales();
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
  }, [filtered]);

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16 w-full">
      <p className="section-kicker text-center mb-2">My Portfolio</p>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-8 font-sans">
        <span>From </span>
        <span className="relative inline-block">
          <span 
            className={`transition-all duration-500 ease-in-out text-[var(--color-portfolio-present)] ${
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
            className={`transition-all duration-500 ease-in-out text-[var(--color-portfolio-past)] ${
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
            className={`transition-all duration-500 ease-in-out text-[var(--color-portfolio-past)] ${
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
            className={`transition-all duration-500 ease-in-out text-[var(--color-portfolio-present)] ${
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
                colorClass={accentClasses[i % accentClasses.length]}
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
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-[var(--color-timeline-line)] -translate-x-1/2 z-0" style={{ minHeight: '100%' }} />
        <div className="flex flex-col gap-24 w-full relative z-10 pb-28 sm:pb-0">
          {filtered.length === 0 && (
            <div className="text-center text-border-light dark:text-border-dark">
              No projects found.
            </div>
          )}
          {filtered.map((project, idx) => {
            const isLeft = idx % 2 === 0;
            const isActiveOnMobile = isMobile && activeMobileIndex === idx;
            const isActiveOnDesktop = !isMobile && activeDesktopIndex === idx;
            const isFocused = isActiveOnMobile || isActiveOnDesktop;
            const rowScale = timelineScaleByIndex[idx] ?? 1;
            const focusedRowScale = isFocused ? rowScale * 1.04 : rowScale;
            const imageSrc = project.images[0] || "/file.svg";
            const isTransparentAsset = /\.(svg|png)(?:\?.*)?$/i.test(imageSrc);
            const imageFitClass = isTransparentAsset
              ? "object-contain p-3"
              : "object-cover";
            const imageContainerRadiusClass = "rounded-lg";
            const stageGlowRadiusClass = "rounded-md";
            const popupVisibilityClass = isActiveOnDesktop
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-75 pointer-events-none sm:group-hover:opacity-100 sm:group-hover:scale-100 sm:group-hover:pointer-events-auto sm:group-focus-within:opacity-100 sm:group-focus-within:scale-100 sm:group-focus-within:pointer-events-auto";

            const popupPositionClass = isLeft
              ? "left-full ml-10 origin-left"
              : "right-full mr-10 origin-right";

            return (
              <FadeInSection key={triggerKey + '-' + idx} delay={idx * 40}>
                <div
                  ref={(node) => {
                    timelineRowRefs.current[idx] = node;
                  }}
                  className="relative flex items-center min-h-[180px] group"
                  style={{
                    transform: `scale(${focusedRowScale})`,
                    transformOrigin: "center center",
                    transition: "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  {/* Timeline node */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto">
                    <div className={`w-6 h-6 rounded-full border-4 border-[var(--color-timeline-line)] shadow-lg bg-[var(--color-timeline-fill)] transition-transform duration-300 group-hover:scale-125 group-focus:scale-125 ${isFocused ? "scale-125" : ""}`} />
                  </div>
                  {/* Left side */}
                  <div className="w-1/2 flex justify-end pr-6 sm:pr-6 md:pr-8 lg:pr-10 pl-6 sm:pl-6 md:pl-8 lg:pl-10">
                    {isLeft ? (
                      <span
                        className={`text-base sm:text-lg text-foreground-light dark:text-foreground-dark font-sans select-none whitespace-nowrap transition-all duration-300 group-hover:scale-110 group-focus:scale-110 ${isFocused ? "scale-110" : ""}`}
                      >
                        {formatDate(project.date, "MMMM yyyy")}
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
                            <div className={`relative w-28 h-20 sm:w-48 sm:h-28 md:w-56 md:h-32 lg:w-64 lg:h-36 xl:w-72 xl:h-40 max-w-full mx-3 sm:mx-0 ${imageContainerRadiusClass} shadow-lg overflow-hidden transition-transform duration-300 group-hover:scale-110 group-focus-within:scale-110 cursor-pointer z-10 ${isFocused ? "scale-110" : ""}`}>
                              {isTransparentAsset && (
                                <>
                                  <div className="absolute inset-0 bg-[var(--color-card-muted-bg)]" aria-hidden="true" />
                                  <div className={`absolute inset-1 ${stageGlowRadiusClass} bg-gradient-to-br from-white/35 to-transparent dark:from-white/6 dark:to-transparent`} aria-hidden="true" />
                                </>
                              )}
                              <Image
                                src={imageSrc}
                                alt={project.title}
                                fill
                                className={`${imageFitClass} z-10`}
                                priority={idx < 2}
                              />
                            </div>
                          </a>
                          <div
                            className={`absolute top-1/2 ${popupPositionClass} -translate-y-1/2 min-w-[240px] max-w-[78vw] sm:min-w-[280px] sm:max-w-sm bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl shadow-lg p-5 sm:p-6 transition-all duration-300 z-30 flex flex-col items-center ${popupVisibilityClass}`}
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
                  </div>
                  {/* Right side */}
                  <div className="w-1/2 flex justify-start pl-6 sm:pl-6 md:pl-8 lg:pl-10 pr-6 sm:pr-6 md:pr-8 lg:pr-10">
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
                            <div className={`relative w-28 h-20 sm:w-48 sm:h-28 md:w-56 md:h-32 lg:w-64 lg:h-36 xl:w-72 xl:h-40 max-w-full mx-3 sm:mx-0 ${imageContainerRadiusClass} shadow-lg overflow-hidden transition-transform duration-300 group-hover:scale-110 group-focus-within:scale-110 cursor-pointer z-10 ${isFocused ? "scale-110" : ""}`}>
                              {isTransparentAsset && (
                                <>
                                  <div className="absolute inset-0 bg-[var(--color-card-muted-bg)]" aria-hidden="true" />
                                  <div className={`absolute inset-1 ${stageGlowRadiusClass} bg-gradient-to-br from-white/35 to-transparent dark:from-white/6 dark:to-transparent`} aria-hidden="true" />
                                </>
                              )}
                              <Image
                                src={imageSrc}
                                alt={project.title}
                                fill
                                className={`${imageFitClass} z-10`}
                                priority={idx < 2}
                              />
                            </div>
                          </a>
                          <div className={`absolute top-1/2 ${popupPositionClass} -translate-y-1/2 min-w-[240px] max-w-[78vw] sm:min-w-[280px] sm:max-w-sm bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl shadow-lg p-5 sm:p-6 transition-all duration-300 z-30 flex flex-col items-center ${popupVisibilityClass}`}>
                            <h2 className="text-lg font-semibold font-sans mb-2 text-foreground-light dark:text-foreground-dark text-center">{project.title}</h2>
                            <div className="flex flex-wrap gap-2 mb-2 justify-center">
                              <StaticTagList tags={project.tags} className="mb-2 justify-center" />
                            </div>
                            <p className="text-sm mb-2 text-center text-foreground-light dark:text-foreground-dark">{project.description}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className={`text-base sm:text-lg text-foreground-light dark:text-foreground-dark font-sans select-none whitespace-nowrap transition-all duration-300 group-hover:scale-110 group-focus:scale-110 ${isFocused ? "scale-110" : ""}`}
                        tabIndex={0}
                      >
                        {formatDate(project.date, "MMMM yyyy")}
                      </span>
                    )}
                  </div>
                </div>
                <div
                  className={`sm:hidden transition-all duration-300 ease-out overflow-hidden ${
                    isActiveOnMobile
                      ? "max-h-64 opacity-100 translate-y-0 mt-3"
                      : "max-h-0 opacity-0 -translate-y-2 mt-0 pointer-events-none"
                  }`}
                >
                  <div className="relative mx-3">
                    <div className="absolute inset-0 rounded-xl bg-[var(--color-bg)] z-20" aria-hidden="true" />
                    <div className="relative z-30 bg-[var(--color-bg)] border border-border-light dark:border-border-dark rounded-xl shadow-lg p-4 flex flex-col items-center">
                    <h2 className="text-base font-semibold font-sans mb-2 text-foreground-light dark:text-foreground-dark text-center">
                      {project.title}
                    </h2>
                    <div className="flex flex-wrap gap-2 mb-2 justify-center">
                      <StaticTagList tags={project.tags} className="mb-2 justify-center" />
                    </div>
                    <p className="text-sm text-center text-foreground-light dark:text-foreground-dark">
                      {project.description}
                    </p>
                    </div>
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
