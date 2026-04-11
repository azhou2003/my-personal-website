"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import HomeHeroHeading from "../components/HomeHeroHeading";
import { useEffect, useRef, useState } from "react";
import { HOME_ANIMATION_TIMINGS } from "../lib/motion";

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
    const timer1 = setTimeout(() => setShowWelcome(true), HOME_ANIMATION_TIMINGS.welcomeDelayMs);
    const timer2 = setTimeout(() => setShowToMyWorld(true), HOME_ANIMATION_TIMINGS.toMyWorldDelayMs);
    const timer3 = setTimeout(() => setStartOrbit(true), HOME_ANIMATION_TIMINGS.orbitStartDelayMs);
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
          <HomeHeroHeading showWelcome={showWelcome} showToMyWorld={showToMyWorld} />
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
