"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type MarkdownContentProps = {
  html: string;
};

type LightboxState = {
  src: string;
  alt: string;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[\u2019']/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function MarkdownContent({ html }: MarkdownContentProps) {
  const articleRef = useRef<HTMLElement | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  useEffect(() => {
    const article = articleRef.current;

    if (!article) {
      return;
    }

    const usedIds = new Map<string, number>();

    article.querySelectorAll("h2, h3, h4").forEach((heading, index) => {
      const headingElement = heading as HTMLElement;
      const text = headingElement.textContent?.trim() || `section-${index + 1}`;
      const baseId = slugify(text) || `section-${index + 1}`;
      const duplicateCount = usedIds.get(baseId) || 0;
      const id = duplicateCount === 0 ? baseId : `${baseId}-${duplicateCount + 1}`;

      usedIds.set(baseId, duplicateCount + 1);
      headingElement.id = id;

      if (headingElement.querySelector(".md-heading-anchor")) {
        return;
      }

      const anchor = document.createElement("a");
      anchor.href = `#${id}`;
      anchor.className = "md-heading-anchor";
      anchor.setAttribute("aria-label", `Link to section: ${text}`);
      anchor.textContent = "#";
      headingElement.appendChild(anchor);
    });

    article.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector(".md-copy-button")) {
        return;
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = "md-copy-button";
      button.setAttribute("data-copy-code", "true");
      button.textContent = "Copy";
      pre.classList.add("md-code-block");
      pre.appendChild(button);
    });

    article.querySelectorAll("img").forEach((image) => {
      image.classList.add("md-zoomable-image");
      image.setAttribute("loading", "lazy");
    });

    const clearFootnoteHighlight = (element: HTMLElement) => {
      window.setTimeout(() => {
        element.classList.remove("md-footnote-highlight");
      }, 1800);
    };

    const handleArticleClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;

      if (!target) {
        return;
      }

      const copyButton = target.closest("button[data-copy-code='true']") as HTMLButtonElement | null;

      if (copyButton) {
        event.preventDefault();
        const codeElement = copyButton.parentElement?.querySelector("code");
        const codeText = codeElement?.textContent || "";

        try {
          await navigator.clipboard.writeText(codeText);
          copyButton.textContent = "Copied";
          window.setTimeout(() => {
            copyButton.textContent = "Copy";
          }, 1200);
        } catch {
          copyButton.textContent = "Failed";
          window.setTimeout(() => {
            copyButton.textContent = "Copy";
          }, 1200);
        }

        return;
      }

      const anchor = target.closest("a") as HTMLAnchorElement | null;

      if (anchor) {
        const href = anchor.getAttribute("href") || "";

        if (href.startsWith("#fn") || href.startsWith("#fnref")) {
          const targetId = href.slice(1);
          const footnoteTarget = document.getElementById(targetId);

          if (footnoteTarget) {
            event.preventDefault();
            footnoteTarget.scrollIntoView({ behavior: "smooth", block: "center" });
            footnoteTarget.classList.add("md-footnote-highlight");
            clearFootnoteHighlight(footnoteTarget);
            history.replaceState(null, "", `#${targetId}`);
          }

          return;
        }
      }

      const image = target.closest("img") as HTMLImageElement | null;

      if (image && !image.closest("a")) {
        const src = image.getAttribute("src");

        if (src) {
          setLightbox({
            src,
            alt: image.getAttribute("alt") || "Expanded image",
          });
        }
      }
    };

    article.addEventListener("click", handleArticleClick);

    return () => {
      article.removeEventListener("click", handleArticleClick);
    };
  }, [html]);

  useEffect(() => {
    if (!lightbox) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightbox(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [lightbox]);

  return (
    <>
      <article
        ref={articleRef}
        className="markdown-content prose max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 rounded-full border border-white/50 bg-black/40 px-3 py-1 text-sm text-white"
            aria-label="Close image preview"
          >
            Close
          </button>
          <Image
            src={lightbox.src}
            alt={lightbox.alt}
            width={1600}
            height={1200}
            className="max-h-[86vh] max-w-[92vw] rounded-md object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
