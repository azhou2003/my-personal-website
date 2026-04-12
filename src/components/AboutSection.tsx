import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope, FaChevronDown, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Image from "next/image";
import IconLink from "./IconLink";
import type { AboutSlide } from "../lib/types";

interface AboutSectionProps {
  isExpanded: boolean;
  animateIn?: boolean; // new prop for initial load animation
  slides?: AboutSlide[];
}

const AboutSection: React.FC<AboutSectionProps> = ({ isExpanded, animateIn, slides = [] }) => {  
  const [showCompactText, setShowCompactText] = React.useState(!isExpanded);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const aboutSlides = slides;

  const updateScrollState = React.useCallback(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const maxScrollLeft = scrollEl.scrollWidth - scrollEl.clientWidth;
    setCanScrollLeft(scrollEl.scrollLeft > 4);
    setCanScrollRight(scrollEl.scrollLeft < maxScrollLeft - 4);
  }, []);

  const scrollBySlide = React.useCallback((direction: -1 | 1) => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const trackEl = scrollEl.firstElementChild as HTMLElement | null;
    const firstSlide = trackEl?.querySelector<HTMLElement>("[data-about-slide]");
    const slideWidth = firstSlide?.getBoundingClientRect().width ?? scrollEl.clientWidth;
    const gapValue = trackEl ? window.getComputedStyle(trackEl).columnGap || window.getComputedStyle(trackEl).gap : "0";
    const gap = Number.parseFloat(gapValue) || 0;

    scrollEl.scrollBy({
      left: direction * (slideWidth + gap),
      behavior: "smooth",
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
    if (!isExpanded) return;
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    updateScrollState();
    scrollEl.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      scrollEl.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [isExpanded, updateScrollState]);

  if (!isExpanded) {
    return (
      <div
        className={`w-full flex justify-center px-3 sm:px-4 pt-1.5 sm:pt-2 transition-all ${animateIn ? 'duration-1000' : 'duration-200'} ease-out ${showCompactText ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}
      >
        <div className="w-[min(92vw,23rem)] lg:w-[min(74vw,30rem)] bg-background-light/96 dark:bg-background-dark/96 border border-[var(--color-tab-border)] rounded-full px-3.5 sm:px-5 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 shadow-[0_8px_22px_rgba(43,34,24,0.16)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.34)] backdrop-blur-[2px]">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-1.5 sm:gap-3 lg:gap-4">
            <div className="flex gap-1 sm:gap-2.5 lg:gap-3 flex-shrink-0">
              <IconLink
                href="mailto:anjie.zhou2003@gmail.com"
                aria-label="Email"
                className="scale-95 sm:scale-100"
                icon={<FaEnvelope className="w-[1.35rem] h-[1.35rem] lg:w-[1.5rem] lg:h-[1.5rem]" />}
              />
              <IconLink
                href="https://github.com/azhou2003"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="scale-95 sm:scale-100"
                icon={<FaGithub className="w-[1.35rem] h-[1.35rem] lg:w-[1.5rem] lg:h-[1.5rem]" />}
              />
              <IconLink
                href="https://www.linkedin.com/in/anjiezhouhtx/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="scale-95 sm:scale-100"
                icon={<FaLinkedin className="w-[1.35rem] h-[1.35rem] lg:w-[1.5rem] lg:h-[1.5rem]" />}
              />
            </div>
            <div className="flex-1 min-w-0 text-center leading-none">
              <p className="text-[0.58rem] sm:text-[0.63rem] lg:text-[0.7rem] uppercase tracking-[0.2em] text-foreground-light/65 dark:text-foreground-dark/65 mb-0.5 font-medium">
                Scroll To
              </p>
              <h3 className="text-[0.95rem] sm:text-[1.05rem] lg:text-[1.18rem] font-semibold tracking-[0.015em] text-foreground-light dark:text-foreground-dark whitespace-nowrap">
                Meet Anjie
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
          display: inline-block;
          color: #7a5a36;
          background: var(--color-about-gradient);
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient 6s ease infinite;
        }
      `}</style>

      <div className="relative px-5 sm:px-8">
        <button
          type="button"
          onClick={() => scrollBySlide(-1)}
          aria-label="Previous section"
          disabled={!canScrollLeft}
          className="absolute left-0 top-1/2 z-20 -translate-y-1/2 text-foreground-light/65 dark:text-foreground-dark/65 transition-opacity disabled:opacity-30 enabled:hover:opacity-100 enabled:opacity-70"
        >
          <FaChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => scrollBySlide(1)}
          aria-label="Next section"
          disabled={!canScrollRight}
          className="absolute right-0 top-1/2 z-20 -translate-y-1/2 text-foreground-light/65 dark:text-foreground-dark/65 transition-opacity disabled:opacity-30 enabled:hover:opacity-100 enabled:opacity-70"
        >
          <FaChevronRight className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
        </button>

        <div
          ref={scrollRef}
          className="overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="grid grid-flow-col auto-cols-[100%] gap-4 sm:gap-6">
            {aboutSlides.map((slide, index) => (
              <article
                key={slide.id}
                data-about-slide
                className="snap-center snap-always rounded-[1.75rem] bg-background-light/80 dark:bg-background-dark/80 p-4 sm:p-6 lg:p-8 min-h-[30rem] sm:min-h-[34rem]"
              >
                <div className="grid xl:grid-cols-2 gap-4 sm:gap-7 lg:gap-10 items-center h-full">
                  <div className="flex flex-col items-center order-2 xl:order-1">
                    {index === 0 ? (
                      <div className="relative">
                        <Image
                          src={slide.imageSrc}
                          alt={slide.imageAlt}
                          width={352}
                          height={480}
                          className="w-48 sm:w-64 lg:w-72 xl:w-[22rem] h-60 sm:h-80 lg:h-[24rem] xl:h-[30rem] object-cover rounded-3xl select-none"
                          draggable="false"
                        />
                        <div className="absolute -top-1 sm:-top-4 -right-1 sm:-right-4 w-3 sm:w-8 h-3 sm:h-8 bg-accent-yellow rounded-full opacity-80"></div>
                        <div className="absolute -bottom-1 sm:-bottom-4 -left-1 sm:-left-4 w-2.5 sm:w-6 h-2.5 sm:h-6 bg-accent-yellow/60 rounded-full"></div>
                      </div>
                    ) : (
                      <div className="w-48 sm:w-64 lg:w-72 xl:w-[22rem] h-60 sm:h-80 lg:h-[24rem] xl:h-[30rem] rounded-3xl bg-gradient-to-br from-accent-yellow/30 via-[#f6eec8] to-accent-orange/40 dark:from-accent-yellow/20 dark:via-[#41372e] dark:to-accent-orange/20 p-4 sm:p-6 flex flex-col justify-between">
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

                  <div className="space-y-3 sm:space-y-7 order-1 xl:order-2 text-center xl:text-left">
                    <div>
                      <p className="text-[0.65rem] sm:text-xs uppercase tracking-[0.2em] text-foreground-light/65 dark:text-foreground-dark/65 mb-1.5 sm:mb-2.5 font-medium">
                        {slide.eyebrow}
                      </p>
                      <h2 className="text-[1.55rem] sm:text-4xl lg:text-[2.6rem] font-bold mb-2 sm:mb-4 text-foreground-light dark:text-foreground-dark leading-tight">
                        {index === 0 ? (
                          <>
                            Hey, I&apos;m <span className="gradient-text-name">Anjie</span>.
                          </>
                        ) : (
                          slide.title
                        )}
                      </h2>
                      <div className="w-12 sm:w-20 lg:w-24 h-1 bg-accent-yellow rounded-full mb-2 sm:mb-6 mx-auto xl:mx-0"></div>
                    </div>

                    <div className="space-y-2.5 sm:space-y-5 text-[0.9rem] sm:text-lg leading-[1.45] sm:leading-relaxed text-foreground-light dark:text-foreground-dark max-w-xl mx-auto xl:mx-0">
                      {slide.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>

                    <div className="w-14 sm:w-24 lg:w-32 border-t-2 border-dotted border-gray-400 dark:border-gray-600 mx-auto xl:mx-0"></div>
                    <div className="flex gap-3 sm:gap-6 justify-center xl:justify-start">
                      <IconLink
                        href="mailto:anjie.zhou2003@gmail.com"
                        aria-label="Email"
                        icon={<FaEnvelope className="w-6 h-6" />}
                      />
                      <IconLink
                        href="https://github.com/azhou2003"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        icon={<FaGithub className="w-6 h-6" />}
                      />
                      <IconLink
                        href="https://www.linkedin.com/in/anjiezhouhtx/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        icon={<FaLinkedin className="w-6 h-6" />}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
