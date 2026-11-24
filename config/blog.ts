export interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  category: "it" | "non-it";
  order: number;
  enabled?: boolean;
  image?: string;
}

export const blogSectionConfig = {
  title: "tanhiowyatt Blog",
  description:
    "Notes on application security, internet infrastructure, and software freedom.",
};

export const blogConfig: BlogPost[] = [
  {
    id: "runet-blocks",
    title: "The Sunset of the Internet in Russia",
    date: "2025-12-10",
    excerpt:
      "In this article, we will try to look into the future of the Internet for the next five years and understand what changes are already knocking on our digital door.",
    image: "/images/blog/runet-blocks/runet-blocks.webp",
    category: "it",
    order: 1,
    enabled: true,
  },
  {
    id: "thum",
    title: "Transhumanism — the Choice of Progressivists",
    date: "2025-04-25",
    excerpt:
      "Transhumanism is a philosophical and scientific movement advocating for the radical improvement of human beings using advanced technologies.",
    image: "/images/blog/thum/thum.webp",
    category: "non-it",
    order: 2,
    enabled: true,
  },
  {
    id: "dogs-and-govs",
    title: "Libertarian Solution to the Issue of Stray Animals",
    date: "2025-04-22",
    excerpt:
      "The problem of stray animals remains relevant for many regions of Russia. The libertarian approach proposes minimizing state intervention.",
    image: "/images/blog/dogs-and-govs/dogs-and-govs.webp",
    category: "non-it",
    order: 3,
    enabled: true,
  },
  {
    id: "icann",
    title: "How ICANN Kills Hope for a Free Internet",
    date: "2023-08-28",
    excerpt:
      "ICANN, created to manage the Domain Name System, initially seemed like a necessary compromise, but its activity raises concerns.",
    image: "/images/blog/icann/icann.webp",
    category: "it",
    order: 4,
    enabled: true,
  },
  {
    id: "industrial-ussr",
    title: "How the Soviet Union Achieved a Technological Leap in the 1930s-1950s",
    date: "2022-12-14",
    excerpt:
      "An investigation of the tools through which the USSR accomplished a technical leap in the 30s-50s of the 20th century.",
    image: "/images/blog/industrial-ussr/industrial-ussr.webp",
    category: "non-it",
    order: 5,
    enabled: true,
  },
];

export function getEnabledPosts(): BlogPost[] {
  return blogConfig.filter((post) => post.enabled !== false);
}
