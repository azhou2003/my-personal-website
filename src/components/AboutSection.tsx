import React from "react";

const AboutSection = () => {
  return (
    <section className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 py-16">
      {/* Left: Portrait */}
      <div className="rounded-3xl bg-background-light dark:bg-background-dark shadow-lg p-4 flex items-center justify-center w-64 h-80 mb-6 md:mb-0">
        {/* Portrait placeholder */}
        <div className="w-48 h-64 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400 text-xl select-none">
          Portrait
        </div>
      </div>
      {/* Right: About + Nav Buttons */}
      <div className="flex-1 flex flex-col items-start gap-6">
        <h2 className="text-2xl font-bold mb-2 text-accent-yellow">About Me</h2>
        <p className="text-base sm:text-lg max-w-xl mb-4">
          Hi! I'm Anjie Zhou, a software developer passionate about computer science, cybersecurity, and creative world-building. I love building minimalist, expressive digital experiences.
        </p>
        <div className="mt-4">
          {/* Nav Buttons */}
          <div className="flex gap-4">
            {/* Buttons will be modular */}
            {/* NavButtons component will be used here */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
