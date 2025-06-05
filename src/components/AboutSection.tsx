import React from "react";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import TagList from "./TagList";
import IconLink from "./IconLink";

interface AboutSectionProps {
  isExpanded: boolean;
}

const AboutSection: React.FC<AboutSectionProps> = ({ isExpanded }) => {  if (!isExpanded) {
    // Compact tab view
    return (      <div
        className="w-full flex justify-center py-4"
        style={{ bottom: '3.5rem' }}
      >        <div className="bg-background-light dark:bg-background-dark border-2 border-foreground-light dark:border-foreground-dark rounded-full px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden select-none">
              <img 
                src="/flat-cartoon-earth.jpg" 
                alt="Earth" 
                className="w-full h-full object-cover"
                draggable="false"
              />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground-light dark:text-foreground-dark">
                Get to know me!
              </h3>
            </div>
            <div className="text-accent-yellow text-2xl ml-2 font-extrabold drop-shadow-md animate-bounce-slow">
              ↓
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Expanded full view
  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-16 pb-48">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Portrait and Visual Elements */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">            {/* Portrait image with no background or border, fills the space */}
            <img 
              src="/houston.jpeg" 
              alt="Picture of Downtown Houston" 
              className="w-[22rem] h-[30rem] object-cover rounded-3xl shadow-2xl select-none" 
              draggable="false"
            />
            {/* Floating accent elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-accent-yellow rounded-full opacity-80"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-accent-yellow/60 rounded-full"></div>
          </div>
        </div>

        {/* Right: Content */}
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground-light dark:text-foreground-dark">
              About <span className="text-accent-yellow">Me</span>
            </h2>
            <div className="w-24 h-1 bg-accent-yellow rounded-full mb-6"></div>
          </div>          <div className="space-y-6 text-lg leading-relaxed text-foreground-light dark:text-foreground-dark">
            <p>
                Hi! I'm <span className="font-semibold text-accent-yellow">Anjie Zhou</span>, 
                a recent Computer Science graduate from Texas A&M, originally from Houston. 
            </p>
            <p>
                I'm pursuing a career in software development, especially in full-stack, cybersecurity/cryptography, 
                or AI, but I'm open to any role where I get to build impactful software.
            </p>
          </div>
          <div className="w-32 border-t-2 border-dotted border-gray-400 dark:border-gray-600"></div>  
          {/* Contact Section */}
          <div className="space-y-4">
            <div className="flex gap-6">
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
