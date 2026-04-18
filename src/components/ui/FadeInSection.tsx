"use client";

import { useEffect, useRef, useState } from "react";

interface FadeInSectionProps {
  children: React.ReactNode;
  delay?: number;
}

export default function FadeInSection({ children, delay = 0 }: FadeInSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef<number>(0);
  const [scrollDir, setScrollDir] = useState<"down" | "up">("down");
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrollDir(currentY > lastScrollY.current ? "down" : "up");
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.setTimeout(() => {
            node.classList.add("opacity-100", "translate-y-0");
            node.classList.remove("opacity-0", "fade-out-up", "fade-out-down", "duration-500");
            setHasLoaded(true);
          }, delay);
          return;
        }

        node.classList.remove("opacity-100", "translate-y-0");
        const classesToAdd = ["opacity-0", scrollDir === "down" ? "fade-out-down" : "fade-out-up"];
        if (hasLoaded) classesToAdd.push("duration-500");
        node.classList.add(...classesToAdd);
        node.classList.remove(scrollDir === "down" ? "fade-out-up" : "fade-out-down");
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delay, hasLoaded, scrollDir]);

  return (
    <div ref={ref} className="opacity-0 translate-y-8 transition-all duration-300 will-change-transform">
      {children}
    </div>
  );
}
