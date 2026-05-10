import { useCallback, useEffect, useState } from "react";
import { type OrbitDimensions } from "./types";

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

export function useOrbitAnimation() {
  const [isClient, setIsClient] = useState(false);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [dimensions, setDimensions] = useState<OrbitDimensions>(getDefaultOrbitDimensions);

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

  return {
    dimensions,
    isClient,
    isSceneReady,
  };
}
