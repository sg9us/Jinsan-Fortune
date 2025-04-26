import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { useLanguage } from '@/contexts/LanguageContext';

interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

// 별점 표시 컴포넌트
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

// 리뷰 카드 컴포넌트
const ReviewCard = ({ review }: { review: Review }) => {
  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-5 mb-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <StarRating rating={review.rating} />
        </div>
        <div className="text-sm text-gray-500">
          {formatDate(review.createdAt)}
        </div>
      </div>
      <p className="text-gray-800 whitespace-pre-line mb-3">{review.comment}</p>
    </div>
  );
};

export function ReviewList() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // 리뷰 목록 조회
  const { data: reviews, isLoading, error } = useQuery<Review[]>({
    queryKey: ['/api/reviews'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin mr-2 h-6 w-6 border-2 border-t-primary border-l-primary border-gray-200 rounded-full"></div>
        <span>리뷰를 불러오는 중...</span>
      </div>
    );
  }

  if (error || !reviews) {
    return (
      <div className="text-center py-8 text-gray-600">
        리뷰를 불러오는데 실패했습니다.
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        아직 작성된 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요!
      </div>
    );
  }

  // 현재 페이지에 표시할 리뷰들
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, reviews.length);
  const currentReviews = reviews.slice(startIndex, endIndex);
  const totalPages = Math.ceil(reviews.length / pageSize);

  // 페이지네이션 핸들러
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">이용 후기</h2>
      
      <div className="space-y-4">
        {currentReviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
      
      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={page === 1}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            이전
          </button>
          <span className="px-3 py-1">
            {page} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}