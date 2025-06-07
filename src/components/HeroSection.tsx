import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

// Type definitions
interface Position3D {
  x: number;
  y: number;
  z: number;
}

interface Position2D {
  x: number;
  y: number;
}

interface OrbitDimensions {
  radiusX: number;
  radiusY: number;
  centralRadius: number;
  planetSize: number;
}

const ORBIT_ROTATION = 160;
const ORBIT_INCLINATION = -70;
const ORBIT_CENTER = { x: 0, y: 0 };
const ORBIT_ANGLES = {
  upperRight: 0,
  lowerLeft: 180,
};

// Default dimensions for SSR
const getDefaultOrbitDimensions = (): OrbitDimensions => ({
  radiusX: 280,
  radiusY: 280,
  centralRadius: 150, // 50% bigger (100 * 1.5)
  planetSize: 48,
});

// Responsive orbit dimensions based on viewport
const getResponsiveOrbitDimensions = (): OrbitDimensions => {
  if (typeof window === 'undefined') {
    return getDefaultOrbitDimensions();
  }
  
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const minDimension = Math.min(vw, vh);
  
  // Improved scaling with better mobile support
  let scale: number;
  if (minDimension < 480) {
    // Mobile phones
    scale = 0.5;
  } else if (minDimension < 768) {
    // Tablets
    scale = 0.7;
  } else if (minDimension < 1024) {
    // Small desktops
    scale = 0.9;
  } else {
    // Large screens
    scale = Math.min(1.2, minDimension / 1000);
  }
    return {
    radiusX: Math.floor(280 * scale),
    radiusY: Math.floor(280 * scale),
    centralRadius: Math.floor(150 * scale), // 50% bigger (100 * 1.5)
    planetSize: Math.floor(48 * scale),
  };
};

function getOrbit3DPosition(
  center: Position2D, 
  rx: number, 
  ry: number, 
  angleDeg: number, 
  thetaDeg: number, 
  phiDeg: number
): Position3D {  const angleRad = (angleDeg * Math.PI) / 180;
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const phiRad = (phiDeg * Math.PI) / 180;

  const x0 = rx * Math.cos(angleRad);
  const y0 = ry * Math.sin(angleRad);
  const z0 = 0;

  const y1 = y0 * Math.cos(phiRad) - z0 * Math.sin(phiRad);
  const z1 = y0 * Math.sin(phiRad) + z0 * Math.cos(phiRad);
  const x1 = x0;

  const xFinal = x1 * Math.cos(thetaRad) - y1 * Math.sin(thetaRad);
  const yFinal = x1 * Math.sin(thetaRad) + y1 * Math.cos(thetaRad);

  return {
    x: center.x + xFinal,
    y: center.y + yFinal,
    z: z1,
  };
}

function generateOrbitPath(
  startAngle: number, 
  endAngle: number, 
  dimensions: OrbitDimensions,
  steps: number = 100
): string {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + ((endAngle - startAngle) * i) / steps;
    const pos = getOrbit3DPosition(
      ORBIT_CENTER,
      dimensions.radiusX,
      dimensions.radiusY,
      angle,
      ORBIT_ROTATION,
      ORBIT_INCLINATION
    );
    points.push(`${pos.x},${pos.y}`);
  }
  return points.join(" ");
}

