"use client";
import React from "react";
import StaticTag from "./StaticTag";
import { accentClassesLight, accentClassesDark } from "./styles/tagColors";
import { useIsDarkMode } from "../hooks/useIsDarkMode";

interface StaticTagListProps {
  tags: string[];
  className?: string;
}

/**
 * Non-clickable TagList component using StaticTag.
 * Used for displaying tags in blog cards, portfolio popups, and blog post details 
 * where tags should not appear interactive.
 */
const StaticTagList: React.FC<StaticTagListProps> = ({ tags, className = "" }) => {
  const isDarkMode = useIsDarkMode();
  const colorClassList = isDarkMode ? accentClassesDark : accentClassesLight;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag, i) => (
        <StaticTag key={tag} label={tag} colorClass={colorClassList[i % colorClassList.length]} />
      ))}
    </div>
  );
};

export default StaticTagList;
