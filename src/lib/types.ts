// Shared types for blog and portfolio

export interface BlogMeta {
  slug: string;
  title: string;
  date: string;
  updated?: string;
  tags: string[];
  summary: string;
  image?: string;
}

export interface BlogFrontmatter {
  title?: string;
  date?: string;
  updated?: string;
  tags?: string[];
  summary?: string;
  image?: string;
}

export type PortfolioProject = {
  title: string;
  description: string;
  date: string;
  tags: string[];
  images: string[];
  link?: string;
};

export interface FooterQuote {
  text: string;
  author?: string;
}

export interface AboutSlide {
  id: string;
  eyebrow: string;
  title: string;
  pillText?: string;
  imageAlt: string;
  imageSrc?: string;
  imagePosition?: string;
  shadowProfile?: AboutSlideShadowProfile;
  paragraphs: string[];
  links?: AboutSlideLink[];
}

export interface AboutSlideShadowProfile {
  desktopColors: [string, string, string];
  mobileColors: [string, string, string];
  textureColor: string;
  opacity: number;
}

export interface AboutSlideLink {
  label: string;
  href: string;
  icon: "email" | "github" | "linkedin" | "external" | "goodreads" | "blog" | "steam";
  external?: boolean;
}
