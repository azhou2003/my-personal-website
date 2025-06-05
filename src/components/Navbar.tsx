"use client";

import Link from 'next/link';
import DarkModeToggle from './DarkModeToggle';
import { useEffect, useState } from "react";
import Image from "next/image";

const Navbar: React.FC = () => {
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
      className={`w-full flex items-center px-6 py-4 bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark shadow-md z-50 transition-transform duration-300 ${show ? "translate-y-0" : "-translate-y-full"}`}
    >
      {/* Absolutely center the logo, then position links relative to it */}
      <div className="relative w-full h-10 flex items-center">
        {/* Logo (centered on screen midline) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <Link href="/" className="flex items-center justify-center group">
            <span className="inline-block rounded-full overflow-visible transition-transform duration-200 group-hover:scale-125">
              <Image
                src="/anjie-zhou-logo.svg"
                alt="Anjie Zhou Logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                style={{ display: 'inline-block' }}
                priority
              />
            </span>
            <span className="sr-only">Home</span>
          </Link>
        </div>
        {/* Portfolio (left of logo, fixed spacing) */}
        <div className="absolute right-1/2 top-1/2 flex items-center -translate-y-1/2 justify-end pr-16">
          <Link href="/portfolio" className="hover:underline whitespace-nowrap">Portfolio</Link>
        </div>
        {/* Blog (right of logo, fixed spacing) */}
        <div className="absolute left-1/2 top-1/2 flex items-center -translate-y-1/2 justify-start pl-16">
          <Link href="/blog" className="hover:underline whitespace-nowrap">Blog</Link>
        </div>
        {/* Dark Mode Toggle (far right, inside nav bar) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
          <DarkModeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
