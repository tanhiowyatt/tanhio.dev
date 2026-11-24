import { Bookshelf as BookshelfDisplay } from "@/components/ui/bookshelf";
import { bookshelfConfig } from "@/config/books";
import type { Book } from "@/config/types";

export function Bookshelf({ books }: { books: Book[] }) {
  return (
    <section className="pt-4" aria-label={bookshelfConfig.title}>
      <h2 className="no-js-visible section-heading mb-3">{bookshelfConfig.title}</h2>
      <BookshelfDisplay
        books={books}
        defaultBookId={bookshelfConfig.defaultBookId}
        label={bookshelfConfig.title}
        emptyMessage={bookshelfConfig.empty}
        coverUnavailableMessage={bookshelfConfig.coverUnavailable}
        revealOnScroll
      />
    </section>
  );
}
