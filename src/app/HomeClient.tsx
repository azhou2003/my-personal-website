"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import { useEffect, useRef, useState } from "react";

export default function HomeClient() {
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showToMyWorld, setShowToMyWorld] = useState(false);
  const [startOrbit, setStartOrbit] = useState(false);

  const aboutSectionRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const aboutObserver = new IntersectionObserver(
      ([entry]) => {
        setIsAboutVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.5, // 50% of the section must be visible
      }
    );

    const footerObserver = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.8, // 80% of the footer must be visible
      }
    );

    const currentAboutRef = aboutSectionRef.current;
    if (currentAboutRef) {
      aboutObserver.observe(currentAboutRef);
    }

    const currentFooterRef = footerRef.current;
    if (currentFooterRef) {
      footerObserver.observe(currentFooterRef);
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (currentAboutRef) {
        aboutObserver.unobserve(currentAboutRef);
      }
      if (currentFooterRef) {
        footerObserver.unobserve(currentFooterRef);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Staggered text animation on mount
  useEffect(() => {
    const timer1 = setTimeout(() => setShowWelcome(true), 300);
    const timer2 = setTimeout(() => setShowToMyWorld(true), 1000);
    const timer3 = setTimeout(() => setStartOrbit(true), 1700);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="h-screen overflow-y-auto flex flex-col bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark transition-colors">
      <Navbar />
      <main className="flex-1">
        {/* Hero section with integrated heading - takes full viewport minus navbar */}
        <section
          id="hero"
          className={`w-full relative transition-all duration-1000 ease-in-out h-screen ${
            isAboutVisible
              ? "opacity-0 -translate-y-16 pointer-events-none"
              : "opacity-100 translate-y-0"
          }`}
        >
          <HeroSection animateOrbit={startOrbit} />
          <div className="hero-title-container absolute inset-0 flex items-start justify-center pointer-events-none z-50 pt-8 sm:pt-12 md:pt-16 lg:pt-20">
            <div className="text-center px-4 sm:px-6 max-w-4xl">
              <h1 className="hero-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold text-foreground-light dark:text-foreground-dark drop-shadow-lg select-none leading-tight">
                <span className="inline-block">
                  {Array.from("Welcome...").map((char, i) => (
                    <span
                      key={i}
                      className={`inline-block transition-all duration-1000 ease-out ${
                        showWelcome
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-8"
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
                        showToMyWorld
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-8"
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
                        showToMyWorld
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-8"
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
                        showToMyWorld
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-8"
                      }`}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              </h1>
            </div>
          </div>
        </section>

        {/* About Me Tab - Visible at bottom when not expanded */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-10 transition-all duration-500 ${
            isScrolled || isAboutVisible
              ? "opacity-0 translate-y-full pointer-events-none"
              : "opacity-100 translate-y-0"
          }`}
        >
          <AboutSection isExpanded={false} animateIn={true} />
        </div>

        {/* About Me Expanded Section - Shows on scroll */}
        <section
          ref={aboutSectionRef}
          className={`w-full flex items-center justify-center transition-all duration-1000 ease-in-out h-screen ${
            isAboutVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"
          }`}
        >
          <AboutSection isExpanded={true} />
        </section>

        <footer
          ref={footerRef}
          className={`transition-opacity duration-1000 ease-in-out ${
            isFooterVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <Footer />
        </footer>
      </main>
    </div>
  );
}
