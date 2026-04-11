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
  radiusX: 260,
  radiusY: 260,
  centralRadius: 142,
  planetSize: 44,
});

// Responsive orbit dimensions based on viewport
const getResponsiveOrbitDimensions = (): OrbitDimensions => {
  if (typeof window === 'undefined') {
    return getDefaultOrbitDimensions();
  }
  
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const minDimension = Math.min(vw, vh);
  
  let scale: number;
  if (minDimension < 380) {
    scale = 0.55;
  } else if (minDimension < 480) {
    scale = 0.66;
  } else if (minDimension < 640) {
    scale = 0.76;
  } else if (minDimension < 768) {
    scale = 0.82;
  } else if (minDimension < 1024) {
    scale = 0.96;
  } else {
    scale = Math.min(1.4, minDimension / 820);
  }

  return {
    radiusX: Math.max(130, Math.floor(260 * scale)),
    radiusY: Math.max(130, Math.floor(260 * scale)),
    centralRadius: Math.max(86, Math.floor(142 * scale)),
    planetSize: Math.max(28, Math.floor(44 * scale)),
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
        top: `calc(${sceneCenterY} + ${pos.y}px)`,
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
  const svgSize = Math.max(Math.floor(dimensions.radiusX * 2.75), 420);
  const halfSvgSize = svgSize / 2;
  const sceneCenterY =
    dimensions.centralRadius >= 150
      ? "50%"
      : dimensions.centralRadius < 100
        ? "58%"
        : dimensions.centralRadius < 125
          ? "55%"
          : "53%";

  return (
    <section key={isClient ? 'client' : 'server'} className="relative flex items-center justify-center w-full h-full min-h-0 p-2 sm:p-4 m-0 overflow-hidden">
      {orbitPathBack && (
        <svg
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
          style={{
            width: `${svgSize}px`,
            height: `${svgSize}px`,
            top: sceneCenterY,
          }}
          viewBox={`-${halfSvgSize} -${halfSvgSize} ${svgSize} ${svgSize}`}
        >
          <polyline
            points={orbitPathBack}
            fill="none"
            stroke="#7f746455"
            strokeDasharray="2 7"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
        </svg>
      )}

      <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
        {renderPlanet(upperRightPos, '/flat-cartoon-earth.jpg')}
      </div>

      <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
        {renderPlanet(lowerLeftPos, '/flat-cartoon-mars.jpg')}
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-[6]"
        style={{
          top: sceneCenterY,
          width: `${Math.floor(dimensions.centralRadius * 2.7)}px`,
          height: `${Math.floor(dimensions.centralRadius * 2.7)}px`,
          background:
            "radial-gradient(circle, rgba(255, 214, 157, 0.28) 0%, rgba(255, 214, 157, 0.12) 38%, rgba(255, 214, 157, 0) 72%)",
          filter: "blur(2px)",
        }}
      />
      <div
        className="absolute left-1/2 z-10 transform -translate-x-1/2 -translate-y-1/2"
        style={{
          top: sceneCenterY,
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
      </div>
      {isClient && (
        <svg
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
          style={{
            width: `${svgSize}px`,
            height: `${svgSize}px`,
            top: sceneCenterY,
          }}
          viewBox={`-${halfSvgSize} -${halfSvgSize} ${svgSize} ${svgSize}`}
        >
          <polyline
            points={orbitPathFront}
            fill="none"
            stroke="#9b8d796e"
            strokeDasharray="2 7"
            strokeLinecap="round"
            strokeWidth="1.7"
          />
        </svg>
      )}
    </section>
  );
};

export default HeroSection;
