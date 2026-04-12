"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import HomeHeroHeading from "../components/HomeHeroHeading";
import { useCallback, useEffect, useRef, useState } from "react";
import { HOME_ANIMATION_TIMINGS } from "../lib/motion";
import type { AboutSlide } from "../lib/types";

interface HomeClientProps {
  aboutSlides: AboutSlide[];
}

export default function HomeClient({ aboutSlides }: HomeClientProps) {
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<"hero" | "about">("hero");
  const [showWelcome, setShowWelcome] = useState(false);
  const [showToMyWorld, setShowToMyWorld] = useState(false);
  const [startOrbit, setStartOrbit] = useState(false);
  const [activeAboutSlideIndex, setActiveAboutSlideIndex] = useState(0);

  const heroSectionRef = useRef<HTMLElement>(null);
  const aboutSectionRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isSnappingRef = useRef(false);
  const activeSectionRef = useRef<"hero" | "about">("hero");
  const touchStartYRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const getTargetTop = useCallback((element: HTMLElement) => {
    const scrollRoot = scrollContainerRef.current;
    if (!scrollRoot) return 0;
    const rootRect = scrollRoot.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    return scrollRoot.scrollTop + (elementRect.top - rootRect.top);
  }, []);

  const snapToSection = useCallback(
    (section: "hero" | "about") => {
      const scrollRoot = scrollContainerRef.current;
      const aboutEl = aboutSectionRef.current;
      if (!scrollRoot || !aboutEl) return;

      const targetTop = section === "hero" ? 0 : getTargetTop(aboutEl);
      isSnappingRef.current = true;
      setActiveSection(section);
      scrollRoot.scrollTo({ top: targetTop, behavior: "smooth" });

      window.setTimeout(() => {
        isSnappingRef.current = false;
      }, 420);
    },
    [getTargetTop]
  );

  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== "hero" || aboutSlides.length === 0) return;

    const intervalId = window.setInterval(() => {
      setActiveAboutSlideIndex((prev) => (prev + 1) % aboutSlides.length);
    }, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [activeSection, aboutSlides.length]);

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
    if (!scrollRoot) return;

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

    const currentFooterRef = footerRef.current;
    if (currentFooterRef) {
      footerObserver.observe(currentFooterRef);
    }

    const handleScroll = () => {
      const currentTop = scrollRoot.scrollTop;
      setIsScrolled(currentTop > 50);

      const aboutEl = aboutSectionRef.current;
      if (!aboutEl || isSnappingRef.current) return;
      const aboutTop = getTargetTop(aboutEl);
      const midpoint = aboutTop / 2;
      setActiveSection(currentTop >= midpoint ? "about" : "hero");
    };

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 6) return;

      if (isSnappingRef.current) {
        event.preventDefault();
        return;
      }

      const aboutEl = aboutSectionRef.current;
      if (!aboutEl) return;
      const aboutTop = getTargetTop(aboutEl);
      const currentTop = scrollRoot.scrollTop;

      if (event.deltaY > 0 && activeSectionRef.current === "hero") {
        event.preventDefault();
        snapToSection("about");
      } else if (event.deltaY < 0 && activeSectionRef.current === "about" && currentTop <= aboutTop + 96) {
        event.preventDefault();
        snapToSection("hero");
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      touchStartYRef.current = touch.clientY;
      touchStartXRef.current = touch.clientX;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (isSnappingRef.current || touchStartYRef.current === null || touchStartXRef.current === null) return;
      const touch = event.changedTouches[0];
      const deltaY = touchStartYRef.current - touch.clientY;
      const deltaX = touchStartXRef.current - touch.clientX;

      touchStartYRef.current = null;
      touchStartXRef.current = null;

      if (Math.abs(deltaY) < 18 || Math.abs(deltaY) < Math.abs(deltaX)) return;

      const aboutEl = aboutSectionRef.current;
      if (!aboutEl) return;
      const aboutTop = getTargetTop(aboutEl);
      const currentTop = scrollRoot.scrollTop;

      if (deltaY > 0 && activeSectionRef.current === "hero") {
        snapToSection("about");
      } else if (deltaY < 0 && activeSectionRef.current === "about" && currentTop <= aboutTop + 96) {
        snapToSection("hero");
      }
    };

    scrollRoot.addEventListener("scroll", handleScroll, { passive: true });
    scrollRoot.addEventListener("wheel", handleWheel, { passive: false });
    scrollRoot.addEventListener("touchstart", handleTouchStart, { passive: true });
    scrollRoot.addEventListener("touchend", handleTouchEnd, { passive: true });
    handleScroll();

    return () => {
      if (currentFooterRef) {
        footerObserver.unobserve(currentFooterRef);
      }
      scrollRoot.removeEventListener("scroll", handleScroll);
      scrollRoot.removeEventListener("wheel", handleWheel);
      scrollRoot.removeEventListener("touchstart", handleTouchStart);
      scrollRoot.removeEventListener("touchend", handleTouchEnd);
    };
  }, [getTargetTop, snapToSection]);

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
      <div
        className={`transition-all duration-500 ease-out ${
          activeSection === "hero"
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        <Navbar />
      </div>
      <main className="flex-1">
        {/* Hero section with integrated heading - takes full viewport minus navbar */}
        <section
          ref={heroSectionRef}
          id="hero"
          className={`w-full relative transition-all duration-800 ease-out h-[calc(100svh-72px)] min-h-[30rem] ${
            activeSection === "about"
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
            isScrolled || activeSection === "about"
              ? "opacity-0 translate-y-full pointer-events-none"
              : "opacity-100 translate-y-0"
          }`}
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
        >
          <AboutSection
            isExpanded={false}
            animateIn={true}
            slides={aboutSlides}
            activeSlideIndex={activeAboutSlideIndex}
            isActive={activeSection === "hero"}
          />
        </div>

        {/* About Me Expanded Section - Shows on scroll */}
        <section
          ref={aboutSectionRef}
          className={`w-full flex items-center justify-center transition-all duration-900 max-[640px]:duration-700 ease-out min-h-[calc(100svh-72px)] ${
            activeSection === "about" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7 sm:translate-y-10"
          }`}
        >
          <AboutSection
            isExpanded={true}
            slides={aboutSlides}
            activeSlideIndex={activeAboutSlideIndex}
            onActiveSlideIndexChange={setActiveAboutSlideIndex}
            isActive={activeSection === "about"}
          />
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
