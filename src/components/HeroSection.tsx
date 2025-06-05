import React, { useState, useEffect } from "react";
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

const ORBIT_RADIUS_X = 450;
const ORBIT_RADIUS_Y = 450;
const ORBIT_ROTATION = 160;
const ORBIT_INCLINATION = -70;
const CENTRAL_RADIUS = 200;
const ORBIT_CENTER = { x: 0, y: 0 };
const ORBIT_ANGLES = {
  upperRight: 0,
  lowerLeft: 180,
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

function generateOrbitPath(startAngle: number, endAngle: number, steps: number = 100): string {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + ((endAngle - startAngle) * i) / steps;
    const pos = getOrbit3DPosition(
      ORBIT_CENTER,
      ORBIT_RADIUS_X,
      ORBIT_RADIUS_Y,
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

  // Initialize orbit paths on client only to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
    setOrbitPathFront(generateOrbitPath(180, 360)); // Front half when z >= 0
    setOrbitPathBack(generateOrbitPath(0, 180));   // Back half when z < 0
    // Start earth animation immediately
    setEarthAnimationKey(Date.now());
  }, []);

  useEffect(() => {
    if (!animateOrbit) return;
    const interval = setInterval(() => {
      setTestAngle((prev) => (prev + 1) % 360);
    }, 16);
    return () => clearInterval(interval);
  }, [animateOrbit]);
  const upperRightPos = getOrbit3DPosition(
    ORBIT_CENTER,
    ORBIT_RADIUS_X,
    ORBIT_RADIUS_Y,
    animateOrbit ? testAngle : ORBIT_ANGLES.upperRight,
    ORBIT_ROTATION,
    ORBIT_INCLINATION
  );
  const lowerLeftPos = getOrbit3DPosition(
    ORBIT_CENTER,
    ORBIT_RADIUS_X,
    ORBIT_RADIUS_Y,
    animateOrbit ? ((testAngle + 180) % 360) : ORBIT_ANGLES.lowerLeft,
    ORBIT_ROTATION,
    ORBIT_INCLINATION
  );  const renderPlanet = (pos: Position3D, planetTexture: string) => (
    <div
      className="absolute"
      style={{
        left: `calc(50% + ${pos.x}px)`,
        top: `calc(50% + ${pos.y}px)`,
        transform: "translate(-50%, -50%)",
        zIndex: pos.z >= 0 ? 35 : 15, // Dynamic z-index based on position
      }}
    >
      <div 
        key={earthAnimationKey} // Shared animation key for consistency
        className="w-16 h-16 rounded-full shadow-xl bg-cover bg-center"
        style={{
          backgroundImage: `url('${planetTexture}')`,
          backgroundSize: "300% 100%",
          animation: "earthSpin 8s linear infinite"
        }}
      />
    </div>
  );return (
    <section className="relative flex items-center justify-center w-full h-full min-h-0 p-0 m-0 overflow-x-clip">      {/* Back orbit path (z < 0) - behind central circle */}
      {isClient && (
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100vw,1600px)] h-[800px] pointer-events-none z-10"
          viewBox="-800 -400 1600 800"
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
      )}      {/* Earth orbiting ball - persists in DOM, z-index changes dynamically */}
      <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
        {renderPlanet(upperRightPos, '/flat-cartoon-earth.jpg')}
      </div>

      {/* Mars orbiting ball - persists in DOM, z-index changes dynamically */}
      <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
        {renderPlanet(lowerLeftPos, '/flat-cartoon-mars.jpg')}
      </div>

      {/* Central Circle - centered in viewport */}
      <div
        className="absolute left-1/2 top-1/2 z-20"
        style={{
          width: `${CENTRAL_RADIUS * 2}px`,
          height: `${CENTRAL_RADIUS * 2}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >        <div className="w-full h-full rounded-full bg-[#ff9f80] border-8 border-[#d4501f] shadow-2xl flex items-end justify-center relative" style={{ overflow: 'visible' }}>
          <div className="absolute left-0 top-0 w-full h-full rounded-full overflow-hidden" style={{ zIndex: 1 }}>
            <Image
              src="/portrait1.png"
              alt="Anjie Zhou headshot"
              width={600}
              height={600}
              className="w-[150%] h-[150%] object-cover object-center select-none -mt-40"
              style={{ minWidth: '100%', minHeight: '100%' }}
            />
          </div>
          <Image
            src="/portrait1.png"
            alt="Anjie Zhou headshot"
            width={600}
            height={600}
            className="w-[150%] h-[150%] object-cover object-center select-none -mt-40 absolute left-1/2 top-0"
            style={{ minWidth: '100%', minHeight: '100%', transform: 'translateX(-50%)', clipPath: 'inset(-9999px -9999px 50% -9999px)' }}
          />
        </div>
      </div>      {/* Front orbit path (z >= 0) - in front of central circle */}
      {isClient && (
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100vw,1600px)] h-[800px] pointer-events-none z-30"
          viewBox="-800 -400 1600 800"
        >
          <polyline
            points={orbitPathFront}
            fill="none"
            stroke="#99999955"
            strokeDasharray="2 6"
            strokeLinecap="round"
            strokeWidth="1.5"
          />        </svg>
      )}
    </section>
  );
};

export default HeroSection;
