"use client";
import React from "react";

interface TagProps {
  label: string;
  colorClass?: string; // Tailwind class for accent color
  onClick?: () => void;
  className?: string;
}

const Tag: React.FC<TagProps> = ({ label, colorClass = "", onClick, className = "" }) => (
  <span
    onClick={onClick}
    className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold cursor-pointer transition-colors duration-200 select-none ${colorClass} ${className} hover:brightness-110 hover:scale-105`}
  >
    {label}
  </span>
);

export default Tag;
