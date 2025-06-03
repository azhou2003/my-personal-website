// SSG for portfolio projects
import fs from "fs";
import path from "path";

export async function generateStaticParams() {
  const dataDir = path.join(process.cwd(), "src/content/data");
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith(".json"));
  // If you ever want to do per-project pages, return { slug } here
  // For now, just return an empty array to trigger SSG for the index
  return [{}];
}
