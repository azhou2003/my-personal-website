import React, { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { buildOrbitRenderData, clamp, getOrbit3DPosition, getOrbitRadii } from "./hero-orbit/math";
import {
  ORBIT_CENTER,
  ORBIT_CONTROL_FIELDS,
  PORTRAIT_CUTOFF,
  getDefaultOrbitConfig,
  type OrbitSpec,
  type Position3D,
} from "./hero-orbit/types";
import { useOrbitAnimation } from "./hero-orbit/useOrbitAnimation";

const ORBIT_CONTROL_FIELD_MAP = new Map(ORBIT_CONTROL_FIELDS.map((field) => [field.key, field] as const));

const HeroSection: React.FC<{ animateOrbit?: boolean }> = ({ animateOrbit = false }) => {
  const [isOrbitMenuOpen, setIsOrbitMenuOpen] = useState(false);
  const [activePlanetTab, setActivePlanetTab] = useState<"earth" | "mars">("earth");
  const [isSunHovered, setIsSunHovered] = useState(false);
  const [orbitConfig, setOrbitConfig] = useState(getDefaultOrbitConfig);
  const orbitMenuMobileRef = React.useRef<HTMLDivElement>(null);
  const orbitMenuDesktopRef = React.useRef<HTMLDivElement>(null);
  const portraitButtonRef = React.useRef<HTMLButtonElement>(null);

  const { dimensions, isClient, isSceneReady, earthAngle, marsAngle } = useOrbitAnimation({
    animateOrbit,
    orbitConfig,
  });

  const { earthRadiusX, earthRadiusY, marsRadiusX, marsRadiusY } = useMemo(
    () => getOrbitRadii(dimensions, orbitConfig),
    [dimensions, orbitConfig]
  );

  const earthOrbitData = useMemo(
    () =>
      buildOrbitRenderData(
        earthRadiusX,
        earthRadiusY,
        orbitConfig.earth.rotation,
        orbitConfig.earth.inclination
      ),
    [earthRadiusX, earthRadiusY, orbitConfig.earth.rotation, orbitConfig.earth.inclination]
  );

  const marsOrbitData = useMemo(
    () =>
      buildOrbitRenderData(
        marsRadiusX,
        marsRadiusY,
        orbitConfig.mars.rotation,
        orbitConfig.mars.inclination
      ),
    [marsRadiusX, marsRadiusY, orbitConfig.mars.rotation, orbitConfig.mars.inclination]
  );

  const updateOrbitSpec = useCallback((planet: "earth" | "mars", field: keyof OrbitSpec, value: number) => {
    const fieldConfig = ORBIT_CONTROL_FIELD_MAP.get(field);
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
  const renderOrbitControlFields = (planet: "earth" | "mars") => (
    <>
      {ORBIT_CONTROL_FIELDS.map((field) => {
        const value = orbitConfig[planet][field.key];
        return (
          <label key={`${planet}-${field.key}`} className="block text-xs space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span style={{ color: "color-mix(in srgb, var(--color-orbit-menu-title) 90%, transparent)" }}>{field.label}</span>
              <span
                className="font-mono text-[11px] px-1.5 py-0.5 rounded-md"
                style={{
                  background: "var(--color-orbit-chip-bg)",
                  border: "1px solid var(--color-orbit-chip-border)",
                  color: "var(--color-orbit-menu-muted)",
                }}
              >
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
              className="orbit-range cursor-pointer"
            />
          </label>
        );
      })}
    </>
  );

  const renderOrbitControls = (planet: "earth" | "mars", label: string) => (
    <div
      className="rounded-[1.15rem] border p-3.5 sm:p-4 space-y-3"
      style={{
        background: "var(--color-orbit-control-bg)",
        borderColor: "var(--color-orbit-control-border)",
        boxShadow: "var(--color-orbit-control-shadow)",
      }}
    >
      <h4 className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-orbit-menu-muted)]">
        {label}
      </h4>
      {renderOrbitControlFields(planet)}
    </div>
  );

  const renderOrbitMenuContent = () => (
    <>
      <div className="flex items-center justify-between gap-2 border-b pb-3" style={{ borderColor: "var(--color-orbit-menu-divider)" }}>
        <h3 className="text-sm font-semibold tracking-[0.08em] text-[var(--color-orbit-menu-title)]">Orbit Controls</h3>
        <button
          type="button"
          onClick={() => setIsOrbitMenuOpen(false)}
          className="text-xs px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-link)]"
          style={{
            borderColor: "var(--color-orbit-action-border)",
            background: "var(--color-orbit-action-bg)",
            boxShadow: "var(--color-orbit-action-shadow)",
            color: "var(--color-orbit-menu-title)",
          }}
        >
          Close
        </button>
      </div>
      <div className="sm:hidden mt-2.5">
        <div
          className="rounded-t-[1.15rem] border border-b-0 p-1 grid grid-cols-2 gap-1"
          style={{
            borderColor: "var(--color-orbit-control-border)",
            background: "var(--color-orbit-control-bg)",
          }}
        >
          <button
            type="button"
            onClick={() => setActivePlanetTab("earth")}
            aria-pressed={activePlanetTab === "earth"}
            className={`text-xs py-2 rounded-full border transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-link)] ${
              activePlanetTab === "earth"
                ? "shadow-sm"
                : "hover:-translate-y-[1px]"
            }`}
            style={activePlanetTab === "earth"
              ? {
                  borderColor: "var(--color-orbit-chip-active-border)",
                  background: "var(--color-orbit-chip-active-bg)",
                  color: "var(--color-orbit-menu-title)",
                }
              : {
                  borderColor: "transparent",
                  background: "transparent",
                  color: "var(--color-orbit-menu-muted)",
                }}
          >
            Earth
          </button>
          <button
            type="button"
            onClick={() => setActivePlanetTab("mars")}
            aria-pressed={activePlanetTab === "mars"}
            className={`text-xs py-2 rounded-full border transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-link)] ${
              activePlanetTab === "mars"
                ? "shadow-sm"
                : "hover:-translate-y-[1px]"
            }`}
            style={activePlanetTab === "mars"
              ? {
                  borderColor: "var(--color-orbit-chip-active-border)",
                  background: "var(--color-orbit-chip-active-bg)",
                  color: "var(--color-orbit-menu-title)",
                }
              : {
                  borderColor: "transparent",
                  background: "transparent",
                  color: "var(--color-orbit-menu-muted)",
                }}
          >
            Mars
          </button>
        </div>
        <div
          className="-mt-px rounded-b-[1.15rem] border p-3.5 space-y-3"
          style={{
            background: "var(--color-orbit-control-bg)",
            borderColor: "var(--color-orbit-control-border)",
            boxShadow: "var(--color-orbit-control-shadow)",
          }}
        >
          {renderOrbitControlFields(activePlanetTab)}
        </div>
      </div>
      <div className="hidden sm:block space-y-4 pt-3">
        {renderOrbitControls("earth", "Earth Orbit")}
        {renderOrbitControls("mars", "Mars Orbit")}
      </div>
      <button
        type="button"
        onClick={() => setOrbitConfig(getDefaultOrbitConfig())}
        className="w-full text-xs py-2.5 rounded-xl border mt-3 sm:mt-4 hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-link)]"
        style={{
          borderColor: "var(--color-orbit-chip-active-border)",
          background: "var(--color-orbit-chip-active-bg)",
          boxShadow: "var(--color-orbit-action-shadow)",
          color: "var(--color-orbit-menu-title)",
        }}
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
  const portraitWidth = dimensions.centralRadius * 1.93;
  const portraitHeight = dimensions.centralRadius * 2.42;
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
      {isClient && earthOrbitData && (
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

      {isClient && marsOrbitData && (
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
        {renderPlanet(earthPos, '/earthy-earth.jpg', orbitConfig.earth.rotationSpeed)}
      </div>

      <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
        {renderPlanet(marsPos, '/earthy-mars.jpg', orbitConfig.mars.rotationSpeed)}
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-[6]"
        style={{
          top: sceneCenterY,
          width: `${Math.floor(dimensions.centralRadius * 2.7)}px`,
          height: `${Math.floor(dimensions.centralRadius * 2.7)}px`,
          background: "var(--color-hero-halo)",
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
              src="/art-headshot.png"
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
              src="/art-headshot.png"
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
              Click Me!
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
            className="relative overflow-hidden mx-auto w-full max-w-md rounded-[1.6rem] border text-foreground-light dark:text-foreground-dark p-3.5 space-y-3"
            style={{
              background: "var(--color-orbit-menu-bg)",
              borderColor: "var(--color-orbit-menu-border)",
              boxShadow: "var(--color-orbit-menu-shadow)",
            }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "var(--color-orbit-menu-overlay)",
                opacity: 0.78,
              }}
            />
            <div className="relative z-10">{renderOrbitMenuContent()}</div>
          </div>
        </div>,
        document.body
      )}
      {isOrbitMenuOpen && (
        <div
          ref={orbitMenuDesktopRef}
          className="hidden sm:block absolute z-40 right-4 top-1/2 -translate-y-1/2 w-full max-w-md rounded-[1.55rem] border text-foreground-light dark:text-foreground-dark p-4 space-y-3 overflow-hidden"
          style={{
            background: "var(--color-orbit-menu-bg)",
            borderColor: "var(--color-orbit-menu-border)",
            boxShadow: "var(--color-orbit-menu-shadow-soft)",
          }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "var(--color-orbit-menu-overlay)",
              opacity: 0.66,
            }}
          />
          <div className="relative z-10">{renderOrbitMenuContent()}</div>
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
