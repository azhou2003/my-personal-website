"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

function shouldShowBackToTop() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

  if (scrollableHeight <= 0) {
    return false;
  }

  return window.scrollY / scrollableHeight > 0.3;
}

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(shouldShowBackToTop());
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  return (
    <div
      className="fixed z-40 pointer-events-none"
      style={{
        right:
          "max(calc(env(safe-area-inset-right, 0px) + clamp(1rem, 4vw, 1.75rem)), calc(50vw - (var(--blog-prose-max-width, 48rem) / 2) + 1rem))",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)",
      }}
    >
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={`pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-light/80 bg-background-light/88 text-foreground-light shadow-sm backdrop-blur-sm transition-all dark:border-border-dark/80 dark:bg-background-dark/88 dark:text-foreground-dark ${
          isVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"
        }`}
      >
        <ArrowUp size={13} aria-hidden="true" />
      </button>
    </div>
  );
}
