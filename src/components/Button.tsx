// src/components/Button.tsx
import React from "react";
import { buttonPrimaryClasses, buttonSecondaryClasses, buttonBaseClasses } from "./styles/buttonStyles";
import { iconLinkClasses } from "./styles/iconLinkStyles";
import { searchBarClasses } from "./styles/searchBarStyles";
import { accentClasses, popupAccentClasses } from "./styles/tagColors";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

/**
 * Reusable Button component with DRY styling.
 * @param variant - 'primary' or 'secondary' button style
 */
const Button: React.FC<ButtonProps> = ({ variant = "primary", className = "", ...props }) => {
  const classes =
    variant === "secondary"
      ? buttonSecondaryClasses + (className ? ` ${className}` : "")
      : buttonPrimaryClasses + (className ? ` ${className}` : "");
  return <button className={classes} {...props} />;
};

export default Button;
