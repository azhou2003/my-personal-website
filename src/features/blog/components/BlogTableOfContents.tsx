"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";

type TocItem = {
  id: string;
  text: string;
  level: number;
};

type BlogTableOfContentsProps = {
  topLabel?: string;
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

export default function BlogTableOfContents({ topLabel = "Top" }: BlogTableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  const closeToc = () => {
    window.requestAnimationFrame(() => {
      setIsOpen(false);
    });
  };

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
      } else {
        setActiveId("top");
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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeToc();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  if (items.length < 1) {
    return null;
  }

  const tocItems: TocItem[] = [{ id: "top", text: topLabel, level: 2 }, ...items];

  return (
    <>
      <button
        type="button"
        aria-label="Toggle table of contents"
        aria-expanded={isOpen}
        aria-controls="blog-toc-nav"
        className={`blog-toc-mobile-toggle xl:hidden ${isOpen ? "is-open" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <List size={14} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          aria-hidden="true"
          className="blog-toc-overlay xl:hidden"
          onClick={closeToc}
        />
      )}

      <aside className={`blog-toc pointer-events-none ${isOpen ? "is-open" : ""}`}>
        <div className="blog-toc-panel pointer-events-auto">
        <p className="blog-toc-kicker">On this page</p>
          <nav id="blog-toc-nav" aria-label="Table of contents" className="blog-toc-nav">
            {tocItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              title={item.text}
              onClick={closeToc}
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
    </>
  );
}
