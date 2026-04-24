"use client";

import { useEffect, useRef, useState } from "react";

type MarkdownContentProps = {
  html: string;
};

type LightboxState = {
  src: string;
  alt: string;
};

const IMAGE_EXTENSION_PATTERN = /\.(avif|gif|jpe?g|png|svg|webp)$/i;
const VIDEO_EXTENSION_PATTERN = /\.(mp4|ogg|ogv|webm)$/i;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[\u2019']/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

function normalizeComparableUrl(value: string) {
  return value.trim().replace(/\/$/, "");
}

function isBareUrlAnchor(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href") || "";
  const text = anchor.textContent?.trim() || "";

  if (!href || !text) {
    return false;
  }

  return normalizeComparableUrl(href) === normalizeComparableUrl(text);
}

function parseHttpUrl(rawHref: string) {
  try {
    const parsed = new URL(rawHref);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function stripWww(hostname: string) {
  return hostname.replace(/^www\./, "").toLowerCase();
}

function getYouTubeEmbedUrl(rawHref: string) {
  const parsed = parseHttpUrl(rawHref);
  if (!parsed) {
    return null;
  }

  const host = stripWww(parsed.hostname);
  let videoId: string | null = null;

  if (host === "youtu.be") {
    videoId = parsed.pathname.split("/").filter(Boolean)[0] || null;
  } else if (host === "youtube.com" || host === "m.youtube.com") {
    if (parsed.pathname === "/watch") {
      videoId = parsed.searchParams.get("v");
    } else if (parsed.pathname.startsWith("/shorts/") || parsed.pathname.startsWith("/embed/") || parsed.pathname.startsWith("/live/")) {
      videoId = parsed.pathname.split("/").filter(Boolean)[1] || null;
    }
  }

  if (!videoId) {
    return null;
  }

  const cleanId = videoId.replace(/[^a-zA-Z0-9_-]/g, "");
  if (!cleanId) {
    return null;
  }

  return `https://www.youtube.com/embed/${cleanId}`;
}

function isDirectImageUrl(rawHref: string) {
  const parsed = parseHttpUrl(rawHref);
  if (!parsed) {
    return false;
  }

  return IMAGE_EXTENSION_PATTERN.test(parsed.pathname);
}

function isDirectVideoUrl(rawHref: string) {
  const parsed = parseHttpUrl(rawHref);
  if (!parsed) {
    return false;
  }

  return VIDEO_EXTENSION_PATTERN.test(parsed.pathname);
}

function createEmbedContainer() {
  const wrapper = document.createElement("div");
  wrapper.className = "md-embed";
  return wrapper;
}

function replaceParagraphWithEmbed(anchor: HTMLAnchorElement) {
  const paragraph = anchor.parentElement;
  if (!paragraph || paragraph.tagName.toLowerCase() !== "p") {
    return;
  }

  const links = paragraph.querySelectorAll("a");
  if (links.length !== 1 || links[0] !== anchor) {
    return;
  }

  if (paragraph.textContent?.trim() !== anchor.textContent?.trim()) {
    return;
  }

  if (!isBareUrlAnchor(anchor)) {
    return;
  }

  const href = anchor.getAttribute("href") || "";
  const youtubeEmbedUrl = getYouTubeEmbedUrl(href);

  if (youtubeEmbedUrl) {
    const wrapper = createEmbedContainer();
    const iframe = document.createElement("iframe");
    iframe.src = youtubeEmbedUrl;
    iframe.title = "YouTube video embed";
    iframe.className = "md-embed-frame";
    iframe.loading = "lazy";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    wrapper.appendChild(iframe);
    paragraph.replaceWith(wrapper);
    return;
  }

  if (isDirectVideoUrl(href)) {
    const wrapper = createEmbedContainer();
    const video = document.createElement("video");
    video.src = href;
    video.controls = true;
    video.preload = "metadata";
    video.className = "md-embed-video";
    wrapper.appendChild(video);
    paragraph.replaceWith(wrapper);
    return;
  }

  if (isDirectImageUrl(href)) {
    const wrapper = createEmbedContainer();
    const image = document.createElement("img");
    image.src = href;
    image.alt = "Embedded image";
    image.loading = "lazy";
    image.className = "md-embed-image md-zoomable-image";
    wrapper.appendChild(image);
    paragraph.replaceWith(wrapper);
  }
}

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

    article.querySelectorAll("p > a:only-child").forEach((anchorNode) => {
      replaceParagraphWithEmbed(anchorNode as HTMLAnchorElement);
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
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            loading="eager"
            className="max-h-[86vh] max-w-[92vw] rounded-md object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
