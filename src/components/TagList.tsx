import React from "react";
import Tag from "./Tag";
import { accentClassesLight, accentClassesDark } from "./styles/tagColors";
import { useIsDarkMode } from "../hooks/useIsDarkMode";

interface TagListProps {
  tags: string[];
  className?: string;
}

const TagList: React.FC<TagListProps> = ({ tags, className = "" }) => {
  const isDarkMode = useIsDarkMode ? useIsDarkMode() : false;
  const colorClassList = isDarkMode ? accentClassesDark : accentClassesLight;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag, i) => (
        <Tag key={tag} label={tag} colorClass={colorClassList[i % colorClassList.length]} />
      ))}
    </div>
  );
};

export default TagList;
