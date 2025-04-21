import { Star, UserCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { type Review } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const { language } = useLanguage();
  
  // Date formatting based on language
  const formattedDate = formatDistanceToNow(new Date(review.createdAt || new Date()), { 
    addSuffix: true,
    locale: language === 'ko' ? ko : undefined 
  });

  // Service type translation map
  const serviceTypeMap: Record<string, { ko: string; en: string }> = {
    "saju": { ko: "사주 상담", en: "Saju Reading" },
    "naming": { ko: "작명 상담", en: "Name Analysis" },
    "fengshui": { ko: "풍수 컨설팅", en: "Feng Shui Consultation" },
    "tarot": { ko: "타로 상담", en: "Tarot Reading" },
  };

  // Get the service type label based on language
  const serviceTypeLabel = serviceTypeMap[review.serviceType]?.[language] || review.serviceType;

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <UserCircle2 className="h-10 w-10 text-neutral-300 mr-3" />
            <div>
              <p className="font-medium">{review.name}</p>
              <p className="text-xs text-neutral-500">{serviceTypeLabel} • {formattedDate}</p>
            </div>
          </div>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-neutral-300"}
              />
            ))}
          </div>
        </div>
        <p className="text-neutral-700 text-sm whitespace-pre-line">{review.content}</p>
      </CardContent>
    </Card>
  );
}