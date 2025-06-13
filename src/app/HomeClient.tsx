"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import { useEffect, useRef, useState } from "react";

export default function HomeClient() {
  const [showAbout, setShowAbout] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showToMyWorld, setShowToMyWorld] = useState(false);
  const [startOrbit, setStartOrbit] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const viewportHeight = window.innerHeight;
      // More forgiving scroll trigger thresholds - allow users to scroll more before switching
      const triggerRatio = window.innerWidth < 768 ? 0.6 : 0.7; // Much later trigger
      setShowAbout(scrollPosition > viewportHeight * triggerRatio);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Don't run handleScroll immediately to prevent about section showing on reload
    // Only start checking scroll after a brief delay to allow page to settle
    const scrollCheckTimer = setTimeout(() => {
      handleScroll();
    }, 100);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollCheckTimer);
    };
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
      <main className="flex flex-1 flex-col items-center w-full">        {/* Hero section with integrated heading - takes full viewport minus navbar */}
        <div 
          ref={heroRef} 
          className={`w-full relative transition-all duration-1000 ease-in-out ${
            showAbout ? "opacity-0 -translate-y-8 pointer-events-none" : "opacity-100 translate-y-0"
          }`} 
          style={{ height: 'calc(100vh - 64px)' }}
        >
          <HeroSection animateOrbit={startOrbit} />          {/* Responsive heading positioned to work with orbital animation */}
          <div className="hero-title-container absolute inset-0 flex items-start justify-center pointer-events-none z-50 pt-8 sm:pt-12 md:pt-16 lg:pt-20">
            <div className="text-center px-4 sm:px-6 max-w-4xl">              <h1 className="hero-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold text-foreground-light dark:text-foreground-dark drop-shadow-lg select-none leading-tight">
                <span className="inline-block">
                  {Array.from("Welcome...").map((char, i) => (
                    <span
                      key={i}
                      className={`inline-block transition-all duration-1000 ease-out ${
                        showWelcome ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                      }`}
                    >
                      {char}
                    </span>
                  ))}
                </span>
                <span className="inline-block">{'\u00A0'}</span>
                <span className="inline-block">
                  {Array.from("To").map((char, i) => (
                    <span
                      key={`to-${i}`}
                      className={`inline-block transition-all duration-1000 ease-out ${
                        showToMyWorld ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                      }`}
                    >
                      {char}
                    </span>
                  ))}
                </span>
                <span className="inline-block">{'\u00A0'}</span>
                <span className="inline-block">
                  {Array.from("My").map((char, i) => (
                    <span
                      key={`my-${i}`}
                      className={`inline-block transition-all duration-1000 ease-out ${
                        showToMyWorld ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                      }`}
                    >
                      {char}
                    </span>
                  ))}
                </span>
                <span className="inline-block">{'\u00A0'}</span>
                <span className="inline-block whitespace-nowrap">
                  {Array.from("World.").map((char, i) => (
                    <span
                      key={`world-${i}`}
                      className={`inline-block transition-all duration-1000 ease-out ${
                        showToMyWorld ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                      }`}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* About Me Tab - Visible at bottom when not expanded */}
        <div className={`fixed bottom-0 left-0 right-0 z-10 transition-all duration-500 ${showAbout ? "opacity-0 translate-y-full pointer-events-none" : "opacity-100 translate-y-0"}`}>
          <AboutSection isExpanded={false} />
        </div>        {/* About Me Expanded Section - Shows on scroll */}
        <section
          className={`w-full flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${showAbout ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-16 pointer-events-none"}`}
          aria-hidden={!showAbout}
        >
          <AboutSection isExpanded={true} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
