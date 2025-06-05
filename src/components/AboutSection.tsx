import React from "react";
import TagList from "./TagList";

interface AboutSectionProps {
  isExpanded: boolean;
}

const AboutSection: React.FC<AboutSectionProps> = ({ isExpanded }) => {  if (!isExpanded) {
    // Compact tab view
    return (
      <div className="w-full flex justify-center py-4">
        <div className="bg-background-light dark:bg-background-dark border border-gray-300 dark:border-gray-600 rounded-full px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 text-xs font-medium select-none">
              AZ
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground-light dark:text-foreground-dark">
                Hey, I'm Anjie!
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
    <section className="w-full max-w-6xl mx-auto px-4 py-16">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Portrait and Visual Elements */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            {/* Portrait image with no background or border, fills the space */}
            <img 
              src="https://example.com/your-portrait-here.png" 
              alt="add portrait later" 
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
          </div>

          <div className="space-y-6 text-lg leading-relaxed text-foreground-light dark:text-foreground-dark">
            <p>
              Hi! I'm <span className="font-semibold text-accent-yellow">Anjie Zhou</span>, 
              a recent Computer Science Graduate from Texas A&M looking for a career in 
              Software Development. 
            </p>
            <p>
            </p>
          </div>

          {/* Skills/Interests Tags */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark">
              What I'm passionate about
            </h3>
            <TagList
              tags={['Computers', 'Books', 'Exercise', 'Counter-Strike', 'Chicken']}
            />
          </div>

          {/* CTA Section */}
          <div className="pt-6">
            <p className="text-accent-yellow font-semibold mb-4">
              Ready to explore my work?
            </p>
            <div className="flex gap-4">
              <a
                href="/portfolio"
                className="px-6 py-2 rounded-full bg-accent-sage text-foreground-light dark:text-foreground-dark font-semibold shadow hover:bg-accent-yellow transition-colors transform hover:scale-105 focus:scale-105 duration-200"
              >
                Portfolio
              </a>
              <a
                href="/blog"
                className="px-6 py-2 rounded-full bg-accent-sage text-foreground-light dark:text-foreground-dark font-semibold shadow hover:bg-accent-yellow transition-colors transform hover:scale-105 focus:scale-105 duration-200"
              >
                Blog
              </a>
              <a
                href="/resume"
                className="px-6 py-2 rounded-full bg-accent-sage text-foreground-light dark:text-foreground-dark font-semibold shadow hover:bg-accent-yellow transition-colors transform hover:scale-105 focus:scale-105 duration-200"
              >
                Resume
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
