import HomeClient from "./HomeClient";
import { homeMetadata } from "../lib/metadata";

export const metadata = homeMetadata;

export default function Home() {
  return <HomeClient />;
}
