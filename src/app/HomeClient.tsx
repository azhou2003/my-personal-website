"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import { useEffect, useRef, useState } from "react";

export default function HomeClient() {
  const [showAbout, setShowAbout] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showToMyWorld, setShowToMyWorld] = useState(false);
  const [startOrbit, setStartOrbit] = useState(false);
  const [showCompactText, setShowCompactText] = useState(false);
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);
  const aboutTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setShowAbout(entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0.3, // Adjust as needed for when to trigger
      }
    );
    if (aboutTriggerRef.current) {
      observer.observe(aboutTriggerRef.current);
    }
    return () => {
      if (aboutTriggerRef.current) {
        observer.unobserve(aboutTriggerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowWelcome(true), 300);
    const timer2 = setTimeout(() => setShowToMyWorld(true), 1000);
    const timer3 = setTimeout(() => setStartOrbit(true), 1700);
    const timer4 = setTimeout(() => setShowCompactText(true), 2000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  useEffect(() => {
    // Initial load: animate in after hero
    const timer = setTimeout(() => {
      setShowCompactText(true);
      setHasAnimatedIn(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark transition-colors">
      <Navbar />
      <main className="flex flex-1 flex-col items-center w-full">
        {/* Hero section */}
        <div
          className={`w-full relative transition-all duration-1000 ease-in-out ${
            showAbout
              ? "opacity-0 -translate-y-8 pointer-events-none"
              : "opacity-100 translate-y-0"
          }`}
          style={{ height: "calc(100vh - 64px)" }}
        >
          <HeroSection animateOrbit={startOrbit} />
          <div className="hero-title-container absolute inset-0 flex items-start justify-center pointer-events-none z-50 pt-8 sm:pt-12 md:pt-16 lg:pt-20">
            <div className="text-center px-4 sm:px-6 max-w-4xl">
              <h1 className="hero-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold text-foreground-light dark:text-foreground-dark drop-shadow-lg select-none leading-tight">
                <span className="inline-block">
                  {Array.from("Welcome...").map((char, i) => (
                    <span
                      key={i}
                      className={`inline-block transition-all duration-1000 ease-out ${
                        showWelcome
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-8"
                      }`}
                    >
                      {char}
                    </span>
                  ))}
                </span>
                <span className="inline-block">{'\u00A0'}</span>
                <span className="inline-block">
                  {Array.from("To").map((char, i) => (
                    <span
                      key={`to-${i}`}
                      className={`inline-block transition-all duration-1000 ease-out ${
                        showToMyWorld
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-8"
                      }`}
                    >
                      {char}
                    </span>
                  ))}
                </span>
                <span className="inline-block">{'\u00A0'}</span>
                <span className="inline-block">
                  {Array.from("My").map((char, i) => (
                    <span
                      key={`my-${i}`}
                      className={`inline-block transition-all duration-1000 ease-out ${
                        showToMyWorld
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-8"
                      }`}
                    >
                      {char}
                    </span>
                  ))}
                </span>
                <span className="inline-block">{'\u00A0'}</span>
                <span className="inline-block whitespace-nowrap">
                  {Array.from("World.").map((char, i) => (
                    <span
                      key={`world-${i}`}
                      className={`inline-block transition-all duration-1000 ease-out ${
                        showToMyWorld
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-8"
                      }`}
                    >
                      {char}
                    </span>
                  ))}
                </span>
              </h1>
            </div>
          </div>
        </div>
        {/* About Me Tab - Visible at bottom when not expanded */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-10 ${
            showAbout || !showCompactText
              ? "opacity-0 translate-y-8 pointer-events-none"
              : "opacity-100 translate-y-0"
          } transition-all duration-1000 ease-out`}
        >
          <AboutSection isExpanded={false} animateIn={!hasAnimatedIn} />
        </div>
        {/* Invisible trigger for intersection observer */}
        <div
          ref={aboutTriggerRef}
          style={{
            position: "absolute",
            top: "100vh",
            height: 1,
            width: "100%",
          }}
        />
        {/* About Me Expanded Section - Shows on scroll */}
        <section
          className={`w-full flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${
            showAbout
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-16 pointer-events-none"
          }`}
          aria-hidden={!showAbout}
        >
          <AboutSection isExpanded={true} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
