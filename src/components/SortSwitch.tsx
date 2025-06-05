"use client";
import React from "react";
import { useIsDarkMode } from "../hooks/useIsDarkMode";

interface SortSwitchProps {
  value: "desc" | "asc";
  onChange: (value: "desc" | "asc") => void;
  className?: string;
}

export default function SortSwitch({ value, onChange, className = "" }: SortSwitchProps) {
  const isDarkMode = useIsDarkMode();
    // Using your site's sage accent colors for a cohesive look
  // Track colors: sage when active, neutral when inactive
  const trackOff = isDarkMode ? "#3f3b36" : "#e6e4d9"; // use dark sage instead of background in dark mode
  const trackOn = isDarkMode ? "#3f4a36" : "#b7c7a3"; // sage colors from your palette
  
  // Thumb colors: cream/beige that complements sage
  const thumbColor = isDarkMode ? "#f5f5f5" : "#fefae0"; // your foreground/background colors

  // Center labels with min-width for symmetry
  const labelClass = "text-xs font-semibold transition-colors min-w-[70px] text-center";

  // Track color logic
  const getTrackColor = () => {
    return value === "desc" ? trackOff : trackOn;
  };
  // Thumb color logic
  const getThumbColor = () => {
    return thumbColor;
  };

  // Focus/hover ring using sage accent
  const [isActive, setIsActive] = React.useState(false);
  const ringColor = isDarkMode ? '0 0 0 4px rgba(63, 74, 54, 0.3)' : '0 0 0 4px rgba(183, 199, 163, 0.3)';

  // Knob style
  const baseTransform = value === "asc" ? 'translateX(28px)' : 'translateX(0)';
  const activeScale = isActive ? ' scale(1.08)' : '';
  const knobStyle = {
    boxShadow: isActive
      ? `0 2px 8px rgba(0,0,0,0.15), ${ringColor}`
      : '0 1px 4px rgba(0,0,0,0.10)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    top: '2px',
    left: '2px',
    width: '22px',
    height: '22px',
    position: 'absolute' as const,
    display: 'block',
    background: getThumbColor(),
    border: `1px solid ${isDarkMode ? '#3f3b36' : '#b7c7a3'}`, // border colors from your theme
    transform: baseTransform + activeScale,
  };

  return (
    <div className={`flex items-center justify-center gap-3 w-full ${className}`}>
      <span
        className={labelClass + (value === "desc" ? " text-foreground-light" : " text-border-light")}
      >
        Most Recent
      </span>
      <button
        type="button"
        className={`relative w-14 h-7 rounded-full border-2 shadow flex-shrink-0 transition-colors duration-200 focus:outline-none`}
        aria-pressed={value === "asc"}
        aria-label="Toggle sort order"
        onClick={() => onChange(value === "desc" ? "asc" : "desc")}
        style={{
          background: getTrackColor(),
          borderColor: getTrackColor(),
        }}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        onMouseEnter={() => setIsActive(true)}
        onMouseLeave={() => setIsActive(false)}
      >
        <span
          className={`rounded-full border border-border-light transition-transform duration-200`}
          style={knobStyle}
        />
      </button>
      <span
        className={labelClass + (value === "asc" ? " text-foreground-light" : " text-border-light")}
      >
        Oldest
      </span>
    </div>
  );
}
