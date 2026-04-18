"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme";
import { useEffect, useState } from "react";
import Image from "next/image";

const Navbar: React.FC = () => {
  const [show, setShow] = useState(true);
  const pathname = usePathname();

  // Helper function to determine if a link is active
  const isActivePage = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  // Helper function to get link classes based on active state
  const getLinkClasses = (href: string) => {
    const baseClasses = "inline-flex h-10 items-center justify-center whitespace-nowrap leading-none transition-colors duration-200";
    const isActive = isActivePage(href);
    
    if (isActive) {
      return `${baseClasses} text-[var(--color-nav-active)] underline decoration-2 underline-offset-4`;
    }
    
    return `${baseClasses} hover:underline hover:text-[var(--color-nav-active)]`;
  };

  useEffect(() => {
    let lastY = Math.max(window.scrollY, 0);
    const minDelta = 8;
    const showAtOrAboveY = 80;

    const handleScroll = () => {
      const currentY = Math.max(window.scrollY, 0);
      const delta = currentY - lastY;

      if (currentY <= showAtOrAboveY) {
        setShow(true);
        lastY = currentY;
        return;
      }

      if (Math.abs(delta) < minDelta) {
        return;
      }

      if (delta < 0) {
        setShow(true);
      } else {
        setShow(false);
      }

      lastY = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setShow(true);
  }, [pathname]);

  return (
    <nav
      className={`w-full px-4 sm:px-6 py-2.5 sm:py-4 bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark shadow-md z-50 transition-transform duration-300 ${show ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className="sm:hidden grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-1">
        <Link href="/" className="flex h-10 w-10 items-center justify-center justify-self-start group">
          <span className="inline-block rounded-full overflow-visible transition-transform duration-200 group-hover:scale-125">
            <Image
              src="/anjie-zhou-logo.svg"
              alt="Anjie Zhou Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              style={{ display: "inline-block" }}
              priority
            />
          </span>
          <span className="sr-only">Home</span>
        </Link>
        <div className="flex h-10 items-center justify-center space-x-4">
          <Link href="/" className={getLinkClasses("/")}>
            Home
          </Link>
          <Link href="/portfolio" className={getLinkClasses("/portfolio")}>
            Portfolio
          </Link>
          <Link href="/blog" className={getLinkClasses("/blog")}>
            Blog
          </Link>
        </div>
        <div className="flex h-10 w-10 items-center justify-center justify-self-end">
          <ThemeToggle />
        </div>
      </div>

      <div className="hidden sm:flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center justify-center group">
            <span className="inline-block rounded-full overflow-visible transition-transform duration-200 group-hover:scale-125">
              <Image
                src="/anjie-zhou-logo.svg"
                alt="Anjie Zhou Logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
                style={{ display: "inline-block" }}
                priority
              />
            </span>
            <span className="sr-only">Home</span>
          </Link>
        </div>
        <div className="flex h-10 items-center space-x-6">
          <Link href="/" className={getLinkClasses("/")}>
            Home
          </Link>
          <Link href="/portfolio" className={getLinkClasses("/portfolio")}>
            Portfolio
          </Link>
          <Link href="/blog" className={getLinkClasses("/blog")}>
            Blog
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
