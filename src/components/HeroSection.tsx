import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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

interface OrbitSpec {
  rotation: number;
  inclination: number;
  radiusMultiplierX: number;
  radiusMultiplierY: number;
  speedMultiplier: number;
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
  baseAngle: 0,
};

const MARS_ORBIT: OrbitSpec = {
  rotation: 160,
  inclination: -70,
  radiusMultiplierX: 1.32,
  radiusMultiplierY: 1.24,
  speedMultiplier: 1,
  baseAngle: 180,
};

const ORBIT_CONTROL_FIELDS: OrbitControlField[] = [
  { key: "rotation", label: "Rotation", min: -180, max: 180, step: 1 },
  { key: "inclination", label: "Inclination", min: -90, max: 90, step: 1 },
  { key: "radiusMultiplierX", label: "Radius X", min: 0.4, max: 2.4, step: 0.01 },
  { key: "radiusMultiplierY", label: "Radius Y", min: 0.4, max: 2.4, step: 0.01 },
  { key: "speedMultiplier", label: "Speed", min: 0, max: 3, step: 0.01 },
  { key: "baseAngle", label: "Base Angle", min: 0, max: 359, step: 1 },
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

function generateOrbitPath(
  startAngle: number, 
  endAngle: number, 
  radiusX: number,
  radiusY: number,
  rotation: number,
  inclination: number,
  steps: number = 100
): string {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + ((endAngle - startAngle) * i) / steps;
    const pos = getOrbit3DPosition(
      ORBIT_CENTER,
      radiusX,
      radiusY,
      angle,
      rotation,
      inclination
    );
    points.push(`${pos.x},${pos.y}`);
  }
  return points.join(" ");
}

