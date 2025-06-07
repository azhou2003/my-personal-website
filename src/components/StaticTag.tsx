"use client";
import React from "react";
import TagBase, { TagBaseProps } from "./TagBase";

// StaticTag uses the same props as TagBase since it's purely decorative
type StaticTagProps = TagBaseProps;

/**
 * Non-clickable Tag component without hover effects.
 * Used for displaying tags in blog cards, portfolio popups, and blog post details 
 * where tags should not appear interactive.
 */
const StaticTag: React.FC<StaticTagProps> = (props) => (
  <TagBase
    {...props}
    cursor="default"
    hoverEffects={false}
  />
);

export default StaticTag;
