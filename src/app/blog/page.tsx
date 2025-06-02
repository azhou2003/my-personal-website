import PageLayout from "../../components/PageLayout";
import { getAllBlogPosts } from "../../lib/markdown";
import BlogIndexClient from "./BlogIndexClient";

// Add this metadata export at the top level of the file
export const metadata = {
  title: "Blog | Anjie Zhou",
  description: "Read Anjie Zhou's latest blog posts.",
};

export default async function BlogPage() {
  const posts = getAllBlogPosts();
  return (
    <PageLayout>
      <BlogIndexClient posts={posts} />
    </PageLayout>
  );
}
