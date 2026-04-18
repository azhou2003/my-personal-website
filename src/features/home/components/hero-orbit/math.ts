import {
  ORBIT_CENTER,
  type OrbitConfig,
  type OrbitDimensions,
  type OrbitRenderData,
  type Position2D,
  type Position3D,
} from "./types";

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function getOrbit3DPosition(
  center: Position2D,
  rx: number,
  ry: number,
  angleDeg: number,
  thetaDeg: number,
  phiDeg: number
): Position3D {
  const angleRad = (angleDeg * Math.PI) / 180;
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

export function buildOrbitRenderData(
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
    sampledPoints.push(getOrbit3DPosition(ORBIT_CENTER, radiusX, radiusY, angle, rotation, inclination));
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

export function getOrbitRadii(dimensions: OrbitDimensions, orbitConfig: OrbitConfig) {
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

  return {
    earthRadiusX,
    earthRadiusY,
    marsRadiusX,
    marsRadiusY,
  };
}
