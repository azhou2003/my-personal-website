"use client";
import React from "react";
import TagBase, { TagBaseProps } from "./TagBase";

interface StaticTagProps extends TagBaseProps {
  // No onClick handler - this tag is purely decorative
}

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
