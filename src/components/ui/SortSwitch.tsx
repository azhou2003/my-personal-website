"use client";
import React from "react";
import { designTokens } from "@/lib/designTokens";

interface SortSwitchProps {
  value: "desc" | "asc";
  onChange: (value: "desc" | "asc") => void;
  className?: string;
}

export default function SortSwitch({ value, onChange, className = "" }: SortSwitchProps) {
  const trackOff = designTokens.switchTrackOff;
  const trackOn = designTokens.switchTrackOn;
  const thumbColor = designTokens.switchThumb;
  const labelClass = "text-[11px] sm:text-xs font-semibold transition-colors w-14 sm:w-16 text-center flex-shrink-0";

  // Track color logic
  const getTrackColor = () => {
    return value === "desc" ? trackOff : trackOn;
  };
  // Thumb color logic
  const getThumbColor = () => {
    return thumbColor;
  };

  const [isActive, setIsActive] = React.useState(false);
  const ringColor = designTokens.switchRing;

  const switchStyle = {
    width: "var(--switch-w)",
    height: "var(--switch-h)",
    "--switch-p": "2px",
  } as React.CSSProperties;

  const baseTransform =
    value === "asc"
      ? "translate(calc(var(--switch-w) - var(--switch-h)), -50%)"
      : "translate(0, -50%)";
  const activeScale = isActive ? " scale(1.08)" : "";
  const knobStyle = {
    boxShadow: isActive
      ? `0 2px 8px rgba(0,0,0,0.15), ${ringColor}`
      : '0 1px 4px rgba(0,0,0,0.10)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    top: '50%',
    left: 'var(--switch-p)',
    width: 'calc(var(--switch-h) - (var(--switch-p) * 2))',
    height: 'calc(var(--switch-h) - (var(--switch-p) * 2))',
    position: 'absolute' as const,
    display: 'block',
    background: getThumbColor(),
    border: `1px solid ${designTokens.switchThumbBorder}`,
    transform: baseTransform + activeScale,
  };

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-4 ${className}`}>
      <span
        className={labelClass + (value === "desc" ? " text-foreground-light" : " text-border-light")}
      >
        Newest
      </span>
      <button
        type="button"
        className={`relative rounded-full border-2 shadow flex-shrink-0 transition-colors duration-200 focus:outline-none min-h-0 min-w-0 [--switch-w:3rem] [--switch-h:1.625rem] sm:[--switch-w:3.5rem] sm:[--switch-h:1.75rem]`}
        aria-pressed={value === "asc"}
        aria-label="Toggle sort order"
        onClick={() => onChange(value === "desc" ? "asc" : "desc")}
        style={{
          ...switchStyle,
          background: getTrackColor(),
          borderColor: getTrackColor(),
          minHeight: 0,
          minWidth: 0,
          lineHeight: 0,
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
