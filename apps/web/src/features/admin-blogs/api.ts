import { adminApiClient } from "@/lib/admin-api-client";
import type { Blog, BlogFormInput, PaginatedBlogs } from "./types";

export async function fetchBlogs(query: { page?: number }): Promise<PaginatedBlogs> {
  const { data } = await adminApiClient.get<PaginatedBlogs>("/api/v1/blogs", { params: query });
  return data;
}

export async function fetchBlog(id: string): Promise<Blog> {
  const { data } = await adminApiClient.get<Blog>(`/api/v1/blogs/${id}`);
  return data;
}

export async function createBlog(input: BlogFormInput): Promise<Blog> {
  const { data } = await adminApiClient.post<Blog>("/api/v1/blogs", input);
  return data;
}

export async function updateBlog(id: string, input: Partial<BlogFormInput>): Promise<Blog> {
  const { data } = await adminApiClient.patch<Blog>(`/api/v1/blogs/${id}`, input);
  return data;
}

export async function deleteBlog(id: string): Promise<void> {
  await adminApiClient.delete(`/api/v1/blogs/${id}`);
}
