"use client";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Image from "next/image";
import { PortfolioProject } from "../../lib/portfolio";
import { useState, useMemo, useEffect } from "react";
import Tag from "../../components/Tag";

// Accent classes for timeline tags (always light mode)
const accentClasses = [
  "bg-[#b7c7a3]/70 text-[#4b5d3a] border-[#b7c7a3]",
  "bg-[#ffe066]/70 text-[#a68c1d] border-[#ffe066]",
  "bg-[#ffb385]/70 text-[#a65c1d] border-[#ffb385]",
];
// Accent classes for popup tags (light/dark mode, using Tailwind palette for dark mode)
const popupAccentClasses = [
  "bg-[#b7c7a3]/70 text-[#4b5d3a] border-[#b7c7a3] dark:bg-accent-sage dark:text-foreground-dark dark:border-accent-sage",
  "bg-[#ffe066]/70 text-[#a68c1d] border-[#ffe066] dark:bg-accent-yellow dark:text-[#23201c] dark:border-accent-yellow",
  "bg-[#ffb385]/70 text-[#a65c1d] border-[#ffb385] dark:bg-accent-orange dark:text-[#23201c] dark:border-accent-orange",
];

async function loadProjects(): Promise<PortfolioProject[]> {
  // List of all project JSON files (add new files here as needed)
  const files = [
    "personal-portfolio-website.json",
    "cybersecurity-dashboard.json",
    "counter-strike-match-analyzer.json",
    "blog-platform.json",
  ];
  const modules = await Promise.all(
    files.map((file) => import(`../../data/${file}`))
  );
  return modules.map((mod) => mod.default as PortfolioProject);
}

function getTagFrequency(projects: PortfolioProject[]) {
  const freq: Record<string, number> = {};
  projects.forEach((p) => {
    p.tags.forEach((tag) => {
      freq[tag] = (freq[tag] || 0) + 1;
    });
  });
  return freq;
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    loadProjects().then(setProjects);
  }, []);

  const allTags = useMemo(() => {
    // Sort tags by frequency (desc), then alphabetically
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
        const matchesTag =
          !selectedTag || p.tags.includes(selectedTag);
        return matchesSearch && matchesTag;
      }),
    [search, selectedTag, projects]
  );

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark transition-colors">
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
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={selectedTag === tag ? "ring-2 ring-accent-yellow" : ""}
              />
            ))}
          </div>
        </div>
        {/* Project Timeline */}
        <div className="relative w-full max-w-4xl mx-auto py-16 flex justify-center">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 h-full w-1 bg-[#23201c] dark:bg-[#ece7d5] -translate-x-1/2 z-0" aria-hidden="true" />
          <div className="flex flex-col gap-24 w-full relative z-10">
            {filtered.length === 0 && (
              <div className="text-center text-border-light dark:text-border-dark">
                No projects found.
              </div>
            )}
            {filtered.map((project, idx) => {
              const isLeft = idx % 2 === 0;
              return (
                <div key={idx} className="relative flex items-center min-h-[180px]">
                  {/* Timeline node */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <div className="w-6 h-6 rounded-full bg-accent-yellow border-4 border-[#23201c] dark:border-[#ece7d5] shadow-lg" />
                  </div>
                  {/* Left side */}
                  <div className="w-1/2 flex justify-end pr-4 pl-4">
                    {isLeft ? (
                      <span className="text-xs text-border-light dark:text-border-dark font-mono select-none whitespace-nowrap">
                        {new Date(project.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    ) : (
                      <div className="flex justify-end relative w-full">
                        <div className="group relative flex items-center justify-center">
                          <img
                            src={project.images[0] || "/file.svg"}
                            alt={project.title}
                            className="w-32 h-32 object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-110 group-focus-within:scale-110 cursor-pointer z-10"
                            tabIndex={0}
                          />
                          {/* Expanding Popup (expands outwards, not stacked) */}
                          <div
                            className="absolute top-1/2 right-full mr-4 origin-right -translate-y-1/2 min-w-[280px] max-w-sm bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl shadow-2xl p-6 opacity-0 scale-x-75 group-hover:opacity-100 group-hover:scale-x-100 group-focus-within:opacity-100 group-focus-within:scale-x-100 pointer-events-auto transition-all duration-300 z-30 flex flex-col items-center"
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
                            <div className="flex gap-4 mt-2">
                              {project.github && (
                                <a
                                  href={project.github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline text-accent-sage hover:text-accent-yellow"
                                >
                                  GitHub
                                </a>
                              )}
                              {project.demo && project.demo !== "" && (
                                <a
                                  href={project.demo}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline text-accent-yellow hover:text-accent-sage"
                                >
                                  Live Demo
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Right side */}
                  <div className="w-1/2 flex justify-start pl-4 pr-4">
                    {isLeft ? (
                      <div className="flex justify-start relative w-full">
                        <div className="group relative flex items-center justify-center">
                          <img
                            src={project.images[0] || "/file.svg"}
                            alt={project.title}
                            className="w-32 h-32 object-cover rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-110 group-focus-within:scale-110 cursor-pointer z-10"
                            tabIndex={0}
                          />
                          {/* Expanding Popup (expands outwards, not stacked) */}
                          <div className="absolute top-1/2 left-full ml-4 origin-left -translate-y-1/2 min-w-[280px] max-w-sm bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl shadow-2xl p-6 opacity-0 scale-x-75 group-hover:opacity-100 group-hover:scale-x-100 group-focus-within:opacity-100 group-focus-within:scale-x-100 pointer-events-auto transition-all duration-300 z-30 flex flex-col items-center">
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
                            <div className="flex gap-4 mt-2">
                              {project.github && (
                                <a
                                  href={project.github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline text-accent-sage hover:text-accent-yellow"
                                >
                                  GitHub
                                </a>
                              )}
                              {project.demo && project.demo !== "" && (
                                <a
                                  href={project.demo}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline text-accent-yellow hover:text-accent-sage"
                                >
                                  Live Demo
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-border-light dark:text-border-dark font-mono select-none whitespace-nowrap">
                        {new Date(project.date).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
