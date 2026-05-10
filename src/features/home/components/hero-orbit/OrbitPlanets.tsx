import React from "react";
import { ORBIT_ANIMATION } from "@/lib/motion";
import { getOrbit3DPosition } from "./math";
import { ORBIT_CENTER, type OrbitConfig, type OrbitDimensions } from "./types";

interface OrbitPlanetsProps {
  animateOrbit: boolean;
  isActive: boolean;
  prefersReducedMotion: boolean;
  dimensions: OrbitDimensions;
  orbitConfig: OrbitConfig;
  earthRadiusX: number;
  earthRadiusY: number;
  marsRadiusX: number;
  marsRadiusY: number;
}

export default function OrbitPlanets({
  animateOrbit,
  isActive,
  prefersReducedMotion,
  dimensions,
  orbitConfig,
  earthRadiusX,
  earthRadiusY,
  marsRadiusX,
  marsRadiusY,
}: OrbitPlanetsProps) {
  const earthRef = React.useRef<HTMLDivElement>(null);
  const marsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const earthEl = earthRef.current;
    const marsEl = marsRef.current;
    if (!earthEl || !marsEl) return;

    const setAngles = (earthAngle: number, marsAngle: number) => {
      const earthPos = getOrbit3DPosition(
        ORBIT_CENTER,
        earthRadiusX,
        earthRadiusY,
        earthAngle,
        orbitConfig.earth.rotation,
        orbitConfig.earth.inclination
      );
      const marsPos = getOrbit3DPosition(
        ORBIT_CENTER,
        marsRadiusX,
        marsRadiusY,
        marsAngle,
        orbitConfig.mars.rotation,
        orbitConfig.mars.inclination
      );

      earthEl.style.transform = `translate3d(calc(-50% + ${earthPos.x}px), calc(-50% + ${earthPos.y}px), 0)`;
      earthEl.style.zIndex = earthPos.z >= 0 ? "25" : "5";
      marsEl.style.transform = `translate3d(calc(-50% + ${marsPos.x}px), calc(-50% + ${marsPos.y}px), 0)`;
      marsEl.style.zIndex = marsPos.z >= 0 ? "25" : "5";
    };

    let earthAngle = orbitConfig.earth.baseAngle;
    let marsAngle = orbitConfig.mars.baseAngle;
    let rafId = 0;
    let lastTimestamp: number | null = null;

    setAngles(earthAngle, marsAngle);

    const canAnimate = animateOrbit && isActive && !prefersReducedMotion;
    if (!canAnimate) return;

    const tick = (timestamp: number) => {
      if (document.hidden) {
        rafId = window.requestAnimationFrame(tick);
        return;
      }

      if (lastTimestamp !== null) {
        const deltaSeconds = (timestamp - lastTimestamp) / 1000;
        const baseDeltaDegrees = ORBIT_ANIMATION.baseDegreesPerSecond * deltaSeconds;
        earthAngle = (earthAngle + baseDeltaDegrees * orbitConfig.earth.speedMultiplier) % 360;
        marsAngle = (marsAngle + baseDeltaDegrees * orbitConfig.mars.speedMultiplier) % 360;
        setAngles(earthAngle, marsAngle);
      }

      lastTimestamp = timestamp;
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [
    animateOrbit,
    dimensions,
    earthRadiusX,
    earthRadiusY,
    isActive,
    marsRadiusX,
    marsRadiusY,
    orbitConfig,
    prefersReducedMotion,
  ]);

  const spinEnabled = !prefersReducedMotion && isActive;

  return (
    <>
      <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
        <div
          ref={earthRef}
          className="absolute left-1/2 top-1/2 will-change-transform"
          style={{ zIndex: 5 }}
        >
          <div
            className="rounded-full shadow-xl bg-cover bg-center"
            style={{
              width: `${dimensions.planetSize}px`,
              height: `${dimensions.planetSize}px`,
              backgroundImage: "url('/earthy-earth.jpg')",
              backgroundSize: "300% 100%",
              backgroundPosition: "0% center",
              backgroundRepeat: "repeat-x",
              animation:
                spinEnabled && orbitConfig.earth.rotationSpeed > 0
                  ? `earthSpin ${8 / orbitConfig.earth.rotationSpeed}s linear infinite`
                  : "none",
            }}
          />
        </div>
      </div>

      <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
        <div
          ref={marsRef}
          className="absolute left-1/2 top-1/2 will-change-transform"
          style={{ zIndex: 5 }}
        >
          <div
            className="rounded-full shadow-xl bg-cover bg-center"
            style={{
              width: `${dimensions.planetSize}px`,
              height: `${dimensions.planetSize}px`,
              backgroundImage: "url('/earthy-mars.jpg')",
              backgroundSize: "300% 100%",
              backgroundPosition: "0% center",
              backgroundRepeat: "repeat-x",
              animation:
                spinEnabled && orbitConfig.mars.rotationSpeed > 0
                  ? `earthSpin ${8 / orbitConfig.mars.rotationSpeed}s linear infinite`
                  : "none",
            }}
          />
        </div>
      </div>
    </>
  );
}
