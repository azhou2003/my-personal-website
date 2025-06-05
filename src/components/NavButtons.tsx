import React from "react";

const buttons = [
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Resume", href: "/resume" },
];

const NavButtons = () => (
  <div className="flex gap-4">
    {buttons.map((btn) => (
      <a
        key={btn.label}
        href={btn.href}
        className="px-6 py-2 rounded-full bg-accent-sage text-foreground-light dark:text-foreground-dark font-semibold shadow hover:bg-accent-yellow transition-colors transform hover:scale-105 focus:scale-105 duration-200"
      >
        {btn.label}
      </a>
    ))}
  </div>
);

export default NavButtons;
