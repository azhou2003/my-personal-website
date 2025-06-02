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
    >
      <span className="block w-6 h-6 relative overflow-visible">
        {/* Current icon */}
        <span
          className={`absolute inset-0 transition-all duration-300 ease-in-out ${
            hovered
              ? isDarkMode
                ? "translate-x-8 opacity-0 scale-90 blur-sm"
                : "-translate-x-8 opacity-0 scale-90 blur-sm"
              : "translate-x-0 opacity-100 scale-100 blur-0"
          }`}
        >
          {isDarkMode ? (
            <SunIcon className="w-6 h-6 text-accent-yellow" />
          ) : (
            <MoonIcon className="w-6 h-6 text-accent-sage" />
          )}
        </span>
        {/* Opposite icon always slides in from right like a carousel */}
        <span
          className={`absolute inset-0 transition-all duration-300 ease-in-out ${
            hovered
              ? "translate-x-0 opacity-100 scale-100 blur-0"
              : "translate-x-8 opacity-0 scale-90 blur-sm pointer-events-none"
          }`}
        >
          {isDarkMode ? (
            <MoonIcon className="w-6 h-6 text-accent-sage" />
          ) : (
            <SunIcon className="w-6 h-6 text-accent-yellow" />
          )}
        </span>
      </span>
    </button>
  );
};

export default DarkModeToggle;
