import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { ORBIT_ANIMATION } from "../lib/motion";

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

interface OrbitSegment {
  points: string;
  dashOffset: number;
}

interface OrbitRenderData {
  front: OrbitSegment[];
  back: OrbitSegment[];
}

interface OrbitSpec {
  rotation: number;
  inclination: number;
  radiusMultiplierX: number;
  radiusMultiplierY: number;
  speedMultiplier: number;
  rotationSpeed: number;
  baseAngle: number;
}

interface OrbitControlField {
  key: keyof OrbitSpec;
  label: string;
  min: number;
  max: number;
  step: number;
}

const ORBIT_CENTER = { x: 0, y: 0 };

const EARTH_ORBIT: OrbitSpec = {
  rotation: 160,
  inclination: -70,
  radiusMultiplierX: 1,
  radiusMultiplierY: 1,
  speedMultiplier: 1,
  rotationSpeed: 1,
  baseAngle: 0,
};

const MARS_ORBIT: OrbitSpec = {
  rotation: 160,
  inclination: -70,
  radiusMultiplierX: 1.32,
  radiusMultiplierY: 1.24,
  speedMultiplier: 1,
  rotationSpeed: 1,
  baseAngle: 180,
};

const ORBIT_CONTROL_FIELDS: OrbitControlField[] = [
  { key: "rotation", label: "Rotation", min: -180, max: 180, step: 1 },
  { key: "inclination", label: "Inclination", min: -90, max: 90, step: 1 },
  { key: "radiusMultiplierX", label: "Radius X", min: 0.4, max: 2.4, step: 0.01 },
  { key: "radiusMultiplierY", label: "Radius Y", min: 0.4, max: 2.4, step: 0.01 },
  { key: "speedMultiplier", label: "Orbit Speed", min: 0, max: 3, step: 0.01 },
  { key: "rotationSpeed", label: "Rotation Speed", min: 0, max: 3, step: 0.01 },
];

const getDefaultOrbitConfig = () => ({
  earth: { ...EARTH_ORBIT },
  mars: { ...MARS_ORBIT },
});

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const PORTRAIT_CUTOFF = 0.5;

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

function buildOrbitRenderData(
  radiusX: number,
  radiusY: number,
  rotation: number,
  inclination: number,
  steps: number = 260
): OrbitRenderData {
  type OrbitSide = "front" | "back";
  type SegmentAccumulator = {
    side: OrbitSide;
    dashOffset: number;
    points: Position2D[];
  };

  const sampledPoints: Position3D[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const angle = (360 * i) / steps;
    sampledPoints.push(
      getOrbit3DPosition(ORBIT_CENTER, radiusX, radiusY, angle, rotation, inclination)
    );
  }

  const segments: OrbitRenderData = { front: [], back: [] };
  let activeSegment: SegmentAccumulator | null = null;
  let travelledLength = 0;

  const getSide = (z: number): OrbitSide => (z >= 0 ? "front" : "back");
  const dist = (a: Position2D, b: Position2D) => Math.hypot(b.x - a.x, b.y - a.y);
  const addPoint = (segment: SegmentAccumulator, point: Position2D) => {
    const previousPoint = segment.points[segment.points.length - 1];
    if (!previousPoint || previousPoint.x !== point.x || previousPoint.y !== point.y) {
      segment.points.push(point);
    }
  };
  const getSegmentSide = (segment: SegmentAccumulator | null): OrbitSide | null =>
    segment ? segment.side : null;
  const startSegment = (side: OrbitSide, startPoint: Position2D, dashOffset: number) => {
    activeSegment = { side, dashOffset, points: [] };
    addPoint(activeSegment, startPoint);
  };
  const closeSegment = () => {
    if (!activeSegment || activeSegment.points.length < 2) {
      activeSegment = null;
      return;
    }
    segments[activeSegment.side].push({
      points: activeSegment.points.map((point) => `${point.x},${point.y}`).join(" "),
      dashOffset: -activeSegment.dashOffset,
    });
    activeSegment = null;
  };

  for (let i = 0; i < sampledPoints.length - 1; i += 1) {
    const p1 = sampledPoints[i];
    const p2 = sampledPoints[i + 1];
    const side1 = getSide(p1.z);
    const side2 = getSide(p2.z);
    const point1 = { x: p1.x, y: p1.y };
    const point2 = { x: p2.x, y: p2.y };

    if (!activeSegment) {
      startSegment(side1, point1, travelledLength);
    }

    if (side1 === side2) {
      if (getSegmentSide(activeSegment) !== side1) {
        closeSegment();
        startSegment(side1, point1, travelledLength);
      }
      if (activeSegment) {
        addPoint(activeSegment, point2);
      }
      travelledLength += dist(point1, point2);
      continue;
    }

    const denominator = p1.z - p2.z;
    const t = denominator === 0 ? 0.5 : p1.z / denominator;
    const clampedT = clamp(t, 0, 1);
    const crossingPoint = {
      x: p1.x + (p2.x - p1.x) * clampedT,
      y: p1.y + (p2.y - p1.y) * clampedT,
    };

    const firstLegLength = dist(point1, crossingPoint);
    const secondLegLength = dist(crossingPoint, point2);

    if (getSegmentSide(activeSegment) !== side1) {
      closeSegment();
      startSegment(side1, point1, travelledLength);
    }
    if (activeSegment) {
      addPoint(activeSegment, crossingPoint);
    }
    closeSegment();

    startSegment(side2, crossingPoint, travelledLength + firstLegLength);
    if (activeSegment) {
      addPoint(activeSegment, point2);
    }

    travelledLength += firstLegLength + secondLegLength;
  }

  closeSegment();
  return segments;
}

