"use client";

import Link from 'next/link';
import DarkModeToggle from './DarkModeToggle';
import { useEffect, useRef } from 'react';

const Navbar = () => {
  const navRef = useRef<HTMLDivElement>(null);
  // Use a ref to store lastScroll so it persists across renders
  const lastScroll = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const nav = navRef.current;
      if (!nav) return;
      const curr = window.scrollY;
      if (curr > lastScroll.current && curr > 60) {
        nav.style.transform = 'translateY(-100%)';
      } else {
        nav.style.transform = 'translateY(0)';
      }
      lastScroll.current = curr;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className="w-full flex items-center justify-between py-4 px-6 border-b border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark shadow-md sticky top-0 z-50 transition-all duration-300"
      style={{ transition: 'transform 0.3s' }}
    >
      <div className="flex items-center gap-3">
        <Link href="/">
          <span className="font-bold text-lg text-foreground-light dark:text-foreground-dark">Anjie</span>
        </Link>
      </div>
      <div className="flex items-center gap-6">
        <Link href="/portfolio" className="hover:underline text-foreground-light dark:text-foreground-dark">Portfolio</Link>
        <Link href="/blog" className="hover:underline text-foreground-light dark:text-foreground-dark">Blog</Link>
        <div className="ml-2"><DarkModeToggle /></div>
      </div>
    </nav>
  );
};

export default Navbar;
