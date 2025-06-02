"use client";
import React from "react";

interface TagProps {
  label: string;
  colorClass?: string; // Tailwind class for accent color
  onClick?: () => void;
  className?: string;
}

const Tag: React.FC<TagProps> = ({ label, colorClass = "bg-accent text-accent-foreground border-accent", onClick, className = "" }) => {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full border text-xs font-medium transition-transform duration-150 cursor-pointer hover:scale-110 focus:scale-110 ${colorClass} ${className}`}
      tabIndex={onClick ? 0 : -1}
      onClick={onClick}
      onKeyDown={e => { if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick(); }}
      role={onClick ? "button" : undefined}
      aria-pressed={onClick ? false : undefined}
    >
      {label}
    </span>
  );
};

export default Tag;
