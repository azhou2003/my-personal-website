import React, { useState, useEffect } from "react";
import ScrollAnimationManager from "./ScrollAnimationManager";

// === ORBIT CONFIGURATION ===

// Horizontal orbit radius (X-axis stretch of ellipse)
const ORBIT_RADIUS_X = 450;

// Vertical orbit radius (Y-axis stretch of ellipse)
const ORBIT_RADIUS_Y = 450;

// Rotation around Z-axis (yaw), in degrees — rotates the orbit flat on the screen
const ORBIT_ROTATION = 150;

// Rotation around X-axis (pitch), in degrees — changes vertical inclination (0 = flat, 90 = line)
const ORBIT_INCLINATION = 60;

// Radius of central object (used for visual size of central circle)
const CENTRAL_RADIUS = 250;

// Y-offset to center the orbit slightly below true center of screen
const ORBIT_CENTER_OFFSET_Y = 40;
const ORBIT_CENTER = { x: 0, y: ORBIT_CENTER_OFFSET_Y };

// Angle positions (in degrees) for orbiting elements
const ORBIT_ANGLES = {
  upperRight: 205,
  lowerLeft: 25,
};

// === ELLIPSE MATH WITH 3D-LIKE ROTATION ===
function getOrbit3DPosition(center, rx, ry, angleDeg, thetaDeg, phiDeg) {
  const angleRad = (angleDeg * Math.PI) / 180;
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const phiRad = (phiDeg * Math.PI) / 180;

  let x0 = rx * Math.cos(angleRad);
  let y0 = ry * Math.sin(angleRad);
  let z0 = 0;

  let y1 = y0 * Math.cos(phiRad) - z0 * Math.sin(phiRad);
  let z1 = y0 * Math.sin(phiRad) + z0 * Math.cos(phiRad);
  let x1 = x0;

  const xFinal = x1 * Math.cos(thetaRad) - y1 * Math.sin(thetaRad);
  const yFinal = x1 * Math.sin(thetaRad) + y1 * Math.cos(thetaRad);

  return {
    x: center.x + xFinal,
    y: center.y + yFinal,
  };
}

function generateOrbitPath(startAngle, endAngle, steps = 100) {
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

const HeroSection = () => {
  const [animateOrbit, setAnimateOrbit] = useState(false);
  const [testAngle, setTestAngle] = useState(0);

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
  );

  const orbitPathFront = generateOrbitPath(0, 180);
  const orbitPathBack = generateOrbitPath(180, 360);

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[100vh] w-full py-20 overflow-x-clip">
      {/* Orbit Path - Back Half */}
      <svg
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(100vw,1600px)] h-[800px] pointer-events-none"
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

      {/* Central Circle + Headshot */}
      <div className="relative z-20 flex items-center justify-center w-full" style={{ minHeight: 480 }}>
        <div
          className="relative flex items-end justify-center"
          style={{
            top: 40,
            width: `${CENTRAL_RADIUS * 2}px`,
            height: `${CENTRAL_RADIUS * 2}px`,
          }}
          onMouseEnter={() => setAnimateOrbit(true)}
          onMouseLeave={() => setAnimateOrbit(false)}
        >
          <div className="w-full h-full rounded-full bg-accent-sage/80 border-8 border-accent-yellow shadow-2xl flex items-end justify-center">
            <div className="w-72 h-72 bg-gray-300 rounded-full mt-[-64px] border-4 border-white shadow-xl flex items-center justify-center text-3xl text-gray-500 select-none">
              Headshot
            </div>
          </div>
        </div>

        {/* Upper Right Ball */}
        <div
          className="absolute"
          style={{
            left: `calc(50% + ${upperRightPos.x}px)`,
            top: `calc(50% + ${upperRightPos.y}px)`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 via-green-300 to-blue-600 border-2 border-blue-500 shadow-xl" />
        </div>

        {/* Lower Left Ball */}
        <div
          className="absolute"
          style={{
            left: `calc(50% + ${lowerLeftPos.x}px)`,
            top: `calc(50% + ${lowerLeftPos.y}px)`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-200 via-pink-200 to-yellow-100 border-2 border-orange-300 shadow-xl" />
        </div>
      </div>

      {/* Orbit Path - Front Half */}
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
        />
      </svg>

      <ScrollAnimationManager />
    </section>
  );
};

export default HeroSection;
