"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import NavButtons from "../components/NavButtons";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [showAbout, setShowAbout] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      // Lower threshold: show about section when bottom of hero is above half the viewport height
      setShowAbout(rect.bottom < window.innerHeight / 2);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark transition-colors">
      <Navbar />
      <main className="flex flex-1 flex-col items-center w-full px-4">
        <div ref={heroRef} className="w-full min-h-[90vh]">
          <HeroSection />
        </div>
        {/* Second section: About + Nav Buttons, hidden until scroll */}
        <section
          className={`w-full flex flex-col items-center justify-center transition-opacity duration-700 ${showAbout ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          aria-hidden={!showAbout}
        >
          <AboutSection />
          <div className="mt-4 mb-12">
            <NavButtons />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
