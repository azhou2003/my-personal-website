import fs from "fs";
import path from "path";
import { ABOUT_SLIDES_DIR } from "./contentPaths";
import type { AboutSlide, AboutSlideLink } from "./types";

const ABOUT_LINK_ICONS = ["email", "github", "linkedin", "external"] as const;

function isAboutSlideLink(value: unknown): value is AboutSlideLink {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AboutSlideLink>;
  return (
    typeof candidate.label === "string" &&
    candidate.label.trim().length > 0 &&
    typeof candidate.href === "string" &&
    candidate.href.trim().length > 0 &&
    typeof candidate.icon === "string" &&
    ABOUT_LINK_ICONS.includes(candidate.icon as (typeof ABOUT_LINK_ICONS)[number]) &&
    (candidate.external === undefined || typeof candidate.external === "boolean")
  );
}

function isAboutSlide(value: unknown): value is AboutSlide {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AboutSlide>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.eyebrow === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.imageAlt === "string" &&
    (candidate.imageSrc === undefined || typeof candidate.imageSrc === "string") &&
    Array.isArray(candidate.paragraphs) &&
    candidate.paragraphs.every((paragraph) => typeof paragraph === "string") &&
    (candidate.links === undefined ||
      (Array.isArray(candidate.links) && candidate.links.every((link) => isAboutSlideLink(link))))
  );
}

export async function getAllAboutSlides(): Promise<AboutSlide[]> {
  if (!fs.existsSync(ABOUT_SLIDES_DIR)) return [];

  const files = fs
    .readdirSync(ABOUT_SLIDES_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));

  const slides = files.flatMap((file) => {
    const filePath = path.join(ABOUT_SLIDES_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!isAboutSlide(parsed)) {
      throw new Error(`Invalid about slide content in ${file}`);
    }

    return [parsed];
  });

  return slides;
}
