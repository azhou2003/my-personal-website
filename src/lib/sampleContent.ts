import type { BlogMeta, PortfolioProject } from "./types";

type SampleBlogPost = BlogMeta & { content: string };

const sampleBlogPosts: SampleBlogPost[] = [
  {
    slug: "local-sample-post-01",
    title: "Designing a Faster Morning Workflow",
    date: "2026-01-05",
    tags: ["Productivity", "Workflow"],
    summary: "A lightweight routine that keeps context-switching low and momentum high.",
    image: "/file.svg",
    content:
      "## Why this worked\n\nI grouped similar tasks into one block and protected deep-work time before meetings.\n\n## What changed\n\n- Fewer open tabs\n- Clear start and end rituals\n- Better handoff notes for tomorrow",
  },
  {
    slug: "local-sample-post-02",
    title: "Notes on Building Better Portfolio Case Studies",
    date: "2025-12-18",
    tags: ["Portfolio", "Writing"],
    summary: "Case studies land better when they explain tradeoffs, not just polished screenshots.",
    image: "/file.svg",
    content:
      "## Core idea\n\nShow the problem, constraints, and why one path was chosen over alternatives.\n\n## Include\n\n- Before and after state\n- Measurable outcome\n- What you would improve next",
  },
  {
    slug: "local-sample-post-03",
    title: "How I Scope Side Projects in 30 Minutes",
    date: "2025-11-30",
    tags: ["Planning", "Projects"],
    summary: "A quick checklist to keep side projects realistic and finishable.",
    image: "/file.svg",
    content:
      "## 30-minute scope pass\n\nDefine one user, one outcome, and one success metric. Everything else is optional.\n\n## Output\n\n- A one-sentence goal\n- A one-week milestone\n- A strict no-list",
  },
  {
    slug: "local-sample-post-04",
    title: "Shipping UI Updates Without Breaking Flow",
    date: "2025-11-12",
    tags: ["Frontend", "UX"],
    summary: "Small interface changes feel safer when paired with visual sanity checks.",
    image: "/file.svg",
    content:
      "## Practical guardrails\n\nUse component snapshots, responsive checks, and a release note for each UI pass.\n\n## Result\n\nLess rework and fewer regressions in shared components.",
  },
  {
    slug: "local-sample-post-05",
    title: "A Minimal Personal Analytics Setup",
    date: "2025-10-27",
    tags: ["Analytics", "Privacy"],
    summary: "Track meaningful behavior with simple, privacy-friendly events.",
    image: "/file.svg",
    content:
      "## Event strategy\n\nCapture only interactions that answer a product question. Ignore vanity metrics.\n\n## Starter events\n\n- Primary CTA clicks\n- Blog reading depth\n- Contact conversion path",
  },
  {
    slug: "local-sample-post-06",
    title: "What I Learned Refactoring Legacy Components",
    date: "2025-10-11",
    tags: ["Refactor", "React"],
    summary: "Incremental refactors beat big rewrites when timelines are tight.",
    image: "/file.svg",
    content:
      "## Approach\n\nRefactor one boundary at a time and preserve behavior before improving internals.\n\n## Rule of thumb\n\nIf users cannot tell, you are doing it right.",
  },
  {
    slug: "local-sample-post-07",
    title: "Making Technical Writing More Skimmable",
    date: "2025-09-23",
    tags: ["Writing", "Docs"],
    summary: "Better headings and tighter paragraphs make dense topics easier to scan.",
    image: "/file.svg",
    content:
      "## Skimmability checklist\n\nShort sections, concrete examples, and clear action verbs.\n\n## Anti-pattern\n\nWalls of text without navigation cues.",
  },
  {
    slug: "local-sample-post-08",
    title: "A Quick Accessibility Pass for Portfolio Sites",
    date: "2025-09-02",
    tags: ["Accessibility", "Frontend"],
    summary: "A short QA pass catches most common accessibility misses.",
    image: "/file.svg",
    content:
      "## Fast checks\n\nTest keyboard navigation, heading order, focus visibility, and image alt text.\n\n## Bonus\n\nReadability improves for everyone, not just assistive-tech users.",
  },
  {
    slug: "local-sample-post-09",
    title: "Choosing Between Polish and New Features",
    date: "2025-08-19",
    tags: ["Product", "Decision Making"],
    summary: "A simple framework to decide whether to refine or expand.",
    image: "/file.svg",
    content:
      "## Decision frame\n\nIf onboarding is weak, improve polish. If retention is strong, add one new capability.\n\n## Keep it measurable\n\nChoose one KPI and review after two weeks.",
  },
  {
    slug: "local-sample-post-10",
    title: "Reducing Build-Time Surprises",
    date: "2025-08-01",
    tags: ["Build", "Next.js"],
    summary: "A pre-merge checklist that catches static generation and env issues early.",
    image: "/file.svg",
    content:
      "## Checklist\n\nRun lint, run production build, and validate critical routes locally.\n\n## Outcome\n\nFewer release-day surprises and easier debugging.",
  },
];

