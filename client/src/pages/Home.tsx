import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { HeroSection } from "@/assets/HeroSection";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { Button } from "@/components/ui/button";
import { User, Home as HomeIcon, FileSignature, MessageCircle } from "lucide-react";

export default function Home() {
  const { t } = useLanguage();
  const [_, navigate] = useLocation();

  const services = [
    {
      icon: User,
      title: "사주 상담",
      description: "생년월일을 통한 운세 분석",
      path: "/chat",
      color: "hsl(var(--primary))"
    },
    {
      icon: HomeIcon,
      title: "풍수 점수 확인",
      description: "주소 기반 풍수 환경 분석",
      path: "/fengshui",
      color: "hsl(var(--secondary))"
    },
    {
      icon: FileSignature,
      title: "작명 상담",
      description: "이름과 운명의 조화 분석",
      path: "/booking",
      color: "hsl(var(--accent, 35 93% 65%))"
    }
  ];

  return (
    <div className="px-4 py-6 pb-20 relative">
      {/* Hero Section */}
      <div className="mb-6">
        <HeroSection />
      </div>

      {/* Booking CTA - 이동됨 */}
      <div className="bg-primary/5 rounded-xl p-5 mb-8">
        <h3 className="font-bold text-lg mb-2">
          지금 상담 예약하기
        </h3>
        <p className="text-neutral-600 text-sm mb-4">
          개인 맞춤형 상담을 통해 더 자세한 운세를 알아보세요.
        </p>
        <Button 
          className="w-full" 
          onClick={() => navigate("/booking")}
        >
          예약하기
        </Button>
      </div>

      {/* Services Section - 가로 배치로 변경 */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">
          서비스
        </h2>
        
        <div className="grid grid-cols-3 gap-3">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-white shadow-sm rounded-xl p-3 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(service.path)}
              style={{ borderTop: `3px solid ${service.color}` }}
            >
              <div className="flex flex-col items-center text-center">
                <service.icon className="h-8 w-8 mb-2" style={{ color: service.color }} />
                <h3 className="font-medium text-sm">{service.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Reviews Section */}
      <ReviewsSection />

      {/* Floating Chat Button */}
      <div className="fixed bottom-20 right-4 z-10">
        <Button 
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => navigate("/chat")}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
