import PageLayout from "../../components/PageLayout";
import { getAllProjects } from "../../lib/portfolio";
import type { PortfolioProject } from "../../lib/types";
import PortfolioClient from "./PortfolioClient";
import { portfolioMetadata } from "../../lib/metadata";
import path from "path";
import fs from "fs";

export const metadata = portfolioMetadata;

export async function generateStaticParams() {
  const dataDir = path.join(process.cwd(), "src/content/data");
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));
  // If you ever want to do per-project pages, return { slug } here
  // For now, just return an empty array to trigger SSG for the index
  return [{}];
}

export default async function PortfolioPage() {
  let projects: PortfolioProject[] = [];

  try {
    projects = await getAllProjects();
  } catch (e) {
    console.error("Failed to load projects:", e);
  }

  return (
    <PageLayout>
      {projects.length > 0 ? (
        <PortfolioClient projects={projects} />
      ) : (
        <p className="text-center py-10 text-gray-500">No projects available at the moment.</p>
      )}
    </PageLayout>
  );
}

