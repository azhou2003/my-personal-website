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

  const decreaseFontSize = () => {
    setFontIndex((previous) => {
      const next = Math.max(0, previous - 1);
      const nextScale = FONT_OPTIONS[next];
      localStorage.setItem(FONT_KEY, String(nextScale));
      applyPreferences(nextScale, wideMode);
      return next;
    });
  };

  const increaseFontSize = () => {
    setFontIndex((previous) => {
      const next = Math.min(FONT_OPTIONS.length - 1, previous + 1);
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
    <div className="reader-tools" role="group" aria-label="Reader preferences">
      <span className="reader-tools-label">Reader</span>
      <button
        type="button"
        onClick={decreaseFontSize}
        className="reader-tool-button"
        aria-label="Decrease reader font size"
        disabled={fontIndex === 0}
      >
        A-
      </button>
      <button
        type="button"
        onClick={increaseFontSize}
        className="reader-tool-button"
        aria-label="Increase reader font size"
        disabled={fontIndex === FONT_OPTIONS.length - 1}
      >
        A+
      </button>
      <button
        type="button"
        onClick={toggleWidth}
        aria-pressed={wideMode}
        className={`reader-tool-button reader-tool-measure ${wideMode ? "is-active" : ""}`}
      >
        {wideMode ? "Measure: Wide" : "Measure: Classic"}
      </button>
    </div>
  );
}