const HeroSection: React.FC<{ animateOrbit?: boolean }> = ({ animateOrbit = false }) => {
  const [testAngle, setTestAngle] = useState(0);
  const [orbitPathFront, setOrbitPathFront] = useState<string>("");
  const [orbitPathBack, setOrbitPathBack] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [earthAnimationKey, setEarthAnimationKey] = useState(0);
  // Initialize with default dimensions to prevent hydration mismatch
  const [dimensions, setDimensions] = useState<OrbitDimensions>(getDefaultOrbitDimensions);

  // Update dimensions on resize
  const updateDimensions = useCallback(() => {
    if (typeof window !== 'undefined') {
      setDimensions(getResponsiveOrbitDimensions());
    }
  }, []);
  useEffect(() => {
    setIsClient(true);
    setEarthAnimationKey(Date.now());
    // Set responsive dimensions after client hydration
    updateDimensions();

    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);
  // Update orbit paths when dimensions change
  useEffect(() => {
    const defaultDims = getDefaultOrbitDimensions();
    const currentDims = isClient ? dimensions : defaultDims;
    
    setOrbitPathFront(generateOrbitPath(180, 360, currentDims)); // Front half when z >= 0
    setOrbitPathBack(generateOrbitPath(0, 180, currentDims));   // Back half when z < 0
  }, [dimensions, isClient]);

  useEffect(() => {
    if (!animateOrbit) return;
    const interval = setInterval(() => {
      setTestAngle((prev) => (prev + 1) % 360);
    }, 16);
    return () => clearInterval(interval);
  }, [animateOrbit]);

  const upperRightPos = getOrbit3DPosition(
    ORBIT_CENTER,
    dimensions.radiusX,
    dimensions.radiusY,
    animateOrbit ? testAngle : ORBIT_ANGLES.upperRight,
    ORBIT_ROTATION,
    ORBIT_INCLINATION
  );
  const lowerLeftPos = getOrbit3DPosition(
    ORBIT_CENTER,
    dimensions.radiusX,
    dimensions.radiusY,
    animateOrbit ? ((testAngle + 180) % 360) : ORBIT_ANGLES.lowerLeft,
    ORBIT_ROTATION,
    ORBIT_INCLINATION
  );
  const renderPlanet = (pos: Position3D, planetTexture: string) => (
    <div
      className="absolute"
      style={{
        left: `calc(50% + ${pos.x}px)`,
        top: `calc(50% + ${pos.y}px)`,
        transform: "translate(-50%, -50%)",
        zIndex: pos.z >= 0 ? 25 : 5, // Dynamic z-index based on position
      }}
    >
      <div 
        key={earthAnimationKey} // Shared animation key for consistency
        className="rounded-full shadow-xl bg-cover bg-center"
        style={{
          width: `${dimensions.planetSize}px`,
          height: `${dimensions.planetSize}px`,
          backgroundImage: `url('${planetTexture}')`,
          backgroundSize: "300% 100%",
          animation: "earthSpin 8s linear infinite"
        }}
      />
    </div>
  );
  // Calculate responsive SVG viewBox that matches planet positioning
  const svgSize = Math.max(dimensions.radiusX * 3, 600);
  const halfSvgSize = svgSize / 2;

  return (
    <section className="relative flex items-center justify-center w-full h-full min-h-0 p-4 m-0 overflow-hidden">      {/* Back orbit path (z < 0) - behind central circle */}
      {orbitPathBack && (
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
          style={{
            width: `${svgSize}px`,
            height: `${svgSize}px`,
          }}
          viewBox={`-${halfSvgSize} -${halfSvgSize} ${svgSize} ${svgSize}`}
        >
          <polyline
            points={orbitPathBack}
            fill="none"
            stroke="#99999955"
            strokeDasharray="2 6"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
        </svg>
      )}

      {/* Earth orbiting ball - persists in DOM, z-index changes dynamically */}
      <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
        {renderPlanet(upperRightPos, '/flat-cartoon-earth.jpg')}
      </div>

      {/* Mars orbiting ball - persists in DOM, z-index changes dynamically */}
      <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
        {renderPlanet(lowerLeftPos, '/flat-cartoon-mars.jpg')}
      </div>      {/* Central Circle - centered in viewport */}
      <div
        className="absolute left-1/2 top-1/2 z-10 transform -translate-x-1/2 -translate-y-1/2"
        style={{
          width: `${dimensions.centralRadius * 2}px`,
          height: `${dimensions.centralRadius * 2}px`,
        }}
      >        <div 
          className="w-full h-full rounded-full bg-[#ff9f80] border-4 sm:border-6 lg:border-8 border-[#d4501f] shadow-2xl relative" 
          style={{ overflow: 'visible' }}
        >          {/* Portrait image - positioned at bottom, clipped by circle at bottom only */}
          <Image
            src="/portrait1.png"
            alt="Anjie Zhou headshot"
            width={600}
            height={600}
            className="absolute left-1/2 bottom-0 transform -translate-x-1/2 object-cover object-top select-none"
            style={{ 
              width: `${dimensions.centralRadius * 2}px`,
              height: `${dimensions.centralRadius * 2.4}px`,
              clipPath: `ellipse(${dimensions.centralRadius}px ${dimensions.centralRadius}px at 50% ${dimensions.centralRadius * 1.4}px)`,
            }}
          />
        </div>
      </div>{/* Front orbit path (z >= 0) - in front of central circle */}
      {isClient && (
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
          style={{
            width: `${svgSize}px`,
            height: `${svgSize}px`,
          }}
          viewBox={`-${halfSvgSize} -${halfSvgSize} ${svgSize} ${svgSize}`}
        >
          <polyline
            points={orbitPathFront}
            fill="none"
            stroke="#99999955"
            strokeDasharray="2 6"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
        </svg>
      )}</section>
  );
};

export default HeroSection;
