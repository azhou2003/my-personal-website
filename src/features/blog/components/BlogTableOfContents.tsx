"use client";

import { useEffect, useState } from "react";

type TocItem = {
  id: string;
  text: string;
  level: number;
};

function getHeadings() {
  return Array.from(document.querySelectorAll(".markdown-content h2, .markdown-content h3"))
    .map((node) => {
      const heading = node as HTMLElement;
      if (!heading.id) {
        return null;
      }

      const text =
        heading
          .textContent?.replace(/#\s*$/, "")
          .trim() || "";

      if (!text) {
        return null;
      }

      return {
        id: heading.id,
        text,
        level: heading.tagName === "H3" ? 3 : 2,
      } satisfies TocItem;
    })
    .filter((item): item is TocItem => Boolean(item));
}

export default function BlogTableOfContents() {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const refresh = () => {
      setItems(getHeadings());
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const updateActive = () => {
      const visible = items
        .map((item) => ({
          id: item.id,
          top: document.getElementById(item.id)?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY,
        }))
        .filter((item) => Number.isFinite(item.top));

      const candidate = visible
        .filter((item) => item.top <= 160)
        .sort((a, b) => b.top - a.top)[0];

      if (candidate) {
        setActiveId(candidate.id);
      } else if (visible[0]) {
        setActiveId(visible[0].id);
      }
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);

    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [items]);

  if (items.length < 2) {
    return null;
  }

  return (
    <aside className="pointer-events-none fixed right-8 top-28 z-30 hidden w-64 xl:block">
      <div className="pointer-events-auto rounded-xl border border-border-light bg-background-light/90 p-3 shadow-md backdrop-blur-sm dark:border-border-dark dark:bg-background-dark/90">
        <p className="mb-2 text-[0.67rem] uppercase tracking-[0.18em] text-muted">On this page</p>
        <nav aria-label="Table of contents" className="space-y-1">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`block rounded px-2 py-1 text-xs transition-colors ${
                activeId === item.id
                  ? "bg-accent-yellow/25 text-foreground-light dark:text-foreground-dark"
                  : "text-muted hover:text-foreground-light dark:hover:text-foreground-dark"
              } ${item.level === 3 ? "ml-3" : "ml-0"}`}
            >
              {item.text}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
