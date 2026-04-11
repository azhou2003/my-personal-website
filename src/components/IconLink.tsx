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
  <a className={`inline-flex items-center justify-center min-h-0 min-w-0 leading-none ${className}`} {...props}>
    {React.isValidElement(icon)
      ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
          className: [iconLinkClasses, (icon as React.ReactElement<{ className?: string }>).props.className].filter(Boolean).join(" ")
        })
      : icon}
  </a>
);

export default IconLink;
