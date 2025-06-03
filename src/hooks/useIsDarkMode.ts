"use client";

import { useEffect, useState } from "react";

export function useIsDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      if (typeof window !== "undefined") {
        setIsDarkMode(document.documentElement.classList.contains("dark") || document.body.classList.contains("dark"));
      }
    };
    checkDark();
    window.addEventListener("storage", checkDark);
    // Optionally listen for class changes
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => {
      window.removeEventListener("storage", checkDark);
      observer.disconnect();
    };
  }, []);

  return isDarkMode;
}
