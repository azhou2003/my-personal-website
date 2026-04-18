"use client";
import { useState, useEffect } from "react";

interface TypingAnimationProps {
  text: string;
  className?: string;
  speed?: number;
  showCursor?: boolean;
}

export default function TypingAnimation({ 
  text, 
  className = "", 
  speed = 100,
  showCursor = true 
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursorBlink, setShowCursorBlink] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (showCursor) {
      // Start cursor blinking after typing is complete
      const blinkInterval = setInterval(() => {
        setShowCursorBlink(prev => !prev);
      }, 530);

      return () => clearInterval(blinkInterval);
    }
  }, [currentIndex, text, speed, showCursor]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && (
        <span 
          className={`inline-block w-0.5 h-[1em] bg-current ml-1 ${
            currentIndex >= text.length 
              ? (showCursorBlink ? 'opacity-100' : 'opacity-0') 
              : 'opacity-100'
          } transition-opacity duration-100`}
        />
      )}
    </span>
  );
}
