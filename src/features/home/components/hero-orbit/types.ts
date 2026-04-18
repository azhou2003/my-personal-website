export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Position2D {
  x: number;
  y: number;
}

export interface OrbitDimensions {
  radiusX: number;
  radiusY: number;
  centralRadius: number;
  planetSize: number;
}

export interface OrbitSegment {
  points: string;
  dashOffset: number;
}

export interface OrbitRenderData {
  front: OrbitSegment[];
  back: OrbitSegment[];
}

export interface OrbitSpec {
  rotation: number;
  inclination: number;
  radiusMultiplierX: number;
  radiusMultiplierY: number;
  speedMultiplier: number;
  rotationSpeed: number;
  baseAngle: number;
}

export interface OrbitControlField {
  key: keyof OrbitSpec;
  label: string;
  min: number;
  max: number;
  step: number;
}

export interface OrbitConfig {
  earth: OrbitSpec;
  mars: OrbitSpec;
}

export const ORBIT_CENTER = { x: 0, y: 0 };

export const EARTH_ORBIT: OrbitSpec = {
  rotation: 160,
  inclination: -70,
  radiusMultiplierX: 1,
  radiusMultiplierY: 1,
  speedMultiplier: 1,
  rotationSpeed: 1,
  baseAngle: 0,
};

export const MARS_ORBIT: OrbitSpec = {
  rotation: 160,
  inclination: -70,
  radiusMultiplierX: 1.32,
  radiusMultiplierY: 1.24,
  speedMultiplier: 1,
  rotationSpeed: 1,
  baseAngle: 180,
};

export const ORBIT_CONTROL_FIELDS: OrbitControlField[] = [
  { key: "rotation", label: "Rotation", min: -180, max: 180, step: 1 },
  { key: "inclination", label: "Inclination", min: -90, max: 90, step: 1 },
  { key: "radiusMultiplierX", label: "Radius X", min: 0.4, max: 2.4, step: 0.01 },
  { key: "radiusMultiplierY", label: "Radius Y", min: 0.4, max: 2.4, step: 0.01 },
  { key: "speedMultiplier", label: "Orbit Speed", min: 0, max: 3, step: 0.01 },
  { key: "rotationSpeed", label: "Rotation Speed", min: 0, max: 3, step: 0.01 },
];

export const PORTRAIT_CUTOFF = 0.5;

export const getDefaultOrbitConfig = (): OrbitConfig => ({
  earth: { ...EARTH_ORBIT },
  mars: { ...MARS_ORBIT },
});
