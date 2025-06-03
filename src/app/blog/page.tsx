import PageLayout from "../../components/PageLayout";
import { getAllBlogPosts } from "../../lib/markdown";
import BlogIndexClient from "./BlogIndexClient";
import { blogMetadata } from "../../lib/metadata";

export const metadata = blogMetadata;

export default async function BlogPage() {
  const posts = getAllBlogPosts();
  return (
    <PageLayout>
      <BlogIndexClient posts={posts} />
    </PageLayout>
  );
}
