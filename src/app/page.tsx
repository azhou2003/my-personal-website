import HomeClient from "./HomeClient";
import { homeMetadata } from "@/lib/metadata";
import { getAllAboutSlides } from "@/lib/aboutSlides";

export const metadata = homeMetadata;

export default async function Home() {
  const aboutSlides = await getAllAboutSlides();
  return <HomeClient aboutSlides={aboutSlides} />;
}
