"use client";

import { useEffect, useState } from "react";

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
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-40 rounded-full border border-border-light bg-background-light/90 px-3 py-2 text-xs font-medium text-foreground-light shadow-sm backdrop-blur-sm transition-all dark:border-border-dark dark:bg-background-dark/90 dark:text-foreground-dark ${
        isVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      Top
    </button>
  );
}
