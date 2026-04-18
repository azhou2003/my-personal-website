"use client";
import React from "react";
import TagBase, { TagBaseProps } from "./TagBase";

interface TagProps extends TagBaseProps {
  onClick?: () => void;
}

/**
 * Clickable Tag component with hover effects.
 * Used for interactive filtering in blog and portfolio sections.
 */
const Tag: React.FC<TagProps> = ({ onClick, ...props }) => (
  <TagBase
    {...props}
    onClick={onClick}
    cursor="pointer"
    hoverEffects={true}
  />
);

export default Tag;
