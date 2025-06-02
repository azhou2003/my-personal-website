import PageLayout from "../../components/PageLayout";
import { getAllBlogPosts } from "../../lib/markdown";
import BlogIndexClient from "./BlogIndexClient";

export default function BlogPage() {
  const posts = getAllBlogPosts();
  return (
    <PageLayout>
      <BlogIndexClient posts={posts} />
    </PageLayout>
  );
}
