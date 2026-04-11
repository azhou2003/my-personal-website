import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope, FaChevronDown } from "react-icons/fa";
import Image from "next/image";
import IconLink from "./IconLink";

interface AboutSectionProps {
  isExpanded: boolean;
  animateIn?: boolean; // new prop for initial load animation
}

const AboutSection: React.FC<AboutSectionProps> = ({ isExpanded, animateIn }) => {  
  const [showCompactText, setShowCompactText] = React.useState(!isExpanded);

  React.useEffect(() => {
    if (!isExpanded && animateIn) {
      // Only delay on initial load
      const timer = setTimeout(() => setShowCompactText(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowCompactText(!isExpanded);
    }
  }, [isExpanded, animateIn]);

  if (!isExpanded) {
    return (
      <div
        className={`w-full flex justify-center px-3 sm:px-4 pt-1.5 sm:pt-2 transition-all ${animateIn ? 'duration-1000' : 'duration-200'} ease-out ${showCompactText ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}
      >
        <div className="w-[min(92vw,23rem)] bg-background-light/96 dark:bg-background-dark/96 border border-[var(--color-tab-border)] rounded-full px-3.5 sm:px-5 py-1.5 sm:py-2 shadow-[0_8px_22px_rgba(43,34,24,0.16)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.34)] backdrop-blur-[2px]">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-1.5 sm:gap-3">
            <div className="flex gap-1 sm:gap-2.5 flex-shrink-0">
              <IconLink
                href="mailto:anjie.zhou2003@gmail.com"
                aria-label="Email"
                className="scale-95 sm:scale-100"
                icon={<FaEnvelope className="w-[1.35rem] h-[1.35rem] sm:w-[1.35rem] sm:h-[1.35rem]" />}
              />
              <IconLink
                href="https://github.com/azhou2003"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="scale-95 sm:scale-100"
                icon={<FaGithub className="w-[1.35rem] h-[1.35rem] sm:w-[1.35rem] sm:h-[1.35rem]" />}
              />
              <IconLink
                href="https://www.linkedin.com/in/anjiezhouhtx/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="scale-95 sm:scale-100"
                icon={<FaLinkedin className="w-[1.35rem] h-[1.35rem] sm:w-[1.35rem] sm:h-[1.35rem]" />}
              />
            </div>
            <div className="flex-1 min-w-0 text-center leading-none">
              <p className="text-[0.58rem] sm:text-[0.63rem] uppercase tracking-[0.16em] text-foreground-light/70 dark:text-foreground-dark/70 mb-0.5">
                About Me
              </p>
              <h3 className="text-[0.92rem] sm:text-[1rem] font-semibold tracking-[0.01em] text-foreground-light dark:text-foreground-dark whitespace-nowrap">
                Get to know me!
              </h3>
            </div>
            <div className="text-foreground-light dark:text-foreground-dark text-[1.05rem] sm:text-[1.2rem] font-bold drop-shadow-sm animate-bounce-slow [animation-duration:3.1s] sm:[animation-duration:2.4s] flex-shrink-0">
              <FaChevronDown className="w-[1.05rem] h-[1.05rem] sm:w-[1.2rem] sm:h-[1.2rem]" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    );
  }  
  return (
    <section className="w-full max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-7 lg:py-10">
      <div className="grid xl:grid-cols-2 gap-3 sm:gap-7 lg:gap-10 items-center">
        <div className="flex flex-col items-center space-y-3 sm:space-y-6 order-2 xl:order-1">
          <div className="relative">
            <Image 
              src="/houston.jpeg" 
              alt="Picture of Downtown Houston" 
              width={352}
              height={480}
              className="w-36 sm:w-64 lg:w-72 xl:w-[22rem] h-44 sm:h-80 lg:h-[24rem] xl:h-[30rem] object-cover rounded-3xl shadow-2xl select-none" 
              draggable="false"
            />
            <div className="absolute -top-1 sm:-top-4 -right-1 sm:-right-4 w-3 sm:w-8 h-3 sm:h-8 bg-accent-yellow rounded-full opacity-80"></div>
            <div className="absolute -bottom-1 sm:-bottom-4 -left-1 sm:-left-4 w-2.5 sm:w-6 h-2.5 sm:h-6 bg-accent-yellow/60 rounded-full"></div>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-7 order-1 xl:order-2 text-center xl:text-left">
          <div>
            <style jsx>{`
              @keyframes gradient {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              .gradient-text-light {
                background: var(--color-about-gradient-light);
                background-size: 300% 100%;
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: gradient 6s ease infinite;
              }
              .gradient-text-dark {
                background: var(--color-about-gradient-dark);
                background-size: 300% 100%;
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: gradient 6s ease infinite;
              }
            `}</style>
            <h2 className="text-[1.7rem] sm:text-4xl lg:text-[2.8rem] font-bold mb-2 sm:mb-4 text-foreground-light dark:text-foreground-dark leading-tight">
              Hey, I&apos;m <span className="gradient-text-light dark:hidden">Anjie</span><span className="hidden dark:inline gradient-text-dark">Anjie</span>.
            </h2>
            <div className="w-12 sm:w-20 lg:w-24 h-1 bg-accent-yellow rounded-full mb-2 sm:mb-6 mx-auto xl:mx-0"></div>
          </div>

          <div className="space-y-2.5 sm:space-y-5 text-[0.9rem] sm:text-lg leading-[1.45] sm:leading-relaxed text-foreground-light dark:text-foreground-dark max-w-xl mx-auto xl:mx-0">
            <p>
                I grew up in Houston, but currently I&apos;m a software engineer working in Austin.
            </p>
            <p>
                When I&apos;m not being a couch potato, I enjoy bouldering, reading (fantasy, sci-fi at the moment), video games (arpgs are my favorite), and superhero media.
            </p>
          </div>
          <div className="w-14 sm:w-24 lg:w-32 border-t-2 border-dotted border-gray-400 dark:border-gray-600 mx-auto xl:mx-0"></div>
          <div className="space-y-2 sm:space-y-4">
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
      </div>
    </section>
  );
};

export default AboutSection;
