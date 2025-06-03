"use client";
import TagList from "../../components/TagList";
import { accentClassesLight, accentClassesDark } from "../../components/styles/tagColors";
import { useIsDarkMode } from "../../hooks/useIsDarkMode";

export default function PortfolioTags({ tags, className = "" }: { tags: string[]; className?: string }) {
  const isDarkMode = useIsDarkMode();
  return (
    <TagList
      tags={tags}
      className={className}
      colorClassList={isDarkMode ? accentClassesDark : accentClassesLight}
    />
  );
}
