"use client";

import { useEffect, useState } from "react";

function getScrollProgress() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

  if (scrollableHeight <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (window.scrollY / scrollableHeight) * 100));
}

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      setProgress(getScrollProgress());
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-0.5">
      <div
        className="h-full bg-[var(--color-nav-active)] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
