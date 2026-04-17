import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope, FaChevronDown, FaChevronLeft, FaChevronRight, FaExternalLinkAlt, FaGoodreadsG, FaPenNib, FaSteam } from "react-icons/fa";
import Image from "next/image";
import IconLink from "./IconLink";
import type { AboutSlide, AboutSlideLink } from "../lib/types";

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

  const getSlideMetrics = React.useCallback(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return null;

    const trackEl = scrollEl.firstElementChild as HTMLElement | null;
    const firstSlide = trackEl?.querySelector<HTMLElement>("[data-about-slide]");
    const slideWidth = firstSlide?.getBoundingClientRect().width ?? scrollEl.clientWidth;
    const gapValue = trackEl ? window.getComputedStyle(trackEl).columnGap || window.getComputedStyle(trackEl).gap : "0";
    const gap = Number.parseFloat(gapValue) || 0;

    return {
      slideWidth,
      gap,
    };
  }, []);

  const updateActiveSlideIndex = React.useCallback(() => {
    const scrollEl = scrollRef.current;
    const metrics = getSlideMetrics();
    if (!scrollEl || !metrics || aboutSlides.length === 0) return;

    const snapDistance = metrics.slideWidth + metrics.gap;
    const rawIndex = Math.round(scrollEl.scrollLeft / snapDistance);
    const nextIndex = Math.max(0, Math.min(aboutSlides.length - 1, rawIndex));
    setResolvedActiveSlideIndex(nextIndex);
  }, [aboutSlides.length, getSlideMetrics, setResolvedActiveSlideIndex]);

  const scrollToSlide = React.useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const scrollEl = scrollRef.current;
    const metrics = getSlideMetrics();
    if (!scrollEl || !metrics || aboutSlides.length === 0) return;

    const nextIndex = ((index % aboutSlides.length) + aboutSlides.length) % aboutSlides.length;
    const snapDistance = metrics.slideWidth + metrics.gap;

    scrollEl.scrollTo({
      left: nextIndex * snapDistance,
      behavior,
    });
  }, [aboutSlides.length, getSlideMetrics]);

  const scrollBySlide = React.useCallback((direction: -1 | 1) => {
    if (aboutSlides.length === 0) return;

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
    if (!isExpanded || !isActive || activeSlideIndex !== undefined) return;
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    updateActiveSlideIndex();
    scrollEl.addEventListener("scroll", updateActiveSlideIndex, { passive: true });
    window.addEventListener("resize", updateActiveSlideIndex);

    return () => {
      scrollEl.removeEventListener("scroll", updateActiveSlideIndex);
      window.removeEventListener("resize", updateActiveSlideIndex);
    };
  }, [isExpanded, isActive, activeSlideIndex, updateActiveSlideIndex]);

  React.useEffect(() => {
    if (!isExpanded || !isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
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
  }, [isExpanded, isActive, scrollBySlide]);

  React.useEffect(() => {
    if (!isExpanded || activeSlideIndex === undefined || aboutSlides.length === 0) return;
    scrollToSlide(activeSlideIndex, "auto");
  }, [isExpanded, activeSlideIndex, aboutSlides.length, scrollToSlide]);

  if (!isExpanded) {
    return (
      <div
        className={`w-full flex justify-center px-3 sm:px-4 pt-1.5 sm:pt-2 transition-all ${animateIn ? 'duration-1000' : 'duration-200'} ease-out ${showCompactText ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}
      >
        <div className="w-[min(92vw,23rem)] lg:w-[min(74vw,30rem)] bg-background-light/96 dark:bg-background-dark/96 border border-[var(--color-tab-border)] rounded-full px-3.5 sm:px-5 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 shadow-[0_8px_22px_rgba(43,34,24,0.16)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.34)] backdrop-blur-[2px]">
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
                  icon={iconByKey[link.icon]}
                />
              ))}
            </div>
            <div className="flex-1 min-w-0 text-center leading-none">
              <p className="text-[0.58rem] sm:text-[0.63rem] lg:text-[0.7rem] uppercase tracking-[0.2em] text-foreground-light/65 dark:text-foreground-dark/65 mb-0.5 font-medium">
                Scroll To
              </p>
              <h3 className="text-[0.95rem] sm:text-[1.05rem] lg:text-[1.18rem] font-semibold tracking-[0.015em] text-foreground-light dark:text-foreground-dark whitespace-nowrap">
                {compactPillText}
              </h3>
            </div>
            <div className="text-foreground-light dark:text-foreground-dark text-[1.05rem] sm:text-[1.2rem] lg:text-[1.35rem] font-bold drop-shadow-sm animate-bounce-slow [animation-duration:3.1s] sm:[animation-duration:2.4s] flex-shrink-0">
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
    <section className="w-full max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-7 lg:py-10">
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .gradient-text-name {
          display: inline;
          color: #7a5a36;
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

      <div className="relative px-5 sm:px-8" data-active-slide={resolvedActiveSlideIndex}>
        <button
          type="button"
          onClick={() => scrollBySlide(-1)}
          aria-label="Previous section"
          className="absolute left-0 top-1/2 z-20 -translate-y-1/2 text-foreground-light/65 dark:text-foreground-dark/65 transition-opacity hover:opacity-100 opacity-75 cursor-pointer"
        >
          <FaChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => scrollBySlide(1)}
          aria-label="Next section"
          className="absolute right-0 top-1/2 z-20 -translate-y-1/2 text-foreground-light/65 dark:text-foreground-dark/65 transition-opacity hover:opacity-100 opacity-75 cursor-pointer"
        >
          <FaChevronRight className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
        </button>

        <div
          ref={scrollRef}
          className="overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="grid grid-flow-col auto-cols-[100%] gap-4 sm:gap-6">
            {aboutSlides.map((slide, index) => {
              const linksToRender = slide.links ?? defaultSlideLinks;

              return (
                <article
                  key={slide.id}
                  data-about-slide
                  className="snap-center snap-always rounded-[1.75rem] bg-background-light/80 dark:bg-background-dark/80 p-4 sm:p-6 lg:p-8 min-h-[30rem] sm:min-h-[34rem]"
                >
                <div className="grid xl:grid-cols-2 gap-4 sm:gap-7 lg:gap-10 xl:items-center">
                  <div className="order-1 xl:hidden text-center">
                    <p className="text-[0.65rem] sm:text-xs uppercase tracking-[0.2em] text-foreground-light/65 dark:text-foreground-dark/65 mb-1.5 sm:mb-2.5 font-medium">
                      {slide.eyebrow}
                    </p>
                    <h2 className="text-[1.55rem] sm:text-4xl lg:text-[2.6rem] font-bold mb-2 sm:mb-4 pb-[0.06em] text-foreground-light dark:text-foreground-dark leading-[1.15]">
                      {index === 0 ? (
                        <>
                          Hey, I&apos;m <span className="gradient-text-name">Anjie</span>.
                        </>
                      ) : (
                        slide.title
                      )}
                    </h2>
                    <div className="w-12 sm:w-20 lg:w-24 h-1 bg-accent-yellow rounded-full mb-1 sm:mb-2 mx-auto"></div>
                  </div>

                  <div className="flex flex-col items-center order-2 xl:order-1">
                    {slide.imageSrc ? (
                      <div className="relative">
                        <Image
                          src={slide.imageSrc}
                          alt={slide.imageAlt}
                          width={352}
                          height={480}
                          quality={95}
                          sizes="(min-width: 1280px) 22rem, (min-width: 1024px) 18rem, (min-width: 640px) 16rem, 12rem"
                          className="w-56 sm:w-64 lg:w-72 xl:w-[22rem] h-72 sm:h-80 lg:h-[24rem] xl:h-[30rem] object-cover rounded-3xl select-none"
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
                      <div className="w-56 sm:w-64 lg:w-72 xl:w-[22rem] h-72 sm:h-80 lg:h-[24rem] xl:h-[30rem] rounded-3xl bg-gradient-to-br from-accent-yellow/30 via-[#f6eec8] to-accent-orange/40 dark:from-accent-yellow/20 dark:via-[#41372e] dark:to-accent-orange/20 p-4 sm:p-6 flex flex-col justify-between">
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

                  <div className="space-y-3 sm:space-y-7 order-3 xl:order-2 text-center xl:text-left">
                    <div className="hidden xl:block">
                      <p className="text-[0.65rem] sm:text-xs uppercase tracking-[0.2em] text-foreground-light/65 dark:text-foreground-dark/65 mb-1.5 sm:mb-2.5 font-medium">
                        {slide.eyebrow}
                      </p>
                      <h2 className="text-[1.55rem] sm:text-4xl lg:text-[2.6rem] font-bold mb-2 sm:mb-4 pb-[0.06em] text-foreground-light dark:text-foreground-dark leading-[1.15]">
                        {index === 0 ? (
                          <>
                            Hey, I&apos;m <span className="gradient-text-name">Anjie</span>.
                          </>
                        ) : (
                          slide.title
                        )}
                      </h2>
                      <div className="w-12 sm:w-20 lg:w-24 h-1 bg-accent-yellow rounded-full mb-2 sm:mb-4 xl:mb-0 mx-auto xl:mx-0"></div>
                    </div>

                    <div className="space-y-2.5 sm:space-y-5 text-[0.98rem] sm:text-lg leading-7 sm:leading-relaxed text-foreground-light dark:text-foreground-dark max-w-[34ch] sm:max-w-xl mx-auto xl:mx-0">
                      {slide.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>

                    {linksToRender.length > 0 && (
                      <>
                        <div className="w-14 sm:w-24 lg:w-32 border-t-2 border-dotted border-gray-400 dark:border-gray-600 mx-auto xl:mx-0"></div>
                        <div className="flex gap-3 sm:gap-6 justify-center xl:justify-start">
                          {linksToRender.map((link) => (
                            <IconLink
                              key={`${slide.id}-${link.label}-${link.href}`}
                              href={link.href}
                              target={link.external ? "_blank" : undefined}
                              rel={link.external ? "noopener noreferrer" : undefined}
                              aria-label={link.label}
                              icon={iconByKey[link.icon]}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
