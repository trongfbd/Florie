export type BlogStatus = "DRAFT" | "PUBLISHED";

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnailUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: BlogStatus;
  publishedAt: string | null;
  author: { id: string; name: string };
}

export interface BlogFormInput {
  title: string;
  slug?: string;
  content: string;
  thumbnailUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  status?: BlogStatus;
}

export interface PaginatedBlogs {
  data: Blog[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
