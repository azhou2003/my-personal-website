import React from "react";
import Tag from "./Tag";

interface TagListProps {
  tags: string[];
  className?: string;
  colorClassList?: string[];
}

const TagList: React.FC<TagListProps> = ({ tags, className = "", colorClassList }) => (
  <div className={`flex flex-wrap gap-2 ${className}`}>
    {tags.map((tag, i) => (
      <Tag key={tag} label={tag} colorClass={colorClassList ? colorClassList[i % colorClassList.length] : undefined} />
    ))}
  </div>
);

export default TagList;
