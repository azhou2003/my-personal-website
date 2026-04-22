import fs from "fs";
import path from "path";
import sharp from "sharp";
import type { AboutSlideShadowProfile } from "./types";

type RGB = { r: number; g: number; b: number };

type Region = {
  startX: number;
  endX: number;
  startY: number;
  endY: number;
};

const profileCache = new Map<string, AboutSlideShadowProfile>();

const FALLBACK_PROFILE: AboutSlideShadowProfile = {
  desktopColors: ["rgba(224, 158, 108, 1)", "rgba(171, 118, 82, 1)", "rgba(117, 136, 112, 1)"],
  mobileColors: ["rgba(224, 158, 108, 1)", "rgba(171, 118, 82, 1)", "rgba(117, 136, 112, 1)"],
  textureColor: "rgba(143, 126, 102, 1)",
  opacity: 0.38,
};

const MIN_SELECTION_LIGHTNESS = 0.24;
const MIN_SELECTION_SATURATION = 0.16;
const MIN_SHADOW_LIGHTNESS = 0.3;
const MIN_SHADOW_SATURATION = 0.18;
const TARGET_LIFT_LIGHTNESS = 0.36;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function rgbToHsl({ r, g, b }: RGB): { h: number; s: number; l: number } {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const delta = max - min;

  let h = 0;
  if (delta > 0) {
    if (max === rr) {
      h = ((gg - bb) / delta) % 6;
    } else if (max === gg) {
      h = (bb - rr) / delta + 2;
    } else {
      h = (rr - gg) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hPrime = h / 60;
  const x = c * (1 - Math.abs((hPrime % 2) - 1));

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (hPrime >= 0 && hPrime < 1) {
    rPrime = c;
    gPrime = x;
  } else if (hPrime >= 1 && hPrime < 2) {
    rPrime = x;
    gPrime = c;
  } else if (hPrime >= 2 && hPrime < 3) {
    gPrime = c;
    bPrime = x;
  } else if (hPrime >= 3 && hPrime < 4) {
    gPrime = x;
    bPrime = c;
  } else if (hPrime >= 4 && hPrime < 5) {
    rPrime = x;
    bPrime = c;
  } else {
    rPrime = c;
    bPrime = x;
  }

  const m = l - c / 2;
  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255),
  };
}

function isShadowSafeColor(color: RGB): boolean {
  const { s, l } = rgbToHsl(color);
  return l >= MIN_SELECTION_LIGHTNESS && s >= MIN_SELECTION_SATURATION;
}

function normalizeShadowColor(color: RGB, fallback: RGB): RGB {
  const { h, s, l } = rgbToHsl(color);
  const fallbackHsl = rgbToHsl(fallback);
  const normalizedHue = Number.isFinite(h) ? h : fallbackHsl.h;
  const normalizedSaturation = clamp(Math.max(s, MIN_SHADOW_SATURATION), MIN_SHADOW_SATURATION, 0.86);
  const normalizedLightness = clamp(l < MIN_SHADOW_LIGHTNESS ? TARGET_LIFT_LIGHTNESS : l, MIN_SHADOW_LIGHTNESS, 0.76);
  return hslToRgb(normalizedHue, normalizedSaturation, normalizedLightness);
}

function quantize(value: number): number {
  return Math.round(value / 24) * 24;
}

function toRgbaString({ r, g, b }: RGB): string {
  return `rgba(${r}, ${g}, ${b}, 1)`;
}

function blend(a: RGB, b: RGB, amount = 0.5): RGB {
  return {
    r: Math.round(a.r * (1 - amount) + b.r * amount),
    g: Math.round(a.g * (1 - amount) + b.g * amount),
    b: Math.round(a.b * (1 - amount) + b.b * amount),
  };
}

function thirdRegions(width: number, height: number, orientation: "vertical" | "horizontal"): Region[] {
  if (orientation === "vertical") {
    const firstBreak = Math.floor(height / 3);
    const secondBreak = Math.floor((height * 2) / 3);
    return [
      { startX: 0, endX: width, startY: 0, endY: firstBreak },
      { startX: 0, endX: width, startY: firstBreak, endY: secondBreak },
      { startX: 0, endX: width, startY: secondBreak, endY: height },
    ];
  }

  const firstBreak = Math.floor(width / 3);
  const secondBreak = Math.floor((width * 2) / 3);
  return [
    { startX: 0, endX: firstBreak, startY: 0, endY: height },
    { startX: firstBreak, endX: secondBreak, startY: 0, endY: height },
    { startX: secondBreak, endX: width, startY: 0, endY: height },
  ];
}

