import fs from "fs";
import path from "path";
import type { PortfolioProject } from "./types";
import { PORTFOLIO_PROJECTS_DIR } from "./contentPaths";
import { getSampleProjects, shouldIncludeLocalSampleContent } from "./sampleContent";

export async function getAllProjects(): Promise<PortfolioProject[]> {
  const files = fs.readdirSync(PORTFOLIO_PROJECTS_DIR).filter((f) => f.endsWith(".json"));
  const projects = files.map((file) => {
    const filePath = path.join(PORTFOLIO_PROJECTS_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as PortfolioProject;
  });

  return shouldIncludeLocalSampleContent() ? [...projects, ...getSampleProjects()] : projects;
}
