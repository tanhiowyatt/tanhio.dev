import type { Book } from "@/config/types";

export const bookshelfConfig = {
  title: "Bookshelf",
  href: "/#bookshelf",
  defaultBookId: null,
  coverUnavailable: "Cover unavailable",
  empty: "More books will find their way here.",
};

export const booksConfig: Book[] = [
  {
    id: "steve-jobs",
    title: "Steve Jobs",
    author: "Walter Isaacson",
    cover: {
      src: "/images/books/steve-jobs.svg",
      width: 920,
      height: 1400,
      alt: "Steve Jobs by Walter Isaacson, cover with a monochrome vector portrait",
    },
    sourceUrl:
      "https://www.simonandschuster.com/books/Steve-Jobs/Walter-Isaacson/9781451648539",
    coverSourceUrl:
      "https://d28hgpri8am2if.cloudfront.net/book_images/cvr9781451648539_9781451648539_hr.jpg",
    spine: { src: "/images/books/steve-jobs-spine.svg", height: 286, width: 46 },
    order: 4,
  },
  {
    id: "elon-musk",
    title: "Elon Musk",
    author: "Walter Isaacson",
    cover: {
      src: "/images/books/elon-musk.svg",
      width: 1045,
      height: 1600,
      alt: "Elon Musk by Walter Isaacson, black cover with white lettering",
    },
    sourceUrl: "https://www.simonandschuster.com/books/Elon-Musk/Walter-Isaacson/9781982181294/",
    coverSourceUrl:
      "https://m.media-amazon.com/images/I/91SdCp+ZRxL._SL1500_.jpg",
    spine: { src: "/images/books/elon-musk-spine.svg", height: 252, width: 28 },
    order: 0,
  },
  {
    id: "1984",
    title: "1984",
    author: "George Orwell",
    cover: {
      src: "/images/books/1984.svg",
      width: 1045,
      height: 1600,
      alt: "1984 by George Orwell, dark cover with red and white lettering",
    },
    sourceUrl: "https://www.penguinrandomhouse.com/books/12188/1984-by-george-orwell/",
    coverSourceUrl:
      "https://images.penguinrandomhouse.com/cover/9780451524935",
    spine: { src: "/images/books/1984-spine.svg", height: 260, width: 36 },
    order: 1,
  },
  {
    id: "we",
    title: "We",
    author: "Yevgeny Zamyatin",
    cover: {
      src: "/images/books/we.svg",
      width: 1045,
      height: 1600,
      alt: "We by Yevgeny Zamyatin",
    },
    spine: { src: "/images/books/we-spine.svg", height: 230, width: 30 },
    order: 2,
  },
  {
    id: "atlas-shrugged",
    title: "Atlas Shrugged",
    author: "Ayn Rand",
    cover: {
      src: "/images/books/atlas-shrugged.svg",
      width: 1124,
      height: 1600,
      alt: "Atlas Shrugged by Ayn Rand, white cover with gray lettering",
    },
    sourceUrl: "https://www.penguinrandomhouse.com/books/311788/atlas-shrugged-by-ayn-rand/",
    coverSourceUrl:
      "https://images.penguinrandomhouse.com/cover/9780525952684",
    spine: { src: "/images/books/atlas-shrugged-spine.svg", height: 278, width: 54 },
    order: 3,
  },
  {
    id: "cybersecurity-main-principles",
    title: "Cybersecurity: Main Principles",
    author: "Unknown",
    cover: {
      src: "/images/books/cybersecurity-main-principles.svg",
      width: 1045,
      height: 1600,
      alt: "Cybersecurity: Main Principles",
    },
    spine: {
      src: "/images/books/cybersecurity-main-principles-spine.svg",
      height: 270,
      width: 26,
    },
    order: 5,
  },
  {
    id: "the-fountainhead",
    title: "The Fountainhead",
    author: "Ayn Rand",
    cover: {
      src: "/images/books/the-fountainhead.svg",
      width: 1045,
      height: 1600,
      alt: "The Fountainhead by Ayn Rand",
    },
    spine: { src: "/images/books/the-fountainhead-spine.svg", height: 246, width: 28 },
    order: 6,
  },
  {
    id: "anarchy-state-and-utopia",
    title: "Anarchy, State, and Utopia",
    author: "Robert Nozick",
    cover: {
      src: "/images/books/anarchy-state-and-utopia.svg",
      width: 1045,
      height: 1600,
      alt: "Anarchy, State, and Utopia by Robert Nozick",
    },
    spine: {
      src: "/images/books/anarchy-state-and-utopia-spine.svg",
      height: 270,
      width: 28,
    },
    order: 7,
  },
  {
    id: "fathers-and-sons",
    title: "Fathers & Sons",
    author: "Ivan Turgenev",
    cover: {
      src: "/images/books/fathers-and-sons.svg",
      width: 1031,
      height: 1600,
      alt: "Fathers & Sons by Ivan Turgenev",
    },
    spine: {
      src: "/images/books/fathers-and-sons-spine.svg",
      height: 277,
      width: 34,
    },
    order: 8,
  },
  {
    id: "we-the-living",
    title: "We the Living",
    author: "Ayn Rand",
    cover: {
      src: "/images/books/we-the-living.svg",
      width: 1045,
      height: 1600,
      alt: "We the Living by Ayn Rand",
    },
    spine: {
      src: "/images/books/we-the-living-spine.svg",
      height: 264,
      width: 24,
    },
    order: 9,
  },
];

export function getEnabledBooks() {
  return booksConfig
    .filter((book) => book.enabled !== false)
    .sort((a, b) => a.order - b.order);
}