const HeroSection: React.FC<{ animateOrbit?: boolean }> = ({ animateOrbit = false }) => {
  const [earthAnimatedAngle, setEarthAnimatedAngle] = useState(0);
  const [marsAnimatedAngle, setMarsAnimatedAngle] = useState(0);
  const [earthOrbitData, setEarthOrbitData] = useState<OrbitRenderData | null>(null);
  const [marsOrbitData, setMarsOrbitData] = useState<OrbitRenderData | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [isOrbitMenuOpen, setIsOrbitMenuOpen] = useState(false);
  const [activePlanetTab, setActivePlanetTab] = useState<"earth" | "mars">("earth");
  const [isSunHovered, setIsSunHovered] = useState(false);
  const [orbitConfig, setOrbitConfig] = useState(getDefaultOrbitConfig);
  // Initialize with default dimensions to prevent hydration mismatch
  const [dimensions, setDimensions] = useState<OrbitDimensions>(getDefaultOrbitDimensions);
  const orbitMenuMobileRef = React.useRef<HTMLDivElement>(null);
  const orbitMenuDesktopRef = React.useRef<HTMLDivElement>(null);
  const portraitButtonRef = React.useRef<HTMLButtonElement>(null);

  const updateOrbitSpec = useCallback((planet: "earth" | "mars", field: keyof OrbitSpec, value: number) => {
    const fieldConfig = ORBIT_CONTROL_FIELDS.find((control) => control.key === field);
    if (!fieldConfig || Number.isNaN(value)) return;
    const nextValue = clamp(value, fieldConfig.min, fieldConfig.max);
    setOrbitConfig((prev) => ({
      ...prev,
      [planet]: {
        ...prev[planet],
        [field]: nextValue,
      },
    }));
  }, []);

  // Update dimensions on resize
  const updateDimensions = useCallback(() => {
    if (typeof window !== 'undefined') {
      setDimensions(getResponsiveOrbitDimensions());
    }
  }, []);
  useEffect(() => {
    setIsClient(true);
    setIsSceneReady(false);
    // Set responsive dimensions after client hydration
    updateDimensions();

    let raf1 = 0;
    let raf2 = 0;
    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        setIsSceneReady(true);
      });
    });

    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.removeEventListener('resize', updateDimensions);
    };
  }, [updateDimensions]);

  useEffect(() => {
    if (!isOrbitMenuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        orbitMenuMobileRef.current?.contains(target) ||
        orbitMenuDesktopRef.current?.contains(target) ||
        portraitButtonRef.current?.contains(target)
      ) {
        return;
      }
      setIsOrbitMenuOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOrbitMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOrbitMenuOpen]);

  useEffect(() => {
    if (!isOrbitMenuOpen) return;
    if (!window.matchMedia("(max-width: 639px)").matches) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOrbitMenuOpen]);

  useEffect(() => {
    if (isOrbitMenuOpen) {
      setActivePlanetTab("earth");
    }
  }, [isOrbitMenuOpen]);

  // Update orbit paths when dimensions change
  useEffect(() => {
    const defaultDims = getDefaultOrbitDimensions();
    const currentDims = isClient ? dimensions : defaultDims;

    const earthRadiusX = Math.floor(currentDims.radiusX * orbitConfig.earth.radiusMultiplierX);
    const earthRadiusY = Math.floor(currentDims.radiusY * orbitConfig.earth.radiusMultiplierY);

    const marsRadiusMultiplierX =
      currentDims.centralRadius < 105
        ? Math.max(1.2, orbitConfig.mars.radiusMultiplierX)
        : orbitConfig.mars.radiusMultiplierX;
    const marsRadiusMultiplierY =
      currentDims.centralRadius < 105
        ? Math.max(1.14, orbitConfig.mars.radiusMultiplierY)
        : orbitConfig.mars.radiusMultiplierY;
    const marsRadiusX = Math.floor(currentDims.radiusX * marsRadiusMultiplierX);
    const marsRadiusY = Math.floor(currentDims.radiusY * marsRadiusMultiplierY);

    setEarthOrbitData(
      buildOrbitRenderData(
        earthRadiusX,
        earthRadiusY,
        orbitConfig.earth.rotation,
        orbitConfig.earth.inclination
      )
    );

    setMarsOrbitData(
      buildOrbitRenderData(
        marsRadiusX,
        marsRadiusY,
        orbitConfig.mars.rotation,
        orbitConfig.mars.inclination
      )
    );
  }, [dimensions, isClient, orbitConfig]);

  useEffect(() => {
    if (!animateOrbit) return;

    const interval = setInterval(() => {
      setEarthAnimatedAngle((prev) => (prev + orbitConfig.earth.speedMultiplier) % 360);
      setMarsAnimatedAngle((prev) => (prev + orbitConfig.mars.speedMultiplier) % 360);
    }, ORBIT_ANIMATION.tickMs);

    return () => clearInterval(interval);
  }, [animateOrbit, orbitConfig.earth.speedMultiplier, orbitConfig.mars.speedMultiplier]);

  const earthRadiusX = Math.floor(dimensions.radiusX * orbitConfig.earth.radiusMultiplierX);
  const earthRadiusY = Math.floor(dimensions.radiusY * orbitConfig.earth.radiusMultiplierY);
  const marsRadiusMultiplierX =
    dimensions.centralRadius < 105
      ? Math.max(1.2, orbitConfig.mars.radiusMultiplierX)
      : orbitConfig.mars.radiusMultiplierX;
  const marsRadiusMultiplierY =
    dimensions.centralRadius < 105
      ? Math.max(1.14, orbitConfig.mars.radiusMultiplierY)
      : orbitConfig.mars.radiusMultiplierY;
  const marsRadiusX = Math.floor(dimensions.radiusX * marsRadiusMultiplierX);
  const marsRadiusY = Math.floor(dimensions.radiusY * marsRadiusMultiplierY);

  const earthAngle = animateOrbit
    ? (earthAnimatedAngle + orbitConfig.earth.baseAngle) % 360
    : orbitConfig.earth.baseAngle;
  const marsAngle = animateOrbit
    ? (marsAnimatedAngle + orbitConfig.mars.baseAngle) % 360
    : orbitConfig.mars.baseAngle;

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
  const renderOrbitControls = (planet: "earth" | "mars", label: string) => (
    <div className="rounded-2xl border border-black/10 dark:border-white/20 bg-[var(--color-card-muted-bg)] p-3 sm:p-4 space-y-2.5">
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-light/75 dark:text-foreground-dark/75">
        {label}
      </h4>
      {ORBIT_CONTROL_FIELDS.map((field) => {
        const value = orbitConfig[planet][field.key];
        return (
          <label key={`${planet}-${field.key}`} className="block text-xs space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-foreground-light/85 dark:text-foreground-dark/85">{field.label}</span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">
                {value.toFixed(field.step < 1 ? 2 : 0)}
              </span>
            </div>
            <input
              type="range"
              min={field.min}
              max={field.max}
              step={field.step}
              value={value}
              onChange={(event) => updateOrbitSpec(planet, field.key, Number(event.target.value))}
              className="w-full accent-accent-orange cursor-pointer"
            />
          </label>
        );
      })}
    </div>
  );

  const renderOrbitMenuContent = () => (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-black/10 dark:border-white/15 pb-2">
        <h3 className="text-sm font-semibold tracking-wide">Orbit Controls</h3>
        <button
          type="button"
          onClick={() => setIsOrbitMenuOpen(false)}
          className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-tab-border)] dark:border-[var(--color-tab-border-dark)] bg-white/80 dark:bg-white/10 text-foreground-light dark:text-foreground-dark shadow-sm hover:bg-white hover:shadow-md hover:-translate-y-[1px] dark:hover:bg-white/20 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-link)]"
        >
          Close
        </button>
      </div>
      <div className="sm:hidden rounded-full border border-black/10 dark:border-white/20 p-1 grid grid-cols-2 gap-1 bg-[var(--color-card-muted-bg)]">
        <button
          type="button"
          onClick={() => setActivePlanetTab("earth")}
          aria-pressed={activePlanetTab === "earth"}
          className={`text-xs py-2 rounded-full border transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-link)] ${
            activePlanetTab === "earth"
              ? "border-[var(--color-hero-core-border)] bg-accent-orange/30 dark:bg-accent-orange/25 shadow-sm"
              : "border-transparent hover:bg-black/5 dark:hover:bg-white/10 hover:border-black/10 dark:hover:border-white/20 hover:-translate-y-[1px]"
          }`}
        >
          Earth
        </button>
        <button
          type="button"
          onClick={() => setActivePlanetTab("mars")}
          aria-pressed={activePlanetTab === "mars"}
          className={`text-xs py-2 rounded-full border transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-link)] ${
            activePlanetTab === "mars"
              ? "border-[var(--color-hero-core-border)] bg-accent-orange/30 dark:bg-accent-orange/25 shadow-sm"
              : "border-transparent hover:bg-black/5 dark:hover:bg-white/10 hover:border-black/10 dark:hover:border-white/20 hover:-translate-y-[1px]"
          }`}
        >
          Mars
        </button>
      </div>
      <div className="sm:hidden">
        {activePlanetTab === "earth"
          ? renderOrbitControls("earth", "Earth Orbit")
          : renderOrbitControls("mars", "Mars Orbit")}
      </div>
      <div className="hidden sm:block space-y-3">
        {renderOrbitControls("earth", "Earth Orbit")}
        {renderOrbitControls("mars", "Mars Orbit")}
      </div>
      <button
        type="button"
        onClick={() => setOrbitConfig(getDefaultOrbitConfig())}
        className="w-full text-xs py-2.5 rounded-xl border border-[var(--color-hero-core-border)] bg-accent-orange/30 dark:bg-accent-orange/25 text-foreground-light dark:text-foreground-dark shadow-sm hover:bg-accent-orange/45 dark:hover:bg-accent-orange/35 hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-link)]"
      >
        Reset to Defaults
      </button>
    </>
  );
  const renderPlanet = (pos: Position3D, planetTexture: string, rotationSpeed: number) => (
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
        className="rounded-full shadow-xl bg-cover bg-center"
        style={{
          width: `${dimensions.planetSize}px`,
          height: `${dimensions.planetSize}px`,
          backgroundImage: `url('${planetTexture}')`,
          backgroundSize: "300% 100%",
          backgroundPosition: "0% center",
          backgroundRepeat: "repeat-x",
          animation: rotationSpeed > 0 ? `earthSpin ${8 / rotationSpeed}s linear infinite` : "none"
        }}
      />
    </div>
  );
  const maxOrbitRadius = Math.max(earthRadiusX, earthRadiusY, marsRadiusX, marsRadiusY);
  const svgSize = Math.max(Math.floor(maxOrbitRadius * 2.9), 460);
  const halfSvgSize = svgSize / 2;
  const sceneCenterY = "50%";
  const clickMeArcId = React.useId().replace(/:/g, "");
  const portraitWidth = dimensions.centralRadius * 2.30;
  const portraitHeight = dimensions.centralRadius * 2.52;
  const portraitHeightScale = portraitHeight / dimensions.centralRadius;
  const portraitCutoffPercent =
    ((portraitHeightScale - 2 + PORTRAIT_CUTOFF * 2) / portraitHeightScale) * 100;
  const clickHintBaseFontSize = Math.max(12, Math.min(18, dimensions.centralRadius * 0.14));
  const clickHintHoverFontSize = Math.max(16, Math.min(22, dimensions.centralRadius * 0.17));
  const clickMeArcRadius = dimensions.centralRadius * 1.04;
  const clickMeArcBoxSize = Math.floor(clickMeArcRadius * 2 + dimensions.centralRadius * 0.9);
  const clickMeArcCenter = clickMeArcBoxSize / 2;
  const clickMeStartAngle = (-185 * Math.PI) / 180;
  const clickMeEndAngle = (-78 * Math.PI) / 180;
  const clickMeStartX = clickMeArcCenter + clickMeArcRadius * Math.cos(clickMeStartAngle);
  const clickMeStartY = clickMeArcCenter + clickMeArcRadius * Math.sin(clickMeStartAngle);
  const clickMeEndX = clickMeArcCenter + clickMeArcRadius * Math.cos(clickMeEndAngle);
  const clickMeEndY = clickMeArcCenter + clickMeArcRadius * Math.sin(clickMeEndAngle);

  return (
    <section
      className={`relative flex items-center justify-center w-full h-full min-h-0 p-2 sm:p-4 m-0 overflow-x-hidden overflow-y-visible will-change-transform transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isSceneReady ? "opacity-100 scale-100" : "opacity-0 scale-[0.965]"
      }`}
    >
      {earthOrbitData && (
        <svg
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
          style={{
            width: `${svgSize}px`,
            height: `${svgSize}px`,
            top: sceneCenterY,
          }}
          viewBox={`-${halfSvgSize} -${halfSvgSize} ${svgSize} ${svgSize}`}
        >
          {earthOrbitData.back.map((segment, index) => (
            <polyline
              key={`earth-back-${index}`}
              points={segment.points}
              fill="none"
              stroke="var(--color-orbit-earth-back)"
              strokeDasharray="2 7"
              strokeDashoffset={segment.dashOffset}
              strokeLinecap="round"
              strokeWidth="1.6"
            />
          ))}
        </svg>
      )}

      {marsOrbitData && (
        <svg
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[1]"
          style={{
            width: `${svgSize}px`,
            height: `${svgSize}px`,
            top: sceneCenterY,
          }}
          viewBox={`-${halfSvgSize} -${halfSvgSize} ${svgSize} ${svgSize}`}
        >
          {marsOrbitData.back.map((segment, index) => (
            <polyline
              key={`mars-back-${index}`}
              points={segment.points}
              fill="none"
              stroke="var(--color-orbit-mars-back)"
              strokeDasharray="3 8"
              strokeDashoffset={segment.dashOffset}
              strokeLinecap="round"
              strokeWidth="1.45"
            />
          ))}
        </svg>
      )}

      <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
        {renderPlanet(earthPos, '/flat-cartoon-earth.jpg', orbitConfig.earth.rotationSpeed)}
      </div>

      <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
        {renderPlanet(marsPos, '/flat-cartoon-mars.jpg', orbitConfig.mars.rotationSpeed)}
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
      >
        <div
          className="w-full h-full rounded-full bg-[var(--color-hero-core-bg)] shadow-2xl relative"
          style={{ overflow: "visible" }}
        >
          <div
            className="absolute inset-0 z-0 rounded-full border-4 sm:border-6 lg:border-8 border-[var(--color-hero-core-border)] pointer-events-none"
            style={{ clipPath: `inset(0 0 ${100 - PORTRAIT_CUTOFF * 100}% 0)` }}
          />
          <div
            className="absolute left-1/2 bottom-0 z-10 transform -translate-x-1/2 pointer-events-none"
            style={{
              width: `${portraitWidth}px`,
              height: `${portraitHeight}px`,
              clipPath: `inset(0 0 ${100 - portraitCutoffPercent}% 0)`,
            }}
          >
            <Image
              src="/portrait1.png"
              alt=""
              aria-hidden
              width={600}
              height={600}
              className="absolute left-1/2 bottom-0 transform -translate-x-1/2 object-cover object-top select-none"
              style={{
                width: `${portraitWidth}px`,
                height: `${portraitHeight}px`,
              }}
            />
          </div>
          <div
            className="absolute inset-0 z-[11] rounded-full overflow-hidden pointer-events-none"
            style={{ clipPath: `inset(${PORTRAIT_CUTOFF * 100}% 0 0 0)` }}
          >
            <Image
              src="/portrait1.png"
              alt=""
              aria-hidden
              width={600}
              height={600}
              className="absolute left-1/2 bottom-0 transform -translate-x-1/2 object-cover object-top select-none"
              style={{
                width: `${portraitWidth}px`,
                height: `${portraitHeight}px`,
              }}
            />
          </div>
          <div
            className="absolute inset-0 z-20 rounded-full border-4 sm:border-6 lg:border-8 border-[var(--color-hero-core-border)] pointer-events-none"
            style={{ clipPath: `inset(${PORTRAIT_CUTOFF * 100}% 0 0 0)` }}
          />
          <button
            ref={portraitButtonRef}
            type="button"
            onClick={() => setIsOrbitMenuOpen((prev) => !prev)}
            onMouseEnter={() => setIsSunHovered(true)}
            onMouseLeave={() => setIsSunHovered(false)}
            onFocus={() => setIsSunHovered(true)}
            onBlur={() => setIsSunHovered(false)}
            className="absolute left-1/2 z-30 transform -translate-x-1/2 -translate-y-1/2 appearance-none bg-transparent border-0 p-0 leading-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-link)] rounded-full"
            aria-label="Open orbit controls"
            aria-expanded={isOrbitMenuOpen}
            style={{
              top: sceneCenterY,
              width: `${dimensions.centralRadius * 2}px`,
              height: `${dimensions.centralRadius * 2}px`,
            }}
          />
        </div>
      </div>
      <div
        className="absolute left-1/2 z-[32] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          top: sceneCenterY,
          width: `${clickMeArcBoxSize}px`,
          height: `${clickMeArcBoxSize}px`,
        }}
      >
        <svg width="100%" height="100%" viewBox={`0 0 ${clickMeArcBoxSize} ${clickMeArcBoxSize}`}>
          <defs>
            <path
              id={clickMeArcId}
              d={`M ${clickMeStartX} ${clickMeStartY} A ${clickMeArcRadius} ${clickMeArcRadius} 0 0 1 ${clickMeEndX} ${clickMeEndY}`}
            />
          </defs>
          <text
            className="font-semibold tracking-wide"
            style={{
              fill: "var(--color-hero-click-hint)",
              letterSpacing: "0.08em",
              fontSize: `${isSunHovered ? clickHintHoverFontSize : clickHintBaseFontSize}px`,
              transition: "font-size 180ms ease",
            }}
          >
            <textPath href={`#${clickMeArcId}`} startOffset="50%" textAnchor="middle">
              Click on Me!
            </textPath>
          </text>
        </svg>
      </div>
      {isClient && isOrbitMenuOpen && createPortal(
        <div
          className="fixed inset-0 z-[120] p-3 overflow-y-auto bg-black/45 dark:bg-black/60 backdrop-blur-[2px] sm:hidden"
        >
          <div
            ref={orbitMenuMobileRef}
            className="mx-auto w-full max-w-md rounded-2xl border border-[#d7c9ab] dark:border-[#5f574d] text-foreground-light dark:text-foreground-dark shadow-[0_18px_40px_rgba(43,34,24,0.28)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.45)] p-3 space-y-3"
            style={{ background: "var(--color-orbit-menu-bg)" }}
          >
            {renderOrbitMenuContent()}
          </div>
        </div>,
        document.body
      )}
      {isOrbitMenuOpen && (
        <div
          ref={orbitMenuDesktopRef}
          className="hidden sm:block absolute z-40 right-4 top-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-[#d7c9ab] dark:border-[#5f574d] text-foreground-light dark:text-foreground-dark shadow-[0_18px_40px_rgba(43,34,24,0.22)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.38)] p-4 space-y-3"
          style={{ background: "var(--color-orbit-menu-bg)" }}
        >
          {renderOrbitMenuContent()}
        </div>
      )}
      {isClient && earthOrbitData && (
        <svg
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
          style={{
            width: `${svgSize}px`,
            height: `${svgSize}px`,
            top: sceneCenterY,
          }}
          viewBox={`-${halfSvgSize} -${halfSvgSize} ${svgSize} ${svgSize}`}
        >
          {earthOrbitData.front.map((segment, index) => (
            <polyline
              key={`earth-front-${index}`}
              points={segment.points}
              fill="none"
              stroke="var(--color-orbit-earth-front)"
              strokeDasharray="2 7"
              strokeDashoffset={segment.dashOffset}
              strokeLinecap="round"
              strokeWidth="1.6"
            />
          ))}
        </svg>
      )}

      {isClient && marsOrbitData && (
        <svg
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[21]"
          style={{
            width: `${svgSize}px`,
            height: `${svgSize}px`,
            top: sceneCenterY,
          }}
          viewBox={`-${halfSvgSize} -${halfSvgSize} ${svgSize} ${svgSize}`}
        >
          {marsOrbitData.front.map((segment, index) => (
            <polyline
              key={`mars-front-${index}`}
              points={segment.points}
              fill="none"
              stroke="var(--color-orbit-mars-front)"
              strokeDasharray="3 8"
              strokeDashoffset={segment.dashOffset}
              strokeLinecap="round"
              strokeWidth="1.45"
            />
          ))}
        </svg>
      )}
    </section>
  );
};

export default HeroSection;
