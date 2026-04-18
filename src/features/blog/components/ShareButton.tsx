"use client";
import React, { useState } from "react";
import { FaShare } from "react-icons/fa";

interface ShareButtonProps {
  title: string;
  url?: string;
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ title, url, className = "" }) => {
  const [showNotification, setShowNotification] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const handleShare = async () => {
    const shareUrl = url || window.location.href;
    const shareData = {
      title: title,
      url: shareUrl,
    };

    try {
      // Try native Web Share API first (mobile/supported browsers)
      if (navigator.share) {
        await navigator.share(shareData);      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        setShowNotification(true);
        setIsExiting(false);
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => setShowNotification(false), 300); // Wait for exit animation
        }, 1000);
      }    } catch {
      // Fallback: copy to clipboard on error
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShowNotification(true);
        setIsExiting(false);
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => setShowNotification(false), 300); // Wait for exit animation
        }, 1000);
      } catch (clipboardError) {
        console.error("Share failed:", clipboardError);
      }
    }
  };  return (
    <>      {/* Top notification for clipboard copy feedback */}
      {showNotification && (
        <div 
          className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-3 bg-foreground-light dark:bg-foreground-dark text-background-light dark:text-background-dark text-sm rounded-xl border-2 border-accent-yellow shadow-lg z-50 transition-all duration-300 ease-out ${
            isExiting 
              ? '-translate-y-8 opacity-0' 
              : 'translate-y-0 opacity-100'
          }`}
        >
          Link copied to clipboard!
        </div>
      )}
      
      <button
        onClick={handleShare}
        className={`p-1 transition-transform duration-200 hover:scale-125 cursor-pointer ${className}`}
        aria-label={`Share ${title}`}
        type="button"
      >
        <FaShare className="w-5 h-5 text-accent-sage hover:text-accent-yellow transition-colors duration-200" />
      </button>
    </>
  );
};

export default ShareButton;
