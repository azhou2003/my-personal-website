"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { SearchBar, SortSwitch } from "@/components/ui";
import { accentClasses } from "@/components/ui/styles";
import { Tag } from "@/components/ui/tags";
import { PortfolioTimeline } from "@/features/portfolio/components";
import type { PortfolioProject } from "@/lib/types";

function getTagFrequency(projects: PortfolioProject[]) {
  const freq: Record<string, number> = {};
  projects.forEach((project) => {
    if (!Array.isArray(project.tags)) return;
    project.tags.forEach((tag: string) => {
      freq[tag] = (freq[tag] || 0) + 1;
    });
  });
  return freq;
}

interface PortfolioClientProps {
  projects: PortfolioProject[];
}

export default function PortfolioClient({ projects }: PortfolioClientProps) {
  const [search, setSearch] = useState("");
  const [triggerKey, setTriggerKey] = useState(0);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const tagFrequency = useMemo(() => getTagFrequency(projects), [projects]);

  const allTags = useMemo(
    () =>
      Array.from(new Set(projects.flatMap((project) => project.tags))).sort((a, b) => {
        if (tagFrequency[b] !== tagFrequency[a]) return tagFrequency[b] - tagFrequency[a];
        return a.localeCompare(b);
      }),
    [projects, tagFrequency]
  );

  const filteredProjects = useMemo(
    () =>
      projects
        .filter((project) => {
          const matchesSearch =
            (typeof project.title === "string" &&
              project.title.toLowerCase().includes(search.toLowerCase())) ||
            (typeof project.description === "string" &&
              project.description.toLowerCase().includes(search.toLowerCase()));

          const matchesTags =
            Array.isArray(project.tags) &&
            (selectedTags.length === 0 || selectedTags.every((tag) => project.tags.includes(tag)));

          return matchesSearch && matchesTags;
        })
        .sort((a, b) => {
          if (sortOrder === "desc") {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          }
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }),
    [projects, search, selectedTags, sortOrder]
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
      <p className="section-kicker text-center mb-2">My Portfolio</p>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-8 font-sans">
        <span>From </span>
        <span className="relative inline-block">
          <span
            className={`transition-all duration-500 ease-in-out text-[var(--color-portfolio-present)] ${
              sortOrder === "desc" ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            }`}
            style={{
              position: sortOrder === "desc" ? "static" : "absolute",
              left: sortOrder === "desc" ? "auto" : "0",
            }}
          >
            Present
          </span>
          <span
            className={`transition-all duration-500 ease-in-out text-[var(--color-portfolio-past)] ${
              sortOrder === "asc" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
            style={{
              position: sortOrder === "asc" ? "static" : "absolute",
              left: sortOrder === "asc" ? "auto" : "0",
            }}
          >
            Past
          </span>
        </span>
        <span> to </span>
        <span className="relative inline-block">
          <span
            className={`transition-all duration-500 ease-in-out text-[var(--color-portfolio-past)] ${
              sortOrder === "desc" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
            style={{
              position: sortOrder === "desc" ? "static" : "absolute",
              left: sortOrder === "desc" ? "auto" : "0",
            }}
          >
            Past
          </span>
          <span
            className={`transition-all duration-500 ease-in-out text-[var(--color-portfolio-present)] ${
              sortOrder === "asc" ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            }`}
            style={{
              position: sortOrder === "asc" ? "static" : "absolute",
              left: sortOrder === "asc" ? "auto" : "0",
            }}
          >
            Present
          </span>
        </span>
      </h1>

      <div className="flex justify-center mb-8 w-full">
        <SearchBar
          value={search}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
          placeholder="Search by title or description..."
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
              className={selectedTags.includes(tag) ? "ring-2 ring-accent-yellow" : ""}
            >
              {`${tag}: ${tagFrequency[tag]}`}
            </Tag>
          ))}
        </div>
      </div>

      <div className="flex justify-center mb-8 w-full">
        <SortSwitch value={sortOrder} onChange={setSortOrder} />
      </div>

      <PortfolioTimeline projects={filteredProjects} triggerKey={triggerKey} />
    </main>
  );
}
