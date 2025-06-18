import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
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
    // Compact tab view
    return (
      <div
        className={`w-full flex justify-center py-3 sm:py-4 px-4 transition-all ${animateIn ? 'duration-1000' : 'duration-200'} ease-out ${showCompactText ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}
        style={{ bottom: '3.5rem' }}
      >
        <div className="bg-background-light dark:bg-background-dark border-2 border-foreground-light dark:border-foreground-dark rounded-full px-4 sm:px-6 py-2 sm:py-3 shadow-xl max-w-sm">
          <style jsx>{`
            .gradient-text-light {
              background: linear-gradient(90deg, #665c1d, #7a4a36, #3f4a36, #665c1d);
              background-size: 300% 100%;
              -webkit-background-clip: text;
              background-clip: text;
              -webkit-text-fill-color: transparent;
              animation: gradient 6s ease infinite;
            }
            .gradient-text-dark {
              background: linear-gradient(90deg, #ffe066, #ffb385, #b7c7a3, #ffe066);
              background-size: 300% 100%;
              -webkit-background-clip: text;
              background-clip: text;
              -webkit-text-fill-color: transparent;
              animation: gradient 6s ease infinite;
            }
            @keyframes gradient {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}</style>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Icon links on the left in compact version */}
            <div className="flex gap-2 sm:gap-3 flex-shrink-0">
              <IconLink
                href="mailto:anjie.zhou2003@gmail.com"
                aria-label="Email"
                icon={<FaEnvelope />}
              />
              <IconLink
                href="https://github.com/azhou2003"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                icon={<FaGithub />}
              />
              <IconLink
                href="https://www.linkedin.com/in/anjiezhouhtx/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                icon={<FaLinkedin />}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-semibold truncate">
                <span className="gradient-text-light dark:hidden">Get to know me!</span>
                <span className="hidden dark:inline gradient-text-dark">Get to know me!</span>
              </h3>
            </div>
            <div className="text-accent-yellow text-xl sm:text-2xl font-extrabold drop-shadow-md animate-bounce-slow flex-shrink-0">
              ↓
            </div>
          </div>
        </div>
      </div>
    );
  }  // Expanded full view
  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 pb-24 sm:pb-32 lg:pb-48">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left: Portrait and Visual Elements */}
        <div className="flex flex-col items-center space-y-6 order-2 lg:order-1">
          <div className="relative">
            {/* Portrait image with responsive sizing */}
            <Image 
              src="/houston.jpeg" 
              alt="Picture of Downtown Houston" 
              width={352}
              height={480}
              className="w-64 sm:w-72 lg:w-[22rem] h-80 sm:h-96 lg:h-[30rem] object-cover rounded-3xl shadow-2xl select-none" 
              draggable="false"
            />
            {/* Floating accent elements */}
            <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-6 sm:w-8 h-6 sm:h-8 bg-accent-yellow rounded-full opacity-80"></div>
            <div className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 w-4 sm:w-6 h-4 sm:h-6 bg-accent-yellow/60 rounded-full"></div>
          </div>
        </div>

        {/* Right: Content */}        <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
          <div>
            <style jsx>{`
              @keyframes gradient {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              .gradient-text-light {
                background: linear-gradient(90deg, #665c1d, #7a4a36, #3f4a36, #665c1d);
                background-size: 300% 100%;
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: gradient 6s ease infinite;
              }
              .gradient-text-dark {
                background: linear-gradient(90deg, #ffe066, #ffb385, #b7c7a3, #ffe066);
                background-size: 300% 100%;
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: gradient 6s ease infinite;
              }
            `}</style>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground-light dark:text-foreground-dark">
              Hello, I'm <span className="gradient-text-light dark:hidden">Anjie</span><span className="hidden dark:inline gradient-text-dark">Anjie</span>.
            </h2>
            <div className="w-16 sm:w-20 lg:w-24 h-1 bg-accent-yellow rounded-full mb-4 sm:mb-6"></div>
          </div>

          <div className="space-y-4 sm:space-y-6 text-base sm:text-lg leading-relaxed text-foreground-light dark:text-foreground-dark">
            <p>
                Hey, I&apos;m <span className="font-semibold text-accent-yellow">Anjie Zhou</span>, 
                a recent Computer Science graduate from Texas A&M, originally from Houston. 
            </p>
            <p>
                I&apos;m pursuing a career in software development, especially in full-stack, cybersecurity/cryptography, 
                or AI, but I&apos;m open to any role where I get to build impactful software.
            </p>
          </div>
          <div className="w-20 sm:w-24 lg:w-32 border-t-2 border-dotted border-gray-400 dark:border-gray-600"></div>  
          {/* Contact Section */}
          <div className="space-y-4">
            <div className="flex gap-4 sm:gap-6">
              <IconLink
                href="mailto:anjie.zhou2003@gmail.com"
                aria-label="Email"
                icon={<FaEnvelope />}
              />
              <IconLink
                href="https://github.com/azhou2003"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                icon={<FaGithub />}
              />
              <IconLink
                href="https://www.linkedin.com/in/anjiezhouhtx/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                icon={<FaLinkedin />}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
