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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollRoot = scrollContainerRef.current;
    if (!scrollRoot) return;

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const resetScroll = () => {
      scrollRoot.scrollTop = 0;
      window.scrollTo(0, 0);
    };

    resetScroll();
    const rafId = window.requestAnimationFrame(resetScroll);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    const scrollRoot = scrollContainerRef.current;
    const isSmallViewport = window.innerHeight < 800;

    const aboutObserver = new IntersectionObserver(
      ([entry]) => {
        setIsAboutVisible(entry.isIntersecting);
      },
      {
        root: scrollRoot,
        rootMargin: "0px",
        threshold: isSmallViewport ? 0.3 : 0.5,
      }
    );

    const footerObserver = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      {
        root: scrollRoot,
        rootMargin: "0px",
        threshold: 0.3,
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
      setIsScrolled((scrollRoot?.scrollTop ?? window.scrollY) > 50);
    };

    scrollRoot?.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      if (currentAboutRef) {
        aboutObserver.unobserve(currentAboutRef);
      }
      if (currentFooterRef) {
        footerObserver.unobserve(currentFooterRef);
      }
      scrollRoot?.removeEventListener("scroll", handleScroll);
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
    <div
      ref={scrollContainerRef}
      className="h-[100svh] overflow-y-auto flex flex-col bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark transition-colors"
    >
      <Navbar />
      <main className="flex-1">
        {/* Hero section with integrated heading - takes full viewport minus navbar */}
        <section
          id="hero"
          className={`w-full relative transition-all duration-800 ease-out h-[calc(100svh-72px)] min-h-[30rem] ${
            isAboutVisible
              ? "opacity-0 -translate-y-10 pointer-events-none"
              : "opacity-100 translate-y-0"
          }`}
        >
          <HeroSection animateOrbit={startOrbit} />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-background-light/45 dark:to-background-dark/55 z-30" />
          <div className="hero-title-container absolute inset-0 flex items-start justify-center pointer-events-none z-50 pt-[clamp(0.75rem,4.5vh,3.5rem)]">
            <div className="text-center px-4 sm:px-6 max-w-3xl lg:max-w-none">
              <p className={`uppercase tracking-[0.18em] text-[0.62rem] sm:text-[0.72rem] text-[#4b3b22] dark:text-[#d8c7ab] mb-2 sm:mb-3 transition-all duration-700 ${showWelcome ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
                Anjie Zhou
              </p>
              <h1 className="hero-title font-extrabold text-foreground-light dark:text-foreground-dark drop-shadow-[0_6px_24px_rgba(0,0,0,0.22)] select-none leading-[1.1] tracking-[-0.02em] lg:whitespace-nowrap">
                <span className="block lg:inline">
                  {Array.from("Welcome...").map((char, i) => (
                    <span
                      key={i}
                      className={`inline-block transition-all duration-900 ease-out ${
                        showWelcome
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-6"
                      }`}
                    >
                      {char}
                    </span>
                  ))}
                </span>
                <span className="hidden lg:inline">{'\u00A0'}</span>
                <span className="block lg:inline whitespace-nowrap">
                  {Array.from("To My World.").map((char, i) => (
                    <span
                      key={`world-${i}`}
                      className={`inline-block transition-all duration-900 ease-out ${
                        showToMyWorld
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-6"
                      }`}
                    >
                      {char === " " ? '\u00A0' : char}
                    </span>
                  ))}
                </span>
              </h1>
              <p className={`mt-2 sm:mt-3 text-[0.78rem] sm:text-sm text-[#3f3221] dark:text-[#d9c8ad] transition-all duration-700 ${showToMyWorld ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                Software Engineer | Financial Miser
              </p>
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
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
        >
          <AboutSection isExpanded={false} animateIn={true} />
        </div>

        {/* About Me Expanded Section - Shows on scroll */}
        <section
          ref={aboutSectionRef}
          className={`w-full flex items-center justify-center transition-all duration-900 max-[640px]:duration-700 ease-out min-h-[calc(100svh-72px)] ${
            isAboutVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7 sm:translate-y-10"
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
