// src/components/IconLink.tsx
import React from "react";
import { iconLinkClasses } from "./styles/iconLinkStyles";

interface IconLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  icon: React.ReactNode;
}

/**
 * Reusable IconLink component for social/contact icons.
 * @param icon - The icon component to render
 */
const IconLink: React.FC<IconLinkProps> = ({ icon, className = "", ...props }) => (
  <a className={className} {...props}>
    {React.cloneElement(icon as React.ReactElement, { className: iconLinkClasses })}
  </a>
);

export default IconLink;
