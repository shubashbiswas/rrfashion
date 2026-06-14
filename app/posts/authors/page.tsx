import { getAllAuthors } from "@/lib/wordpress";
import { ArchiveList } from "@/components/archive-list";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All Authors",
  description: "Browse all authors of our blog posts",
  alternates: { canonical: "/posts/authors" },
};

export default async function Page() {
  const authors = await getAllAuthors();
  return (
    <ArchiveList
      items={authors}
      title="All Authors"
      emptyMessage="No authors available yet."
      getHref={(author) => `/posts/?author=${author.id}`}
    />
  );
}
