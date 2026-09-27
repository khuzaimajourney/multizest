export type ToolCategory =
  | 'pdf-tools'
  | 'image-tools'
  | 'text-tools'
  | 'generator-tools'
  | 'developer-tools'
  | 'calculator-tools';

export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface ToolHowToStep {
  title: string;
  description: string;
}

export interface ToolItem {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  category: ToolCategory;
  categoryName: string;
  iconName: string;
  badge?: string;
  featured?: boolean;
  rating?: number;
  ratingCount?: number;
  howToSteps: ToolHowToStep[];
  features: string[];
  faqs: ToolFAQ[];
  relatedToolSlugs: string[];
}

export interface CategoryInfo {
  id: ToolCategory;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  color: string;
  benefits?: { title: string; description: string }[];
  faqs?: ToolFAQ[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  author: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  readTime: string;
  category: string;
  tags: string[];
  coverGradient: string;
  toc: { id: string; text: string; level: number }[];
  contentHtml: string;
  relatedToolSlugs: string[];
  relatedBlogSlugs: string[];
}
