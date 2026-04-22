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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function rgbToHsl({ r, g, b }: RGB): { s: number; l: number } {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const delta = max - min;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { s, l };
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

  let best: { rSum: number; gSum: number; bSum: number; score: number; count: number } | null = null;
  buckets.forEach((candidate) => {
    if (!best || candidate.score > best.score) {
      best = candidate;
    }
  });

  if (!best || best.count === 0) return fallback;

  return {
    r: Math.round(best.rSum / best.count),
    g: Math.round(best.gSum / best.count),
    b: Math.round(best.bSum / best.count),
  };
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
