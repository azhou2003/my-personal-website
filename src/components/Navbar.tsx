"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DarkModeToggle from './DarkModeToggle';
import { useEffect, useState } from "react";
import Image from "next/image";

const Navbar: React.FC = () => {
  const [show, setShow] = useState(true);
  const pathname = usePathname();

  // Helper function to determine if a link is active
  const isActivePage = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Helper function to get link classes based on active state
  const getLinkClasses = (href: string) => {
    const baseClasses = "whitespace-nowrap transition-colors duration-200";
    const isActive = isActivePage(href);
    
    if (isActive) {
      return `${baseClasses} text-[#d4501f] dark:text-[#ff9f80] underline decoration-2 underline-offset-4`;
    }
    
    return `${baseClasses} hover:underline hover:text-[#d4501f] dark:hover:text-[#ff9f80]`;
  };

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
      {/* Logo on the left */}
      <div className="flex items-center">
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
      </div>      {/* Navigation links on the right */}
      <div className="flex items-center space-x-6">
        <Link href="/" className={getLinkClasses('/')}>
          Home
        </Link>
        <Link href="/portfolio" className={getLinkClasses('/portfolio')}>
          Portfolio
        </Link>
        <Link href="/blog" className={getLinkClasses('/blog')}>
          Blog
        </Link>
        <DarkModeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
