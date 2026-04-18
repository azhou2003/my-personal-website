"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-yellow bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark transition-transform duration-200 hover:scale-110 cursor-pointer border-none hover:bg-accent-yellow/20 dark:hover:bg-accent-sage/20 relative"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDarkMode}
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="block w-6 h-6 relative overflow-visible">
        {/* Current icon */}
        <span
          className={`absolute inset-0 transition-all duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            hovered
              ? isDarkMode
                ? "-translate-x-4 -rotate-6 opacity-0 scale-90"
                : "translate-x-4 rotate-6 opacity-0 scale-90"
              : "translate-x-0 rotate-0 opacity-100 scale-100"
          }`}
        >
          {isDarkMode ? (
            <MoonIcon className="w-6 h-6 text-accent-sage" />
          ) : (
            <SunIcon className="w-6 h-6 text-accent-yellow" />
          )}
        </span>
        {/* Opposite icon slides in from opposite side with staggered timing */}
        <span
          className={`absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] delay-50 ${
            hovered
              ? "translate-x-0 rotate-0 opacity-100 scale-100"
              : isDarkMode
                ? "translate-x-4 rotate-4 opacity-0 scale-90 pointer-events-none"
                : "-translate-x-4 -rotate-4 opacity-0 scale-90 pointer-events-none"
          }`}
        >
          {isDarkMode ? (
            <SunIcon className="w-6 h-6 text-accent-yellow" />
          ) : (
            <MoonIcon className="w-6 h-6 text-accent-sage" />
          )}
        </span>
      </span>
    </button>
  );
};

export default ThemeToggle;
