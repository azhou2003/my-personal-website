"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

const setDarkClass = (enabled: boolean) => {
  if (enabled) {
    document.documentElement.classList.add("dark");
    document.body.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
    document.body.classList.remove("dark");
  }
};

const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    let initialMode = false;
    if (savedMode !== null) {
      initialMode = savedMode === "true";
    } else {
      initialMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    setIsDarkMode(initialMode);
    setDarkClass(initialMode);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("darkMode", newMode.toString());
      setDarkClass(newMode);
      return newMode;
    });
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded focus:outline-none bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark transition-transform duration-200 hover:scale-110 cursor-pointer border-none hover:bg-accent-yellow/20 dark:hover:bg-accent-sage/20 relative overflow-hidden"
      aria-label="Toggle dark mode"
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >      <span className="block w-6 h-6 relative overflow-visible">
        {/* Current icon */}
        <span
          className={`absolute inset-0 transition-all duration-500 ease-out ${
            hovered
              ? isDarkMode
                ? "-translate-x-10 opacity-0 scale-75 blur-sm"
                : "translate-x-10 opacity-0 scale-75 blur-sm"
              : "translate-x-0 opacity-100 scale-100 blur-0"
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
          className={`absolute inset-0 transition-all duration-500 ease-out delay-75 ${
            hovered
              ? "translate-x-0 opacity-100 scale-100 blur-0"
              : isDarkMode
                ? "translate-x-10 opacity-0 scale-75 blur-sm pointer-events-none"
                : "-translate-x-10 opacity-0 scale-75 blur-sm pointer-events-none"
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

export default DarkModeToggle;