function dominantColorFromRegion(
  pixelData: Uint8Array,
  width: number,
  height: number,
  region: Region,
  fallback: RGB
): RGB {
  const startX = clamp(region.startX, 0, width);
  const endX = clamp(region.endX, 0, width);
  const startY = clamp(region.startY, 0, height);
  const endY = clamp(region.endY, 0, height);

  const buckets = new Map<string, { rSum: number; gSum: number; bSum: number; score: number; count: number }>();

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const idx = (y * width + x) * 4;
      const alpha = pixelData[idx + 3];
      if (alpha < 112) continue;

      const r = pixelData[idx];
      const g = pixelData[idx + 1];
      const b = pixelData[idx + 2];
      const { s, l } = rgbToHsl({ r, g, b });

      if (l < 0.08 || l > 0.94) continue;

      const score = s * 0.72 + (1 - Math.abs(l - 0.5)) * 0.28;
      if (score < 0.2) continue;

      const key = `${quantize(r)}-${quantize(g)}-${quantize(b)}`;
      const existing = buckets.get(key);
      if (existing) {
        existing.rSum += r;
        existing.gSum += g;
        existing.bSum += b;
        existing.score += score;
        existing.count += 1;
      } else {
        buckets.set(key, { rSum: r, gSum: g, bSum: b, score, count: 1 });
      }
    }
  }

  let bestSafe: { rSum: number; gSum: number; bSum: number; score: number; count: number } | null = null;
  let bestOverall: { rSum: number; gSum: number; bSum: number; score: number; count: number } | null = null;
  buckets.forEach((candidate) => {
    const averaged: RGB = {
      r: Math.round(candidate.rSum / candidate.count),
      g: Math.round(candidate.gSum / candidate.count),
      b: Math.round(candidate.bSum / candidate.count),
    };

    if (!bestOverall || candidate.score > bestOverall.score) {
      bestOverall = candidate;
    }

    if (isShadowSafeColor(averaged) && (!bestSafe || candidate.score > bestSafe.score)) {
      bestSafe = candidate;
    }
  });

  const selected = bestSafe ?? bestOverall;
  if (!selected || selected.count === 0) return normalizeShadowColor(fallback, fallback);

  return normalizeShadowColor(
    {
      r: Math.round(selected.rSum / selected.count),
      g: Math.round(selected.gSum / selected.count),
      b: Math.round(selected.bSum / selected.count),
    },
    fallback
  );
}

function averageColor(pixelData: Uint8Array): RGB {
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let count = 0;

  for (let i = 0; i < pixelData.length; i += 4) {
    const alpha = pixelData[i + 3];
    if (alpha < 96) continue;
    totalR += pixelData[i];
    totalG += pixelData[i + 1];
    totalB += pixelData[i + 2];
    count += 1;
  }

  if (count === 0) {
    return { r: 174, g: 130, b: 101 };
  }

  return {
    r: Math.round(totalR / count),
    g: Math.round(totalG / count),
    b: Math.round(totalB / count),
  };
}

function computeOpacity(pixelData: Uint8Array): number {
  let totalLightness = 0;
  let count = 0;

  for (let i = 0; i < pixelData.length; i += 4) {
    const alpha = pixelData[i + 3];
    if (alpha < 96) continue;
    const { l } = rgbToHsl({ r: pixelData[i], g: pixelData[i + 1], b: pixelData[i + 2] });
    totalLightness += l;
    count += 1;
  }

  if (count === 0) return FALLBACK_PROFILE.opacity;

  const averageLightness = totalLightness / count;
  return clamp(0.4 + (0.48 - averageLightness) * 0.18, 0.3, 0.48);
}

export async function getAboutImageShadowProfile(imageSrc?: string): Promise<AboutSlideShadowProfile> {
  if (!imageSrc || !imageSrc.startsWith("/")) return FALLBACK_PROFILE;
  const cached = profileCache.get(imageSrc);
  if (cached) return cached;

  const imagePath = path.join(process.cwd(), "public", imageSrc.slice(1));
  if (!fs.existsSync(imagePath)) {
    profileCache.set(imageSrc, FALLBACK_PROFILE);
    return FALLBACK_PROFILE;
  }

  try {
    const { data, info } = await sharp(imagePath)
      .resize(72, 72, { fit: "cover" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixelData = new Uint8Array(data);
    const base = averageColor(pixelData);

    const desktopRgb = thirdRegions(info.width, info.height, "vertical").map((region) =>
      dominantColorFromRegion(pixelData, info.width, info.height, region, base)
    ) as [RGB, RGB, RGB];

    const mobileRgb = thirdRegions(info.width, info.height, "horizontal").map((region) =>
      dominantColorFromRegion(pixelData, info.width, info.height, region, base)
    ) as [RGB, RGB, RGB];

    const textureColor = blend(desktopRgb[1], desktopRgb[2], 0.5);
    const profile: AboutSlideShadowProfile = {
      desktopColors: [toRgbaString(desktopRgb[0]), toRgbaString(desktopRgb[1]), toRgbaString(desktopRgb[2])],
      mobileColors: [toRgbaString(mobileRgb[0]), toRgbaString(mobileRgb[1]), toRgbaString(mobileRgb[2])],
      textureColor: toRgbaString(textureColor),
      opacity: computeOpacity(pixelData),
    };

    profileCache.set(imageSrc, profile);
    return profile;
  } catch {
    profileCache.set(imageSrc, FALLBACK_PROFILE);
    return FALLBACK_PROFILE;
  }
}
