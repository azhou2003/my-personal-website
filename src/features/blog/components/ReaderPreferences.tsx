"use client";

import { useEffect, useState } from "react";

const FONT_KEY = "readerFontScale";
const WIDTH_KEY = "readerProseWidth";

const FONT_OPTIONS = [0.95, 1, 1.07];

function applyPreferences(fontScale: number, wideMode: boolean) {
  document.documentElement.style.setProperty("--reader-font-scale", String(fontScale));
  document.documentElement.style.setProperty("--blog-prose-max-width", wideMode ? "62rem" : "48rem");
}

export default function ReaderPreferences() {
  const [fontIndex, setFontIndex] = useState(1);
  const [wideMode, setWideMode] = useState(false);

  useEffect(() => {
    const savedScale = Number(localStorage.getItem(FONT_KEY));
    const initialIndex = FONT_OPTIONS.findIndex((value) => value === savedScale);
    const safeIndex = initialIndex >= 0 ? initialIndex : 1;
    const savedWide = localStorage.getItem(WIDTH_KEY) === "wide";

    setFontIndex(safeIndex);
    setWideMode(savedWide);
    applyPreferences(FONT_OPTIONS[safeIndex], savedWide);
  }, []);

  const cycleFontSize = () => {
    setFontIndex((previous) => {
      const next = (previous + 1) % FONT_OPTIONS.length;
      const nextScale = FONT_OPTIONS[next];
      localStorage.setItem(FONT_KEY, String(nextScale));
      applyPreferences(nextScale, wideMode);
      return next;
    });
  };

  const toggleWidth = () => {
    setWideMode((previous) => {
      const next = !previous;
      localStorage.setItem(WIDTH_KEY, next ? "wide" : "normal");
      applyPreferences(FONT_OPTIONS[fontIndex], next);
      return next;
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={cycleFontSize}
        className="rounded-md border border-border-light px-2 py-1 text-[0.72rem] text-muted transition-colors hover:text-foreground-light dark:border-border-dark dark:hover:text-foreground-dark"
        aria-label="Cycle reader font size"
      >
        Aa
      </button>
      <button
        type="button"
        onClick={toggleWidth}
        aria-pressed={wideMode}
        className="rounded-md border border-border-light px-2 py-1 text-[0.72rem] text-muted transition-colors hover:text-foreground-light dark:border-border-dark dark:hover:text-foreground-dark"
      >
        {wideMode ? "Width: Wide" : "Width: Normal"}
      </button>
    </div>
  );
}
