import fs from "fs";
import path from "path";
import type { PortfolioProject } from "./types";

export async function getAllProjects(): Promise<PortfolioProject[]> {
  const dataDir = path.join(process.cwd(), "src/content/data");
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));
  return files.map((file) => {
    const filePath = path.join(dataDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as PortfolioProject;
  });
}
