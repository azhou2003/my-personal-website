"use client";
import React from "react";
import Tag from "./Tag";
import { accentClasses } from "../styles/tagColors";

interface TagListProps {
  tags: string[];
  className?: string;
}

const TagList: React.FC<TagListProps> = ({ tags, className = "" }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag, i) => (
        <Tag key={tag} label={tag} colorClass={accentClasses[i % accentClasses.length]} />
      ))}
    </div>
  );
};

export default TagList;
