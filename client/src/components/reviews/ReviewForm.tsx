import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLanguage } from '@/contexts/LanguageContext';

// 별점 컴포넌트
const StarRating = ({ rating, setRating }: { rating: number; setRating: (rating: number) => void }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          className={`text-2xl focus:outline-none ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

// 폼 스키마
const reviewSchema = z.object({
  comment: z.string().min(5, '리뷰는 최소 5자 이상이어야 합니다.').max(500, '리뷰는 최대 500자까지 가능합니다.'),
  rating: z.number().min(1, '별점을 선택해주세요.').max(5)
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export function ReviewForm() {
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      comment: '',
      rating: 0
    }
  });

  // 별점 변경 핸들러
  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setValue('rating', newRating);
  };

  // 폼 제출 핸들러
  const onSubmit = async (data: ReviewFormValues) => {
    try {
      setIsSubmitting(true);
      
      await apiRequest('/api/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // 성공 시 폼 초기화
      reset();
      setRating(0);
      
      // 리뷰 목록 갱신
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      
      alert('리뷰가 성공적으로 등록되었습니다!');
    } catch (error) {
      console.error('리뷰 등록 오류:', error);
      if ((error as any)?.status === 401) {
        alert('리뷰 작성을 위해 로그인이 필요합니다.');
      } else {
        alert('리뷰 등록 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">이용 후기 작성</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block mb-2 font-medium">별점</label>
          <StarRating rating={rating} setRating={handleRatingChange} />
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="comment" className="block mb-2 font-medium">
            후기 내용
          </label>
          <textarea
            id="comment"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            rows={4}
            placeholder="철학관 방문 경험에 대한 후기를 남겨주세요."
            {...register('comment')}
          />
          {errors.comment && (
            <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:bg-gray-400"
        >
          {isSubmitting ? '등록 중...' : '후기 등록하기'}
        </button>
      </form>
    </div>
  );
}