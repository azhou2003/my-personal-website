"use client";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Image from "next/image";
import { PortfolioProject } from "../../lib/portfolio";
import { useState, useMemo, useEffect } from "react";

const accentClasses = [
  "bg-[#b7c7a3]/70 text-[#4b5d3a] border-[#b7c7a3]", // sage
  "bg-[#ffe066]/70 text-[#a68c1d] border-[#ffe066]", // yellow
  "bg-[#ffb385]/70 text-[#a65c1d] border-[#ffb385]", // orange
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

  const allTags = useMemo(
    () => Array.from(new Set(projects.flatMap((p) => p.tags))).sort(),
    [projects]
  );

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
            className="w-full max-w-md px-4 py-2 rounded border border-border-light dark:border-border-dark bg-white dark:bg-background-dark/80 text-base focus:outline-none"
          />
        </div>
        {/* Frequency Widget (now used for tag filtering) */}
        <div className="w-full max-w-2xl mb-8 flex flex-col items-center">
          <div className="flex flex-wrap gap-2 justify-center">
            {allTags.map((tag, i) => (
              <button
                key={tag}
                className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors focus:outline-none flex items-center justify-center
                  ${accentClasses[i % accentClasses.length]}
                  ${selectedTag === tag ? 'ring-2 ring-accent-yellow' : ''}
                `}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                {tag}: {tagFrequency[tag]}
              </button>
            ))}
          </div>
        </div>
        {/* Project List */}
        <div className="flex flex-col gap-12 w-full max-w-2xl">
          {filtered.length === 0 && (
            <div className="text-center text-border-light dark:text-border-dark">
              No projects found.
            </div>
          )}
          {filtered.map((project, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row items-center gap-6 bg-white/70 dark:bg-background-dark/80 rounded-lg shadow p-6 border border-border-light dark:border-border-dark transition-colors"
            >
              <div className="flex-shrink-0">
                <Image
                  src={project.images[0] || "/file.svg"}
                  alt={project.title}
                  width={120}
                  height={120}
                  className="rounded border border-border-light dark:border-border-dark object-cover"
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <h2 className="text-xl font-semibold font-sans mb-1">
                  {project.title}
                </h2>
                <span className="text-sm text-border-light dark:text-border-dark mb-2">
                  {new Date(project.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <p className="text-base mb-2">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-2 justify-center">
                  {project.tags.map((tag, i) => (
                    <span
                      key={i}
                      className={`px-2 py-1 rounded-full border text-xs font-medium transition-colors flex items-center justify-center ${accentClasses[i % accentClasses.length]}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
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
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
