export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: { name: string };
}

export interface CreateReviewInput {
  rating: number;
  comment?: string;
}
