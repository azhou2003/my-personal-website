import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getAllBlogPosts } from "../../lib/markdown";
import BlogIndexClient from "./BlogIndexClient";

export default function BlogPage() {
  const posts = getAllBlogPosts();
  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark transition-colors duration-300">
      <Navbar />
      <BlogIndexClient posts={posts} />
      <Footer />
    </div>
  );
}
