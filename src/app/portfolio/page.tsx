import { getAllProjects } from "../../lib/portfolio";
import PortfolioClient from "./PortfolioClient";

export default async function PortfolioPage() {
  const projects = await getAllProjects();
  return <PortfolioClient projects={projects} />;
}
