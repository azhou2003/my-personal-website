import PageLayout from "../../components/PageLayout";
import { getAllProjects } from "../../lib/portfolio";
import type { PortfolioProject } from "../../lib/types";
import PortfolioClient from "./PortfolioClient";
import { portfolioMetadata } from "../../lib/metadata";

export const metadata = portfolioMetadata;

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

