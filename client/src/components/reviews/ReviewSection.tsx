import { ReviewForm } from './ReviewForm';
import { ReviewList } from './ReviewList';

export function ReviewSection() {
  return (
    <section className="py-12 px-4 bg-gray-50" id="reviews">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-10">고객 후기</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <ReviewForm />
          </div>
          <div>
            <ReviewList />
          </div>
        </div>
      </div>
    </section>
  );
}