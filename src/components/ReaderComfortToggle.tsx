"use client";

import { useEffect, useState } from "react";

const READER_COMFORT_KEY = "readerComfortMode";

function applyReaderComfort(enabled: boolean) {
  document.documentElement.classList.toggle("reader-comfort", enabled);
  document.body.classList.toggle("reader-comfort", enabled);
}

export default function ReaderComfortToggle() {
  const [isComfortMode, setIsComfortMode] = useState(false);

  useEffect(() => {
    const savedPreference = localStorage.getItem(READER_COMFORT_KEY);
    const initialValue = savedPreference === "true";

    setIsComfortMode(initialValue);
    applyReaderComfort(initialValue);
  }, []);

  const toggleComfortMode = () => {
    setIsComfortMode((previous) => {
      const next = !previous;
      localStorage.setItem(READER_COMFORT_KEY, String(next));
      applyReaderComfort(next);
      return next;
    });
  };

  return (
    <button
      type="button"
      onClick={toggleComfortMode}
      className="text-xs text-muted underline decoration-dotted underline-offset-4 transition-colors hover:text-foreground-light dark:hover:text-foreground-dark"
      aria-pressed={isComfortMode}
      aria-label="Toggle reader comfort mode"
    >
      Comfort {isComfortMode ? "on" : "off"}
    </button>
  );
}
