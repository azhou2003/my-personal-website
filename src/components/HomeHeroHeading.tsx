import React from "react";

interface HomeHeroHeadingProps {
  showWelcome: boolean;
  showToMyWorld: boolean;
}

export default function HomeHeroHeading({ showWelcome, showToMyWorld }: HomeHeroHeadingProps) {
  return (
    <div className="hero-title-container absolute inset-0 flex items-start justify-center pointer-events-none z-50 pt-[clamp(0.75rem,4.5vh,3.5rem)]">
      <div className="text-center px-2 sm:px-6 max-w-3xl lg:max-w-none">
        <p className={`uppercase tracking-[0.18em] text-[0.68rem] sm:text-[0.72rem] text-[var(--color-hero-kicker)] mb-2 sm:mb-3 transition-all duration-700 ${showWelcome ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
          Anjie Zhou
        </p>
        <h1 className="hero-title font-extrabold text-foreground-light dark:text-foreground-dark drop-shadow-[0_6px_24px_rgba(0,0,0,0.22)] select-none leading-[1.1] tracking-[-0.02em] lg:whitespace-nowrap">
          <span className="block lg:inline">
            {Array.from("Welcome").map((char, i) => (
              <span
                key={i}
                className={`inline-block transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  showWelcome
                    ? "opacity-100 translate-y-0 blur-0"
                    : "opacity-0 translate-y-4 blur-[2px]"
                }`}
                style={{ transitionDelay: `${i * 28}ms` }}
              >
                {char}
              </span>
            ))}
          </span>
          <span className="hidden lg:inline">{"\u00A0"}</span>
          <span className="block lg:inline whitespace-nowrap">
            {Array.from("to My World.").map((char, i) => (
              <span
                key={`world-${i}`}
                className={`inline-block transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  showToMyWorld
                    ? "opacity-100 translate-y-0 blur-0"
                    : "opacity-0 translate-y-4 blur-[2px]"
                }`}
                style={{ transitionDelay: `${140 + i * 30}ms` }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </span>
        </h1>
        <p className={`mt-2 sm:mt-3 text-[0.86rem] sm:text-sm text-[var(--color-hero-subtitle)] transition-all duration-700 ${showToMyWorld ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
          Software Engineer | Financial Miser | Dreamer
        </p>
      </div>
    </div>
  );
}
