import { getAllTags } from "@/lib/wordpress";
import { ArchiveList } from "@/components/archive-list";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "All Tags",
  description: "Browse all tags of our blog posts",
  alternates: { canonical: "/posts/tags" },
};

export default async function Page() {
  const tags = await getAllTags();
  return (
    <ArchiveList
      items={tags}
      title="All Tags"
      emptyMessage="No tags available yet."
      getHref={(tag) => `/posts/?tag=${tag.id}`}
    />
  );
}
