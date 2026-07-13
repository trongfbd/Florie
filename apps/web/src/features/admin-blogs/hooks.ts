import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createBlog, deleteBlog, fetchBlog, fetchBlogs, updateBlog } from "./api";
import type { BlogFormInput } from "./types";

const KEY = ["admin-blogs"];

export function useBlogs(query: { page?: number }) {
  return useQuery({ queryKey: [...KEY, query], queryFn: () => fetchBlogs(query) });
}

export function useBlog(id: string) {
  return useQuery({ queryKey: [...KEY, id], queryFn: () => fetchBlog(id), enabled: !!id });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BlogFormInput) => createBlog(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateBlog(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<BlogFormInput>) => updateBlog(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBlog(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