const sampleProjects: PortfolioProject[] = [
  {
    title: "Local Sample: Garden Journal App",
    description: "Track planting schedules, watering reminders, and harvest notes.",
    date: "2026-01-10",
    tags: ["React", "UX", "Productivity"],
    images: ["/file.svg"],
    link: "https://example.com/local-sample-1",
  },
  {
    title: "Local Sample: Reading Tracker",
    description: "Log books, highlights, and completion trends with lightweight filters.",
    date: "2025-12-22",
    tags: ["TypeScript", "Data Viz"],
    images: ["/file.svg"],
    link: "https://example.com/local-sample-2",
  },
  {
    title: "Local Sample: Habit Heatmap",
    description: "Visualize daily consistency with streaks and trend summaries.",
    date: "2025-12-08",
    tags: ["Analytics", "UI"],
    images: ["/file.svg"],
    link: "https://example.com/local-sample-3",
  },
  {
    title: "Local Sample: Indie Launch Checklist",
    description: "Plan launch tasks, dependencies, and rollout notes in one place.",
    date: "2025-11-24",
    tags: ["Workflow", "Planning"],
    images: ["/file.svg"],
    link: "https://example.com/local-sample-4",
  },
  {
    title: "Local Sample: Cafe Finder",
    description: "Search laptop-friendly cafes by noise level, seating, and wifi quality.",
    date: "2025-11-06",
    tags: ["Maps", "Frontend"],
    images: ["/file.svg"],
    link: "https://example.com/local-sample-5",
  },
  {
    title: "Local Sample: Focus Session Timer",
    description: "Run timed sessions with ambient themes and progress tracking.",
    date: "2025-10-21",
    tags: ["Productivity", "React"],
    images: ["/file.svg"],
    link: "https://example.com/local-sample-6",
  },
  {
    title: "Local Sample: Home Budget Snapshot",
    description: "Categorize spending and forecast monthly burn with simple charts.",
    date: "2025-10-03",
    tags: ["Finance", "Charts"],
    images: ["/file.svg"],
    link: "https://example.com/local-sample-7",
  },
  {
    title: "Local Sample: Weekly Meal Planner",
    description: "Plan meals, generate shopping lists, and reuse favorite templates.",
    date: "2025-09-17",
    tags: ["Planner", "TypeScript"],
    images: ["/file.svg"],
    link: "https://example.com/local-sample-8",
  },
  {
    title: "Local Sample: Event RSVP Dashboard",
    description: "Manage invite lists, reminder cadence, and attendance snapshots.",
    date: "2025-08-29",
    tags: ["Dashboard", "Forms"],
    images: ["/file.svg"],
    link: "https://example.com/local-sample-9",
  },
  {
    title: "Local Sample: Developer Portfolio Audit",
    description: "Scan portfolio pages for broken links, image issues, and metadata gaps.",
    date: "2025-08-10",
    tags: ["Tooling", "Next.js"],
    images: ["/file.svg"],
    link: "https://example.com/local-sample-10",
  },
];

export function shouldIncludeLocalSampleContent(): boolean {
  const override = process.env.LOCAL_SAMPLE_CONTENT;
  if (override === "true") return true;
  if (override === "false") return false;
  return process.env.VERCEL !== "1";
}

export function getSampleBlogPosts(): BlogMeta[] {
  return sampleBlogPosts.map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    tags: post.tags,
    summary: post.summary,
    image: post.image,
  }));
}

export function getSampleBlogPostBySlug(
  slug: string
): { metadata: BlogMeta; content: string } | null {
  const post = sampleBlogPosts.find((item) => item.slug === slug);
  if (!post) return null;
  const { content, ...metadata } = post;
  return {
    metadata,
    content,
  };
}

export function getSampleBlogSlugs(): string[] {
  return sampleBlogPosts.map((post) => post.slug);
}

export function getSampleProjects(): PortfolioProject[] {
  return [...sampleProjects];
}
