"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [showAbout, setShowAbout] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showToMyWorld, setShowToMyWorld] = useState(false);
  const [startOrbit, setStartOrbit] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const viewportHeight = window.innerHeight;
      // Show expanded about section when user scrolls more than 30% of viewport height
      setShowAbout(scrollPosition > viewportHeight * 0.3);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Staggered text animation on mount
  useEffect(() => {
    const timer1 = setTimeout(() => setShowWelcome(true), 300);
    const timer2 = setTimeout(() => setShowToMyWorld(true), 1000);
    // Start orbit animation after header animation finishes (after timer2)
    const timer3 = setTimeout(() => setStartOrbit(true), 1700); // 700ms after last header
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark transition-colors">
      <Navbar />
      <main className="flex flex-1 flex-col items-center w-full">
        {/* Hero section with integrated heading - takes full viewport minus navbar */}
        <div 
          ref={heroRef} 
          className={`w-full relative transition-all duration-700 ease-out ${
            showAbout ? "opacity-0 -translate-y-16 pointer-events-none" : "opacity-100 translate-y-0"
          }`} 
          style={{ height: 'calc(100vh - 64px)' }}
        >
          <HeroSection animateOrbit={startOrbit} />
          
          {/* Heading positioned with 1/3 space above, 2/3 space below to circle */}
          <div className="absolute w-full flex justify-center" style={{ top: 'calc((50vh - 200px) / 3)' }}>
            <h1 className="text-5xl md:text-7xl font-extrabold text-center text-foreground-light dark:text-foreground-dark drop-shadow-lg select-none">
              {Array.from("Welcome... To My World.").map((char, i) => (
                <span
                  key={i}
                  className={`inline-block transition-all duration-1000 ease-out ${
                    (i < 10 ? showWelcome : showToMyWorld) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h1>
          </div>
        </div>

        {/* About Me Tab - Visible at bottom when not expanded */}
        <div className={`fixed bottom-0 left-0 right-0 z-10 transition-all duration-500 ${showAbout ? "opacity-0 translate-y-full pointer-events-none" : "opacity-100 translate-y-0"}`}>
          <AboutSection isExpanded={false} />
        </div>

        {/* About Me Expanded Section - Shows on scroll */}
        <section
          className={`w-full flex flex-col items-center justify-center transition-all duration-700 ease-out ${showAbout ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-32 pointer-events-none"}`}
          aria-hidden={!showAbout}
        >
          <AboutSection isExpanded={true} />
          <div className="mt-8 mb-12">
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
