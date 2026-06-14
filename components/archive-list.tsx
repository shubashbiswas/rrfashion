import { Section, Container, Prose } from "@/components/craft";
import BackButton from "@/components/back";
import Link from "next/link";

interface ArchiveItem {
  id: number;
  name: string;
  slug?: string;
}

interface ArchiveListProps<T extends ArchiveItem> {
  items: T[];
  title: string;
  emptyMessage: string;
  getHref: (item: T) => string;
  getLabel?: (item: T) => string;
}

export function ArchiveList<T extends ArchiveItem>({
  items,
  title,
  emptyMessage,
  getHref,
  getLabel = (item) => item.name,
}: ArchiveListProps<T>) {
  return (
    <Section>
      <Container className="space-y-6">
        <Prose className="mb-8">
          <h2>{title}</h2>
          {items.length > 0 ? (
            <ul className="grid">
              {items.map((item) => (
                <li key={item.id}>
                  <Link href={getHref(item)}>{getLabel(item)}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">{emptyMessage}</p>
          )}
        </Prose>
        <BackButton />
      </Container>
    </Section>
  );
}
