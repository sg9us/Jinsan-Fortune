import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { ReviewCard } from "./ReviewCard";
import { type Review } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useLocation } from "wouter";
import { ReviewForm } from "./ReviewForm";

export function ReviewsSection() {
  const [_, navigate] = useLocation();
  const [showForm, setShowForm] = useState(false);

  // Fetch reviews
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["/api/reviews"],
    enabled: true,
  });

  // Type guard to check if we have review data
  const reviews = reviewsData as Review[] || [];

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">이용 후기</h2>
        {!showForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            후기 작성하기
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <ReviewForm onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-6">
          <p className="text-neutral-500">로딩 중...</p>
        </div>
      ) : reviews.length > 0 ? (
        <>
          {reviews.slice(0, 3).map((review: Review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          {reviews.length > 3 && (
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => navigate("/reviews")}
                className="text-primary"
              >
                모든 후기 보기
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-neutral-50 p-6 rounded-lg text-center">
          <p className="text-neutral-600 mb-3">아직 후기가 없습니다</p>
          {!showForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(true)}
            >
              첫 번째 후기를 작성해 보세요
            </Button>
          )}
        </div>
      )}
    </section>
  );
}