"use client";

import { useEffect, useState } from "react";

type TocItem = {
  id: string;
  text: string;
  level: number;
};

function getHeadings() {
  return Array.from(document.querySelectorAll(".markdown-content h2, .markdown-content h3, .markdown-content h4"))
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
        level: heading.tagName === "H4" ? 4 : heading.tagName === "H3" ? 3 : 2,
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
    <aside className="blog-toc pointer-events-none">
      <div className="blog-toc-panel pointer-events-auto">
        <p className="blog-toc-kicker">On this page</p>
        <nav aria-label="Table of contents" className="blog-toc-nav">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              title={item.text}
              className={`blog-toc-link ${activeId === item.id ? "is-active" : ""} ${
                item.level === 4 ? "is-grandchild" : item.level === 3 ? "is-child" : ""
              }`}
            >
              <span className="blog-toc-link-text">{item.text}</span>
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
