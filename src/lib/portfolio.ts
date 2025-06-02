import fs from "fs";
import path from "path";

export type PortfolioProject = {
  title: string;
  description: string;
  date: string;
  tags: string[];
  images: string[];
  link?: string;
};

export async function getAllProjects(): Promise<PortfolioProject[]> {
  const dataDir = path.join(process.cwd(), "src/data");
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));
  return files.map((file) => {
    const filePath = path.join(dataDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as PortfolioProject;
  });
}
