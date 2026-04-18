"use client";
import React from "react";

export interface TagBaseProps {
  label: string;
  colorClass?: string; // Tailwind class for accent color
  className?: string;
  children?: React.ReactNode; // Allow children for frequency or extra content
}

/**
 * Base Tag component that provides common styling and structure.
 * This serves as the foundation for both clickable and non-clickable tag variants.
 */
const TagBase: React.FC<TagBaseProps & { 
  onClick?: () => void;
  cursor?: 'pointer' | 'default';
  hoverEffects?: boolean;
}> = ({ 
  label, 
  colorClass = "", 
  onClick, 
  className = "", 
  children, 
  cursor = 'default',
  hoverEffects = false
}) => {
  const baseClasses = "inline-block px-3 py-1 rounded-full border text-xs font-semibold transition-colors duration-200 select-none";
  const cursorClass = cursor === 'pointer' ? 'cursor-pointer' : 'cursor-default';
  const hoverClasses = hoverEffects ? 'hover:brightness-110 hover:scale-105' : '';
  
  return (
    <span
      onClick={onClick}
      className={`${baseClasses} ${cursorClass} ${hoverClasses} ${colorClass} ${className}`}
    >
      {children ? children : label}
    </span>
  );
};

export default TagBase;
