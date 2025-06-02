import PageLayout from "../../components/PageLayout";
import { getAllProjects } from "../../lib/portfolio";
import PortfolioClient from "./PortfolioClient";

export default async function PortfolioPage() {
  const projects = await getAllProjects();
  return (
    <PageLayout>
      <PortfolioClient projects={projects} />
    </PageLayout>
  );
}
