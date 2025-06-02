// src/components/styles/buttonStyles.ts
// DRY button style constants for use in Button.tsx and elsewhere

export const buttonBaseClasses =
  "px-4 py-2 rounded font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent-yellow disabled:opacity-60 disabled:cursor-not-allowed";

export const buttonPrimaryClasses =
  buttonBaseClasses +
  " bg-accent-yellow text-[#23201c] hover:bg-accent-sage dark:bg-accent-sage dark:text-[#ece7d5] dark:hover:bg-accent-yellow";

export const buttonSecondaryClasses =
  buttonBaseClasses +
  " bg-background-light text-foreground-light border border-border-light hover:bg-accent-yellow/20 dark:bg-background-dark dark:text-foreground-dark dark:border-border-dark dark:hover:bg-accent-sage/20";
