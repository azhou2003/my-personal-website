"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Footer, Navbar } from "@/components/layout";
import { AboutSection, HeroSection, HomeHeroHeading } from "@/features/home/components";
import { HOME_ANIMATION_TIMINGS } from "@/lib/motion";
import type { AboutSlide } from "@/lib/types";

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

  const aboutSectionRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isSnappingRef = useRef(false);
  const activeSectionRef = useRef<"hero" | "about">("hero");
  const touchStartYRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const snapReleaseTimeoutRef = useRef<number | null>(null);
  const heroSettleTimeoutRef = useRef<number | null>(null);

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
      if (snapReleaseTimeoutRef.current !== null) {
        window.clearTimeout(snapReleaseTimeoutRef.current);
      }
      if (heroSettleTimeoutRef.current !== null) {
        window.clearTimeout(heroSettleTimeoutRef.current);
      }

      isSnappingRef.current = true;
      setActiveSection(section);
      scrollRoot.scrollTo({ top: targetTop, behavior: "smooth" });

      if (section === "hero" && window.matchMedia("(max-width: 767px)").matches) {
        heroSettleTimeoutRef.current = window.setTimeout(() => {
          scrollRoot.scrollTo({ top: 0, behavior: "auto" });
          window.requestAnimationFrame(() => {
            scrollRoot.scrollTop = 0;
          });
          heroSettleTimeoutRef.current = null;
        }, 460);
      }

      snapReleaseTimeoutRef.current = window.setTimeout(() => {
        isSnappingRef.current = false;
        snapReleaseTimeoutRef.current = null;
      }, 500);
    },
    [getTargetTop]
  );

  useEffect(() => {
    return () => {
      if (snapReleaseTimeoutRef.current !== null) {
        window.clearTimeout(snapReleaseTimeoutRef.current);
      }
      if (heroSettleTimeoutRef.current !== null) {
        window.clearTimeout(heroSettleTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== "hero" || aboutSlides.length === 0) return;

    const intervalId = window.setInterval(() => {
      setActiveAboutSlideIndex((prev) => (prev + 1) % aboutSlides.length);
    }, HOME_ANIMATION_TIMINGS.aboutPillRotateMs);

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
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
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
      if (isSnappingRef.current) {
        event.preventDefault();
        return;
      }

      if (activeSectionRef.current === "hero") {
        event.preventDefault();
      }

      if (Math.abs(event.deltaY) < 2) return;

      const aboutEl = aboutSectionRef.current;
      if (!aboutEl) return;
      const aboutTop = getTargetTop(aboutEl);
      const currentTop = scrollRoot.scrollTop;

      if (event.deltaY > 0 && activeSectionRef.current === "hero") {
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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      const isTypingTarget =
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (isTypingTarget) return;

      event.preventDefault();

      if (isSnappingRef.current) {
        return;
      }

      if (event.key === "ArrowDown" && activeSectionRef.current === "hero") {
        event.preventDefault();
        snapToSection("about");
      } else if (event.key === "ArrowUp" && activeSectionRef.current === "about") {
        event.preventDefault();
        snapToSection("hero");
      }
    };

    scrollRoot.addEventListener("scroll", handleScroll, { passive: true });
    scrollRoot.addEventListener("wheel", handleWheel, { passive: false });
    scrollRoot.addEventListener("touchstart", handleTouchStart, { passive: true });
    scrollRoot.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    handleScroll();

    return () => {
      if (currentFooterRef) {
        footerObserver.unobserve(currentFooterRef);
      }
      scrollRoot.removeEventListener("scroll", handleScroll);
      scrollRoot.removeEventListener("wheel", handleWheel);
      scrollRoot.removeEventListener("touchstart", handleTouchStart);
      scrollRoot.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
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
      className="h-[100dvh] min-h-[100svh] overflow-y-auto overscroll-y-none flex flex-col bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark transition-colors"
      style={{ "--home-nav-h": "72px" } as CSSProperties}
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
            id="hero"
          className={`w-full relative transition-all duration-800 ease-out h-[calc(100dvh-var(--home-nav-h,72px))] min-h-[30rem] ${
            activeSection === "about"
              ? "opacity-0 sm:-translate-y-10 pointer-events-none"
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
          className={`w-full flex items-center justify-center transition-all duration-900 max-[640px]:duration-700 ease-out min-h-[calc(100dvh-var(--home-nav-h,72px))] ${
            activeSection === "about" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-0 sm:translate-y-10"
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
