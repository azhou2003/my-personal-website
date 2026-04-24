"use client";

import { useEffect, useState } from "react";

const FONT_KEY = "readerFontScale";
const WIDTH_KEY = "readerProseWidth";
const LINE_HEIGHT_KEY = "readerLineHeight";

const FONT_OPTIONS = [0.95, 1, 1.07];
const LINE_HEIGHT_OPTIONS = [1.65, 1.8, 1.95] as const;
const LINE_HEIGHT_LABELS = ["Compact", "Comfortable", "Spacious"] as const;

function applyPreferences(fontScale: number, wideMode: boolean, lineHeight: number) {
  const root = document.documentElement;
  root.style.setProperty("--reader-font-scale", String(fontScale));
  root.style.setProperty("--blog-prose-max-width", wideMode ? "62rem" : "48rem");
  root.style.setProperty("--reader-line-height", String(lineHeight));
}

export default function ReaderPreferences() {
  const [fontIndex, setFontIndex] = useState(1);
  const [wideMode, setWideMode] = useState(false);
  const [lineHeightIndex, setLineHeightIndex] = useState(1);

  useEffect(() => {
    const savedScale = Number(localStorage.getItem(FONT_KEY));
    const initialIndex = FONT_OPTIONS.findIndex((value) => value === savedScale);
    const safeIndex = initialIndex >= 0 ? initialIndex : 1;
    const savedWide = localStorage.getItem(WIDTH_KEY) === "wide";
    const savedLineHeight = Number(localStorage.getItem(LINE_HEIGHT_KEY));
    const initialLineHeightIndex = LINE_HEIGHT_OPTIONS.findIndex((value) => value === savedLineHeight);
    const safeLineHeightIndex = initialLineHeightIndex >= 0 ? initialLineHeightIndex : 1;

    setFontIndex(safeIndex);
    setWideMode(savedWide);
    setLineHeightIndex(safeLineHeightIndex);
    applyPreferences(FONT_OPTIONS[safeIndex], savedWide, LINE_HEIGHT_OPTIONS[safeLineHeightIndex]);
  }, []);

  const decreaseFontSize = () => {
    setFontIndex((previous) => {
      const next = Math.max(0, previous - 1);
      const nextScale = FONT_OPTIONS[next];
      localStorage.setItem(FONT_KEY, String(nextScale));
      applyPreferences(nextScale, wideMode, LINE_HEIGHT_OPTIONS[lineHeightIndex]);
      return next;
    });
  };

  const increaseFontSize = () => {
    setFontIndex((previous) => {
      const next = Math.min(FONT_OPTIONS.length - 1, previous + 1);
      const nextScale = FONT_OPTIONS[next];
      localStorage.setItem(FONT_KEY, String(nextScale));
      applyPreferences(nextScale, wideMode, LINE_HEIGHT_OPTIONS[lineHeightIndex]);
      return next;
    });
  };

  const toggleWidth = () => {
    setWideMode((previous) => {
      const next = !previous;
      localStorage.setItem(WIDTH_KEY, next ? "wide" : "normal");
      applyPreferences(FONT_OPTIONS[fontIndex], next, LINE_HEIGHT_OPTIONS[lineHeightIndex]);
      return next;
    });
  };

  const cycleLineHeight = () => {
    setLineHeightIndex((previous) => {
      const next = (previous + 1) % LINE_HEIGHT_OPTIONS.length;
      const nextLineHeight = LINE_HEIGHT_OPTIONS[next];
      localStorage.setItem(LINE_HEIGHT_KEY, String(nextLineHeight));
      applyPreferences(FONT_OPTIONS[fontIndex], wideMode, nextLineHeight);
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
      <button
        type="button"
        onClick={cycleLineHeight}
        className="reader-tool-button"
        aria-label="Cycle line spacing"
      >
        Leading: {LINE_HEIGHT_LABELS[lineHeightIndex]}
      </button>
    </div>
  );
}