const HeroSection: React.FC<{ animateOrbit?: boolean }> = ({ animateOrbit = false }) => {
  const [testAngle, setTestAngle] = useState(0);
  const [earthOrbitFront, setEarthOrbitFront] = useState<string>("");
  const [earthOrbitBack, setEarthOrbitBack] = useState<string>("");
  const [marsOrbitFront, setMarsOrbitFront] = useState<string>("");
  const [marsOrbitBack, setMarsOrbitBack] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [isOrbitMenuOpen, setIsOrbitMenuOpen] = useState(false);
  const [isSunHovered, setIsSunHovered] = useState(false);
  const [orbitConfig, setOrbitConfig] = useState(getDefaultOrbitConfig);
  // Initialize with default dimensions to prevent hydration mismatch
  const [dimensions, setDimensions] = useState<OrbitDimensions>(getDefaultOrbitDimensions);
  const orbitMenuRef = React.useRef<HTMLDivElement>(null);
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
      if (orbitMenuRef.current?.contains(target) || portraitButtonRef.current?.contains(target)) {
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

    setEarthOrbitFront(
      generateOrbitPath(
        180,
        360,
        earthRadiusX,
        earthRadiusY,
        orbitConfig.earth.rotation,
        orbitConfig.earth.inclination
      )
    );
    setEarthOrbitBack(
      generateOrbitPath(
        0,
        180,
        earthRadiusX,
        earthRadiusY,
        orbitConfig.earth.rotation,
        orbitConfig.earth.inclination
      )
    );

    setMarsOrbitFront(
      generateOrbitPath(
        180,
        360,
        marsRadiusX,
        marsRadiusY,
        orbitConfig.mars.rotation,
        orbitConfig.mars.inclination
      )
    );
    setMarsOrbitBack(
      generateOrbitPath(
        0,
        180,
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
      setTestAngle((prev) => (prev + 1) % 360);
    }, ORBIT_ANIMATION.tickMs);
    return () => clearInterval(interval);
  }, [animateOrbit]);

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
    ? (testAngle * orbitConfig.earth.speedMultiplier + orbitConfig.earth.baseAngle) % 360
    : orbitConfig.earth.baseAngle;
  const marsAngle = animateOrbit
    ? (testAngle * orbitConfig.mars.speedMultiplier + orbitConfig.mars.baseAngle) % 360
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
    <div className="rounded-lg border border-black/10 dark:border-white/20 bg-black/[0.03] dark:bg-white/[0.04] p-3 space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-foreground-light/85 dark:text-foreground-dark/85">
        {label}
      </h4>
      {ORBIT_CONTROL_FIELDS.map((field) => {
        const value = orbitConfig[planet][field.key];
        return (
          <label key={`${planet}-${field.key}`} className="block text-xs space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span>{field.label}</span>
              <span className="font-mono text-[11px]">{value.toFixed(field.step < 1 ? 2 : 0)}</span>
            </div>
            <input
              type="range"
              min={field.min}
              max={field.max}
              step={field.step}
              value={value}
              onChange={(event) => updateOrbitSpec(planet, field.key, Number(event.target.value))}
              className="w-full accent-[var(--color-link)]"
            />
          </label>
        );
      })}
    </div>
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
      {earthOrbitBack && (
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
            points={earthOrbitBack}
            fill="none"
            stroke="var(--color-orbit-earth-back)"
            strokeDasharray="2 7"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
        </svg>
      )}

      {marsOrbitBack && (
        <svg
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[1]"
          style={{
            width: `${svgSize}px`,
            height: `${svgSize}px`,
            top: sceneCenterY,
          }}
          viewBox={`-${halfSvgSize} -${halfSvgSize} ${svgSize} ${svgSize}`}
        >
          <polyline
            points={marsOrbitBack}
            fill="none"
            stroke="var(--color-orbit-mars-back)"
            strokeDasharray="3 8"
            strokeLinecap="round"
            strokeWidth="1.35"
          />
        </svg>
      )}

      <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
        {renderPlanet(earthPos, '/flat-cartoon-earth.jpg')}
      </div>

      <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
        {renderPlanet(marsPos, '/flat-cartoon-mars.jpg')}
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
              fontSize: isSunHovered ? "22px" : "18px",
              transition: "font-size 180ms ease",
            }}
          >
            <textPath href={`#${clickMeArcId}`} startOffset="50%" textAnchor="middle">
              Click on Me!
            </textPath>
          </text>
        </svg>
      </div>
      {isOrbitMenuOpen && (
        <div
          ref={orbitMenuRef}
          className="absolute z-40 right-3 top-3 sm:right-5 sm:top-5 w-[min(22rem,calc(100vw-1.5rem))] max-h-[80vh] overflow-y-auto rounded-xl border border-black/10 dark:border-white/20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md shadow-2xl p-3 sm:p-4 space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Orbit Controls</h3>
            <button
              type="button"
              onClick={() => setIsOrbitMenuOpen(false)}
              className="text-xs px-2 py-1 rounded border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
            >
              Close
            </button>
          </div>
          {renderOrbitControls("earth", "Earth Orbit")}
          {renderOrbitControls("mars", "Mars Orbit")}
          <button
            type="button"
            onClick={() => setOrbitConfig(getDefaultOrbitConfig())}
            className="w-full text-xs py-2 rounded-md border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
          >
            Reset to Defaults
          </button>
        </div>
      )}
      {isClient && earthOrbitFront && (
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
            points={earthOrbitFront}
            fill="none"
            stroke="var(--color-orbit-earth-front)"
            strokeDasharray="2 7"
            strokeLinecap="round"
            strokeWidth="1.7"
          />
        </svg>
      )}

      {isClient && marsOrbitFront && (
        <svg
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[21]"
          style={{
            width: `${svgSize}px`,
            height: `${svgSize}px`,
            top: sceneCenterY,
          }}
          viewBox={`-${halfSvgSize} -${halfSvgSize} ${svgSize} ${svgSize}`}
        >
          <polyline
            points={marsOrbitFront}
            fill="none"
            stroke="var(--color-orbit-mars-front)"
            strokeDasharray="3 8"
            strokeLinecap="round"
            strokeWidth="1.55"
          />
        </svg>
      )}
    </section>
  );
};

export default HeroSection;
