"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCustomerAuthStore } from "@/stores/customer-auth-store";
import { createReview, fetchReviews } from "../api";
import type { Review } from "../types";

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-accent">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={14} fill={i < rating ? "currentColor" : "none"} />
      ))}
    </div>
  );
}

export function ReviewsSection({
  productSlug,
  initialReviews,
}: {
  productSlug: string;
  initialReviews: Review[];
}) {
  const pathname = usePathname();
  const isLoggedIn = useCustomerAuthStore((state) => !!state.customer);
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data: reviews } = useQuery({
    queryKey: ["reviews", productSlug],
    queryFn: () => fetchReviews(productSlug),
    initialData: initialReviews,
  });

  const submitReview = useMutation({
    mutationFn: () => createReview(productSlug, { rating, comment: comment || undefined }),
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["reviews", productSlug] });
    },
  });

  return (
    <section className="space-y-6">
      <h2 className="font-display text-3xl font-bold text-heading">
        Đánh giá sản phẩm {reviews.length > 0 && `(${reviews.length})`}
      </h2>

      <div className="space-y-4">
        {reviews.length === 0 && (
          <p className="text-foreground/60">Chưa có đánh giá nào cho sản phẩm này.</p>
        )}
        {reviews.map((review) => (
          <div key={review.id} className="rounded-brand border-2 border-secondary bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-heading">{review.customer.name}</p>
              <StarRow rating={review.rating} />
            </div>
            {review.comment && <p className="mt-2 text-sm text-foreground/80">{review.comment}</p>}
          </div>
        ))}
      </div>

      {isLoggedIn ? (
        <div className="space-y-3 rounded-brand border-2 border-secondary bg-secondary/40 p-5">
          <p className="font-semibold text-heading">Viết đánh giá của bạn</p>
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                className="text-accent"
                aria-label={`${i + 1} sao`}
              >
                <Star size={22} fill={i < rating ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ cảm nhận của bạn (không bắt buộc)"
            rows={3}
            className="w-full rounded-lg border-2 border-secondary bg-white px-3 py-2 text-sm outline-none focus:border-accent"
          />
          {submitReview.isError && (
            <p className="text-sm text-destructive">
              Không gửi được đánh giá — có thể bạn đã đánh giá sản phẩm này rồi.
            </p>
          )}
          <button
            type="button"
            onClick={() => submitReview.mutate()}
            disabled={submitReview.isPending}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-accent/30 transition-transform hover:scale-105 disabled:opacity-60"
          >
            {submitReview.isPending ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      ) : (
        <p className="text-sm text-foreground/70">
          <Link
            href={`/dang-nhap?redirect=${encodeURIComponent(pathname)}`}
            className="font-semibold text-accent hover:underline"
          >
            Đăng nhập
          </Link>{" "}
          để viết đánh giá.
        </p>
      )}
    </section>
  );
}
