const STARS = Array.from({ length: 20 }, (_, index) => {
  const pseudoRandom = (seed: number) => {
    const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123;
    return value - Math.floor(value);
  };

  return {
    id: `global-star-${index}`,
    left: 3 + pseudoRandom(index * 97 + 11) * 94,
    top: 6 + pseudoRandom(index * 131 + 29) * 86,
    size: 1.3 + pseudoRandom(index * 149 + 53) * 1.6,
    duration: 3.3 + pseudoRandom(index * 181 + 67) * 4.6,
    delay: pseudoRandom(index * 211 + 83) * 4.8,
    maxOpacity: 0.48 + pseudoRandom(index * 239 + 97) * 0.24,
    showOnMobile: index < 10,
  };
});

export default function GlobalStars() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none hidden dark:block" aria-hidden>
      {STARS.map((star) => (
        <span
          key={star.id}
          className={`absolute rounded-full motion-reduce:animate-none ${star.showOnMobile ? "block" : "hidden sm:block"}`}
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: "rgba(255, 249, 232, 0.9)",
            boxShadow: "0 0 8px rgba(255, 235, 186, 0.68)",
            animation: `globalStarTwinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            opacity: 0.15,
            transform: "scale(0.84)",
            ["--star-max-opacity" as string]: star.maxOpacity,
          }}
        />
      ))}
    </div>
  );
}
