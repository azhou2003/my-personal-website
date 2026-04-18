import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ORBIT_ANIMATION } from "@/lib/motion";
import { type OrbitConfig, type OrbitDimensions } from "./types";

const getDefaultOrbitDimensions = (): OrbitDimensions => ({
  radiusX: 260,
  radiusY: 260,
  centralRadius: 142,
  planetSize: 44,
});

const getResponsiveOrbitDimensions = (): OrbitDimensions => {
  if (typeof window === "undefined") {
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

interface UseOrbitAnimationArgs {
  animateOrbit: boolean;
  orbitConfig: OrbitConfig;
}

export function useOrbitAnimation({ animateOrbit, orbitConfig }: UseOrbitAnimationArgs) {
  const [earthAnimatedAngle, setEarthAnimatedAngle] = useState(0);
  const [marsAnimatedAngle, setMarsAnimatedAngle] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [dimensions, setDimensions] = useState<OrbitDimensions>(getDefaultOrbitDimensions);
  const lastTimestampRef = useRef<number | null>(null);

  const updateDimensions = useCallback(() => {
    if (typeof window !== "undefined") {
      setDimensions(getResponsiveOrbitDimensions());
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    setIsSceneReady(false);
    updateDimensions();

    let raf1 = 0;
    let raf2 = 0;
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        setIsSceneReady(true);
      });
    });

    window.addEventListener("resize", updateDimensions);
    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.removeEventListener("resize", updateDimensions);
    };
  }, [updateDimensions]);

  useEffect(() => {
    if (!animateOrbit) {
      lastTimestampRef.current = null;
      return;
    }

    let rafId = 0;
    const tick = (timestamp: number) => {
      const prevTimestamp = lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      if (prevTimestamp !== null) {
        const deltaSeconds = (timestamp - prevTimestamp) / 1000;
        const baseDeltaDegrees = ORBIT_ANIMATION.baseDegreesPerSecond * deltaSeconds;

        setEarthAnimatedAngle((prev) => (prev + baseDeltaDegrees * orbitConfig.earth.speedMultiplier) % 360);
        setMarsAnimatedAngle((prev) => (prev + baseDeltaDegrees * orbitConfig.mars.speedMultiplier) % 360);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
      lastTimestampRef.current = null;
    };
  }, [animateOrbit, orbitConfig.earth.speedMultiplier, orbitConfig.mars.speedMultiplier]);

  const earthAngle = useMemo(
    () => (animateOrbit ? (earthAnimatedAngle + orbitConfig.earth.baseAngle) % 360 : orbitConfig.earth.baseAngle),
    [animateOrbit, earthAnimatedAngle, orbitConfig.earth.baseAngle]
  );

  const marsAngle = useMemo(
    () => (animateOrbit ? (marsAnimatedAngle + orbitConfig.mars.baseAngle) % 360 : orbitConfig.mars.baseAngle),
    [animateOrbit, marsAnimatedAngle, orbitConfig.mars.baseAngle]
  );

  return {
    dimensions,
    isClient,
    isSceneReady,
    earthAngle,
    marsAngle,
  };
}
