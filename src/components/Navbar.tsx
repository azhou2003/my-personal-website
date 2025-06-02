"use client";

import Link from 'next/link';
import DarkModeToggle from './DarkModeToggle';
import { useEffect, useState } from "react";

const Navbar = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < lastY) {
        setShow(true);
      } else if (currentY > lastY) {
        setShow(false);
      }
      lastY = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`w-full flex items-center justify-between px-6 py-4 bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark shadow-md z-50 transition-transform duration-300 ${show ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className="flex items-center gap-3">
        <Link href="/">
          <span className="font-bold text-lg">Anjie</span>
        </Link>
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <Link href="/portfolio" className="hover:underline">Portfolio</Link>
        <Link href="/blog" className="hover:underline">Blog</Link>
        <DarkModeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
