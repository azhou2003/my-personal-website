"use client";
import TagList from "../../../components/TagList";
import { accentClassesLight, accentClassesDark } from "../../../components/styles/tagColors";
import { useIsDarkMode } from "../../../hooks/useIsDarkMode";

export default function BlogPostTags({ tags }: { tags: string[] }) {
  const isDarkMode = useIsDarkMode();
  return (
    <TagList
      tags={tags}
      className="mb-8"
      colorClassList={isDarkMode ? accentClassesDark : accentClassesLight}
    />
  );
}
