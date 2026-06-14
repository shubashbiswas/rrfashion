import { getAllCategories } from "@/lib/wordpress";
import { ArchiveList } from "@/components/archive-list";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All Categories",
  description: "Browse all categories of our blog posts",
  alternates: { canonical: "/posts/categories" },
};

export default async function Page() {
  const categories = await getAllCategories();
  return (
    <ArchiveList
      items={categories}
      title="All Categories"
      emptyMessage="No categories available yet."
      getHref={(category) => `/posts/?category=${category.id}`}
    />
  );
}
