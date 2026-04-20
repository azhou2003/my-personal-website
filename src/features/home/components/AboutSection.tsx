import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope, FaChevronDown, FaChevronLeft, FaChevronRight, FaExternalLinkAlt, FaGoodreadsG, FaPenNib, FaSteam } from "react-icons/fa";
import Image from "next/image";
import { createPortal } from "react-dom";
import { IconLink } from "@/components/ui";
import type { AboutSlide, AboutSlideLink } from "@/lib/types";

interface AboutSectionProps {
  isExpanded: boolean;
  animateIn?: boolean; // new prop for initial load animation
  slides?: AboutSlide[];
  activeSlideIndex?: number;
  onActiveSlideIndexChange?: (index: number) => void;
  isActive?: boolean;
}

const AboutSection: React.FC<AboutSectionProps> = ({
  isExpanded,
  animateIn,
  slides = [],
  activeSlideIndex,
  onActiveSlideIndexChange,
  isActive = true,
}) => {
  const [showCompactText, setShowCompactText] = React.useState(!isExpanded);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [internalActiveSlideIndex, setInternalActiveSlideIndex] = React.useState(0);
  const [descriptionModalSlideId, setDescriptionModalSlideId] = React.useState<string | null>(null);
  const slideNavLockRef = React.useRef(false);
  const slideNavUnlockTimerRef = React.useRef<number | null>(null);
  const isActiveRef = React.useRef(isActive);
  const readFullTriggerRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  const defaultSlideLinks: AboutSlideLink[] = [
    {
      label: "Email",
      href: "mailto:anjie.zhou2003@gmail.com",
      icon: "email",
    },
    {
      label: "GitHub",
      href: "https://github.com/azhou2003",
      icon: "github",
      external: true,
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/anjiezhouhtx/",
      icon: "linkedin",
      external: true,
    },
  ];

  const iconByKey: Record<AboutSlideLink["icon"], React.ReactNode> = {
    email: <FaEnvelope className="w-6 h-6" />,
    github: <FaGithub className="w-6 h-6" />,
    linkedin: <FaLinkedin className="w-6 h-6" />,
    external: <FaExternalLinkAlt className="w-5 h-5" />,
    goodreads: <FaGoodreadsG className="w-6 h-6" />,
    blog: <FaPenNib className="w-5 h-5" />,
    steam: <FaSteam className="w-6 h-6" />,
  };

  const aboutSlides = slides;
  const resolvedActiveSlideIndex = activeSlideIndex ?? internalActiveSlideIndex;

  const setResolvedActiveSlideIndex = React.useCallback(
    (nextIndex: number) => {
      if (activeSlideIndex === undefined) {
        setInternalActiveSlideIndex(nextIndex);
      }
      onActiveSlideIndexChange?.(nextIndex);
    },
    [activeSlideIndex, onActiveSlideIndexChange]
  );

  React.useEffect(() => {
    if (aboutSlides.length === 0) return;
    const clampedIndex = Math.max(0, Math.min(resolvedActiveSlideIndex, aboutSlides.length - 1));
    if (clampedIndex !== resolvedActiveSlideIndex) {
      setResolvedActiveSlideIndex(clampedIndex);
    }
  }, [aboutSlides.length, resolvedActiveSlideIndex, setResolvedActiveSlideIndex]);

  const getSlideElements = React.useCallback(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return [];
    const trackEl = scrollEl.firstElementChild as HTMLElement | null;
    if (!trackEl) return [];
    return Array.from(trackEl.querySelectorAll<HTMLElement>("[data-about-slide]"));
  }, []);

  const updateActiveSlideIndex = React.useCallback(() => {
    const scrollEl = scrollRef.current;
    const slideEls = getSlideElements();
    if (!scrollEl || slideEls.length === 0 || aboutSlides.length === 0) return;

    const viewportCenter = scrollEl.scrollLeft + scrollEl.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    slideEls.forEach((slideEl, index) => {
      const slideCenter = slideEl.offsetLeft + slideEl.offsetWidth / 2;
      const distance = Math.abs(viewportCenter - slideCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    const nextIndex = Math.max(0, Math.min(aboutSlides.length - 1, closestIndex));
    setResolvedActiveSlideIndex(nextIndex);
  }, [aboutSlides.length, getSlideElements, setResolvedActiveSlideIndex]);

  const scrollToSlide = React.useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const scrollEl = scrollRef.current;
    const slideEls = getSlideElements();
    if (!scrollEl || slideEls.length === 0 || aboutSlides.length === 0) return;

    const nextIndex = ((index % aboutSlides.length) + aboutSlides.length) % aboutSlides.length;
    const targetSlide = slideEls[nextIndex];
    if (!targetSlide) return;

    const centeredLeft = targetSlide.offsetLeft - (scrollEl.clientWidth - targetSlide.offsetWidth) / 2;
    const maxScrollLeft = Math.max(0, scrollEl.scrollWidth - scrollEl.clientWidth);
    const clampedLeft = Math.max(0, Math.min(maxScrollLeft, centeredLeft));

    scrollEl.scrollTo({
      left: clampedLeft,
      behavior,
    });
  }, [aboutSlides.length, getSlideElements]);

  const scrollBySlide = React.useCallback((direction: -1 | 1) => {
    if (aboutSlides.length === 0) return;
    if (slideNavLockRef.current) return;

    slideNavLockRef.current = true;
    if (slideNavUnlockTimerRef.current !== null) {
      window.clearTimeout(slideNavUnlockTimerRef.current);
    }
    slideNavUnlockTimerRef.current = window.setTimeout(() => {
      slideNavLockRef.current = false;
      slideNavUnlockTimerRef.current = null;
    }, 320);

    const nextIndex =
      direction === 1
        ? (resolvedActiveSlideIndex + 1) % aboutSlides.length
        : (resolvedActiveSlideIndex - 1 + aboutSlides.length) % aboutSlides.length;

    setResolvedActiveSlideIndex(nextIndex);
    scrollToSlide(nextIndex);
  }, [aboutSlides.length, resolvedActiveSlideIndex, scrollToSlide, setResolvedActiveSlideIndex]);

  const activeSlide = aboutSlides[resolvedActiveSlideIndex];
  const compactPillText = activeSlide?.pillText?.trim() || "Meet Anjie";
  const compactLinksToRender = activeSlide?.links ?? defaultSlideLinks;
  const showNavControls = aboutSlides.length > 1;

  const modalSlide = aboutSlides.find((slide) => slide.id === descriptionModalSlideId) ?? null;

  const closeDescriptionModal = React.useCallback(() => {
    setDescriptionModalSlideId((currentSlideId) => {
      if (currentSlideId && typeof window !== "undefined") {
        window.requestAnimationFrame(() => {
          readFullTriggerRefs.current[currentSlideId]?.focus();
        });
      }
      return null;
    });
  }, []);

  React.useEffect(() => {
    if (!isExpanded && animateIn) {
      // Only delay on initial load
      const timer = setTimeout(() => setShowCompactText(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowCompactText(!isExpanded);
    }
  }, [isExpanded, animateIn]);

  React.useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  React.useEffect(() => {
    if (!isExpanded || !isActive) return;
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const isControlled = activeSlideIndex !== undefined;
    const allowControlledScrollSync =
      typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches;
    if (isControlled && !allowControlledScrollSync) return;

    updateActiveSlideIndex();
    scrollEl.addEventListener("scroll", updateActiveSlideIndex, { passive: true });
    window.addEventListener("resize", updateActiveSlideIndex);

    return () => {
      scrollEl.removeEventListener("scroll", updateActiveSlideIndex);
      window.removeEventListener("resize", updateActiveSlideIndex);
    };
  }, [isExpanded, isActive, activeSlideIndex, updateActiveSlideIndex]);

  React.useEffect(() => {
    if (!isExpanded) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isActiveRef.current) return;

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      const isTypingTarget =
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (isTypingTarget) return;

      if (event.key === " " || event.key === "Spacebar" || event.key === "ArrowRight") {
        event.preventDefault();
        scrollBySlide(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollBySlide(-1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded, scrollBySlide]);

  React.useEffect(() => {
    if (!isExpanded || activeSlideIndex === undefined || aboutSlides.length === 0) return;
    scrollToSlide(activeSlideIndex, "auto");
  }, [isExpanded, activeSlideIndex, aboutSlides.length, scrollToSlide]);

  React.useEffect(() => {
    if (!isExpanded) {
      setDescriptionModalSlideId(null);
    }
  }, [isExpanded]);

  React.useEffect(() => {
    if (!descriptionModalSlideId || typeof document === "undefined") return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [descriptionModalSlideId]);

  React.useEffect(() => {
    if (!descriptionModalSlideId) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeDescriptionModal();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [closeDescriptionModal, descriptionModalSlideId]);

  React.useEffect(() => {
    return () => {
      if (slideNavUnlockTimerRef.current !== null) {
        window.clearTimeout(slideNavUnlockTimerRef.current);
      }
    };
  }, []);

  if (!isExpanded) {
    return (
      <div
        className={`w-full flex justify-center px-3 sm:px-4 pt-1.5 sm:pt-2 transition-all ${animateIn ? 'duration-1000' : 'duration-200'} ease-out ${showCompactText ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}
      >
        <div className="w-[min(92vw,23rem)] lg:w-[min(74vw,30rem)] bg-[var(--color-compact-pill-bg)] border border-[var(--color-compact-pill-border)] rounded-full px-3.5 sm:px-5 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 shadow-[var(--color-compact-pill-shadow)]">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-1.5 sm:gap-3 lg:gap-4">
            <div className="flex gap-1 sm:gap-2.5 lg:gap-3 flex-shrink-0">
              {compactLinksToRender.map((link) => (
                <IconLink
                  key={`${link.label}-${link.href}`}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  aria-label={link.label}
                  className="scale-95 sm:scale-100"
                  iconClassName="!text-[var(--color-compact-pill-icon)] hover:!text-[var(--color-compact-pill-icon-hover)] hover:scale-110"
                  icon={iconByKey[link.icon]}
                />
              ))}
            </div>
            <div className="flex-1 min-w-0 text-center leading-none">
              <p className="text-[0.58rem] sm:text-[0.63rem] lg:text-[0.7rem] uppercase tracking-[0.2em] text-[var(--color-compact-pill-kicker)] mb-0.5 font-medium">
                Scroll To
              </p>
              <h3 className="text-[0.95rem] sm:text-[1.05rem] lg:text-[1.18rem] font-semibold tracking-[0.015em] text-[var(--color-compact-pill-title)] whitespace-nowrap">
                {compactPillText}
              </h3>
            </div>
            <div className="text-[var(--color-compact-pill-arrow)] text-[1.05rem] sm:text-[1.2rem] lg:text-[1.35rem] font-bold opacity-85 flex-shrink-0">
              <FaChevronDown className="w-[1.05rem] h-[1.05rem] sm:w-[1.2rem] sm:h-[1.2rem] lg:w-[1.35rem] lg:h-[1.35rem]" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    );
  }  

  if (aboutSlides.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-0 sm:py-8 lg:py-12 min-h-[calc(100svh-72px)] sm:min-h-0 flex items-center">
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .gradient-text-name {
          display: inline;
          color: var(--color-gradient-text-fallback);
          background: var(--color-about-gradient);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          padding-bottom: 0.08em;
          line-height: 1.15;
          animation: gradient 6s ease infinite;
        }
      `}</style>

      <div className="relative w-full px-0 sm:px-10" data-active-slide={resolvedActiveSlideIndex}>
        {showNavControls && (
          <>
            <button
              type="button"
              onClick={() => scrollBySlide(-1)}
              aria-label="Previous section"
              className="hidden sm:flex absolute -left-11 md:-left-14 lg:-left-[4.25rem] top-1/2 z-20 -translate-y-1/2 h-12 w-12 lg:h-14 lg:w-14 items-center justify-center rounded-full border text-[var(--color-about-surface-icon)] transition-all hover:scale-105 hover:text-[var(--color-about-surface-icon-hover)] hover:opacity-100 opacity-80 cursor-pointer backdrop-blur-sm"
              style={{
                background: "var(--color-about-control-bg)",
                borderColor: "var(--color-about-control-border)",
                boxShadow: "var(--color-about-control-shadow-left)",
              }}
            >
              <FaChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollBySlide(1)}
              aria-label="Next section"
              className="hidden sm:flex absolute -right-11 md:-right-14 lg:-right-[4.25rem] top-1/2 z-20 -translate-y-1/2 h-12 w-12 lg:h-14 lg:w-14 items-center justify-center rounded-full border text-[var(--color-about-surface-icon)] transition-all hover:scale-105 hover:text-[var(--color-about-surface-icon-hover)] hover:opacity-100 opacity-80 cursor-pointer backdrop-blur-sm"
              style={{
                background: "var(--color-about-control-bg)",
                borderColor: "var(--color-about-control-border)",
                boxShadow: "var(--color-about-control-shadow-right)",
              }}
            >
              <FaChevronRight className="w-5 h-5 lg:w-6 lg:h-6" aria-hidden="true" />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          className="overflow-x-auto scroll-smooth snap-x snap-mandatory sm:snap-proximity pb-2 sm:pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="grid grid-flow-col auto-cols-[100%] gap-3 sm:gap-5 lg:gap-6">
            {aboutSlides.map((slide, index) => {
              const linksToRender = slide.links ?? defaultSlideLinks;
              const isCurrentSlide = index === resolvedActiveSlideIndex;

              return (
                <div
                  key={slide.id}
                  data-about-slide
                  className={`snap-center snap-always px-1.5 sm:px-2.5 py-4 sm:py-5 lg:py-0 min-h-[calc(100svh-72px)] lg:min-h-0 flex items-center justify-center transition-opacity duration-300 ease-out ${isCurrentSlide ? "sm:opacity-100" : "sm:opacity-90"}`}
                >
                  <div className="w-full max-w-[24rem] sm:max-w-[31rem] lg:max-w-none mx-auto lg:grid lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-center lg:gap-0 xl:gap-1">
                    <div className="hidden lg:flex lg:justify-center lg:translate-x-8 xl:translate-x-10 lg:relative lg:z-20">
                      {slide.imageSrc ? (
                        <div
                          className="relative rounded-3xl overflow-hidden border"
                          style={{
                            borderColor: "var(--color-about-image-frame)",
                            background: "color-mix(in srgb, var(--color-about-surface-bg) 88%, transparent)",
                            boxShadow: "var(--color-about-surface-shadow-card)",
                          }}
                        >
                          <Image
                            src={slide.imageSrc}
                            alt={slide.imageAlt}
                            width={352}
                            height={480}
                            quality={95}
                            sizes="(min-width: 1280px) 22rem, 18rem"
                            className="w-[21rem] h-[29rem] object-cover select-none"
                            style={{ objectPosition: slide.imagePosition ?? "center" }}
                            draggable="false"
                          />
                          {index === 0 && (
                            <>
                              <div className="absolute -top-4 -right-4 w-8 h-8 bg-accent-yellow rounded-full opacity-80"></div>
                              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-accent-yellow/60 rounded-full"></div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="w-[22rem] h-[30rem] rounded-3xl p-6 flex flex-col justify-between" style={{ background: "var(--color-about-placeholder-gradient)", boxShadow: "var(--color-about-surface-shadow-card)" }}>
                          <span className="text-sm uppercase tracking-[0.14em] text-foreground-light/75 dark:text-foreground-dark/75">
                            {slide.imageAlt}
                          </span>
                          <div className="space-y-3">
                            <div className="h-3 rounded-full bg-foreground-light/30 dark:bg-foreground-dark/30"></div>
                            <div className="h-3 rounded-full bg-foreground-light/25 dark:bg-foreground-dark/25 w-10/12"></div>
                            <div className="h-3 rounded-full bg-foreground-light/20 dark:bg-foreground-dark/20 w-7/12"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="relative z-10">
                    <div className="lg:hidden relative z-20 flex justify-center mb-[-0.95rem] sm:mb-[-1.2rem]">
                      {slide.imageSrc ? (
                        <div
                          className="relative rounded-3xl overflow-hidden border"
                          style={{
                            borderColor: "var(--color-about-image-frame)",
                            background: "color-mix(in srgb, var(--color-about-surface-bg) 88%, transparent)",
                            boxShadow: "var(--color-about-surface-shadow-card)",
                          }}
                        >
                          <Image
                            src={slide.imageSrc}
                            alt={slide.imageAlt}
                            width={352}
                            height={480}
                            quality={95}
                            sizes="(min-width: 1024px) 18rem, (min-width: 640px) 16rem, 12rem"
                            className="w-56 sm:w-64 lg:w-[19rem] h-[clamp(10.5rem,28svh,16rem)] sm:h-[clamp(12rem,30svh,18rem)] lg:h-[24rem] object-cover select-none"
                            style={{ objectPosition: slide.imagePosition ?? "center" }}
                            draggable="false"
                          />
                          {index === 0 && (
                            <>
                              <div className="absolute -top-1 sm:-top-4 -right-1 sm:-right-4 w-3 sm:w-8 h-3 sm:h-8 bg-accent-yellow rounded-full opacity-80"></div>
                              <div className="absolute -bottom-1 sm:-bottom-4 -left-1 sm:-left-4 w-2.5 sm:w-6 h-2.5 sm:h-6 bg-accent-yellow/60 rounded-full"></div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="w-56 sm:w-64 lg:w-72 h-[clamp(10.5rem,28svh,16rem)] sm:h-[clamp(12rem,30svh,18rem)] lg:h-[24rem] rounded-3xl p-4 sm:p-6 flex flex-col justify-between" style={{ background: "var(--color-about-placeholder-gradient)", boxShadow: "var(--color-about-surface-shadow-card)" }}>
                          <span className="text-xs sm:text-sm uppercase tracking-[0.14em] text-foreground-light/75 dark:text-foreground-dark/75">
                            {slide.imageAlt}
                          </span>
                          <div className="space-y-2 sm:space-y-3">
                            <div className="h-2.5 sm:h-3 rounded-full bg-foreground-light/30 dark:bg-foreground-dark/30"></div>
                            <div className="h-2.5 sm:h-3 rounded-full bg-foreground-light/25 dark:bg-foreground-dark/25 w-10/12"></div>
                            <div className="h-2.5 sm:h-3 rounded-full bg-foreground-light/20 dark:bg-foreground-dark/20 w-7/12"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="w-full lg:max-w-[34rem] xl:max-w-[36rem] lg:justify-self-start rounded-[1.75rem]" style={{ boxShadow: "var(--color-about-surface-shadow-card)" }}>
                      <article
                        className="relative rounded-[1.75rem] border p-3.5 pt-5 pb-4 sm:p-8 lg:py-10 lg:pl-[2.75rem] lg:pr-[0.5rem] xl:pl-[3.25rem] xl:pr-[1.5rem] min-h-0 h-[clamp(15rem,40svh,20rem)] sm:h-[clamp(16.5rem,41svh,22rem)] lg:h-[31rem] xl:h-[33rem] overflow-visible lg:overflow-hidden"
                        style={{
                          background: "var(--color-about-surface-bg)",
                          borderColor: "var(--color-about-surface-border)",
                        }}
                      >
                        <div className={`h-full flex flex-col gap-2.5 sm:gap-7 text-center xl:text-left transition-opacity duration-300 ease-out ${isCurrentSlide ? "sm:opacity-100" : "sm:opacity-95"}`}>
                          <div className="xl:hidden text-center">
                            <p className="text-[0.6rem] sm:text-xs uppercase tracking-[0.2em] text-[var(--color-about-surface-kicker)] mb-1 sm:mb-3 font-medium">
                              {slide.eyebrow}
                            </p>
                            <h2 className="text-[1.52rem] sm:text-4xl lg:text-[2.6rem] font-bold mb-1.5 sm:mb-4 pb-[0.04em] text-[var(--color-about-surface-title)] leading-[1.1]">
                              {index === 0 ? (
                                <>
                                  Hey, I&apos;m <span className="gradient-text-name">Anjie</span>.
                                </>
                              ) : (
                                slide.title
                              )}
                            </h2>
                            <div className="w-12 sm:w-20 lg:w-24 h-1 bg-accent-yellow rounded-full mb-0 sm:mb-1 mx-auto"></div>
                          </div>

                          <div className="hidden xl:block">
                            <p className="text-[0.64rem] sm:text-xs uppercase tracking-[0.22em] text-[var(--color-about-surface-kicker)] mb-2 sm:mb-3 font-medium">
                              {slide.eyebrow}
                            </p>
                            <h2 className="text-[1.7rem] sm:text-4xl lg:text-[2.7rem] font-bold mb-3 sm:mb-4 pb-[0.06em] text-[var(--color-about-surface-title)] leading-[1.1]">
                              {index === 0 ? (
                                <>
                                  Hey, I&apos;m <span className="gradient-text-name">Anjie</span>.
                                </>
                              ) : (
                                slide.title
                              )}
                            </h2>
                            <div className="w-16 sm:w-20 lg:w-24 h-1 bg-accent-yellow rounded-full mb-2 sm:mb-4 xl:mb-0 mx-auto xl:mx-0"></div>
                          </div>

                          <div
                            className="lg:hidden mx-auto max-w-[36ch] sm:max-w-[46ch] text-foreground-light/95 dark:text-foreground-dark/95 cursor-pointer"
                            role="button"
                            tabIndex={0}
                            aria-label={`Open full description for ${slide.title}`}
                            onClick={() => setDescriptionModalSlideId(slide.id)}
                            onKeyDown={(event) => {
                              if (event.key !== "Enter" && event.key !== " ") return;
                              event.preventDefault();
                              setDescriptionModalSlideId(slide.id);
                            }}
                          >
                            <p className="text-[0.95rem] sm:text-[1.02rem] leading-6 sm:leading-relaxed whitespace-normal break-words line-clamp-4">
                              {slide.paragraphs.join(" ")}
                            </p>
                            <button
                              type="button"
                              onClick={() => setDescriptionModalSlideId(slide.id)}
                              ref={(node) => {
                                readFullTriggerRefs.current[slide.id] = node;
                              }}
                              className="mt-[-1px] inline-flex h-[0.62rem] items-center p-0 m-0 border-0 bg-transparent align-top text-[0.58rem] leading-none uppercase tracking-[0.14em] font-medium text-[var(--color-about-surface-kicker)] transition-all hover:text-[var(--color-about-surface-title)]"
                            >
                              <span className="leading-none">Read More</span>
                            </button>
                          </div>

                          <div className="hidden lg:block pr-1 space-y-2 sm:space-y-5 text-[0.95rem] sm:text-[1.02rem] lg:text-lg leading-6 sm:leading-relaxed text-foreground-light/95 dark:text-foreground-dark/95 max-w-[36ch] sm:max-w-[46ch] lg:max-w-none mx-auto xl:mx-0 whitespace-normal break-words lg:pr-0">
                            {slide.paragraphs.map((paragraph) => (
                              <p key={paragraph}>{paragraph}</p>
                            ))}
                          </div>

                          {linksToRender.length > 0 && (
                            <>
                              <div className="w-14 sm:w-24 lg:w-32 border-t-2 border-dotted mx-auto xl:mx-0" style={{ borderColor: "var(--color-about-surface-divider)" }}></div>
                              <div className="flex flex-wrap gap-2.5 sm:gap-4 justify-center xl:justify-start">
                                {linksToRender.map((link) => (
                                  <IconLink
                                    key={`${slide.id}-${link.label}-${link.href}`}
                                    href={link.href}
                                    target={link.external ? "_blank" : undefined}
                                    rel={link.external ? "noopener noreferrer" : undefined}
                                    aria-label={link.label}
                                    iconClassName="!w-6 !h-6 transform-gpu will-change-transform !text-[var(--color-about-surface-icon)] hover:!text-[var(--color-about-surface-icon-hover)] hover:scale-110"
                                    icon={iconByKey[link.icon]}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        {showNavControls && (
                          <div className="sm:hidden pointer-events-none absolute left-1/2 bottom-0 z-20 -translate-x-1/2 translate-y-1/2 inline-flex items-center gap-1 rounded-full border px-2 py-[0.28rem] text-[0.56rem] uppercase tracking-[0.18em] text-[var(--color-about-surface-kicker)] opacity-95"
                            style={{
                              background: "var(--color-about-surface-bg)",
                              borderColor: "var(--color-about-surface-border)",
                              boxShadow: "0 0 0 2px var(--color-about-surface-bg)",
                            }}
                          >
                            <FaChevronLeft className="h-2.5 w-2.5 opacity-80" aria-hidden="true" />
                            <span className="leading-none">Swipe</span>
                            <FaChevronRight className="h-2.5 w-2.5 opacity-80" aria-hidden="true" />
                          </div>
                        )}
                      </article>
                    </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
      {modalSlide && typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(18,14,10,0.66)] backdrop-blur-[2px] p-6 sm:p-8 lg:hidden"
            onClick={closeDescriptionModal}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`${modalSlide.title} full description`}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-[23rem] sm:max-w-[28rem] max-h-[min(84svh,37rem)] rounded-[1.6rem] border overflow-hidden flex flex-col"
              style={{
                background: "var(--color-about-surface-bg)",
                borderColor: "var(--color-about-surface-border)",
                boxShadow: "var(--color-about-surface-shadow-card)",
              }}
            >
              <div className="px-6 sm:px-7 pt-5 sm:pt-6 pb-2">
                <p className="text-[0.72rem] uppercase tracking-[0.18em] font-medium text-[var(--color-about-surface-kicker)]">
                  {modalSlide.eyebrow}
                </p>
              </div>

              <div className="px-6 sm:px-7 py-3.5 sm:py-4 overflow-y-auto space-y-3 text-[0.95rem] sm:text-[1.02rem] leading-6 sm:leading-relaxed text-foreground-light/95 dark:text-foreground-dark/95 whitespace-normal break-words [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {modalSlide.paragraphs.map((paragraph) => (
                  <p key={`${modalSlide.id}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
                ))}
              </div>

              <div className="px-6 sm:px-7 py-2.5">
                <button
                  type="button"
                  onClick={closeDescriptionModal}
                  className="w-full rounded-full border px-3 py-2 text-[0.64rem] uppercase tracking-[0.16em] font-medium text-[var(--color-about-surface-kicker)] transition-colors hover:text-[var(--color-about-surface-title)]"
                  style={{ borderColor: "var(--color-about-surface-border)" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
};

export default AboutSection;
