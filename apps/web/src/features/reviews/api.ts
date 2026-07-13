import { customerApiClient } from "@/lib/customer-api-client";
import type { CreateReviewInput, Review } from "./types";

export async function fetchReviews(productSlug: string): Promise<Review[]> {
  const { data } = await customerApiClient.get<Review[]>(
    `/api/v1/storefront/products/${productSlug}/reviews`,
  );
  return data;
}

export async function createReview(productSlug: string, input: CreateReviewInput): Promise<Review> {
  const { data } = await customerApiClient.post<Review>(
    `/api/v1/storefront/products/${productSlug}/reviews`,
    input,
  );
  return data;
}
