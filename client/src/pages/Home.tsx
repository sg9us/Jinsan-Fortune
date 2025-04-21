import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { HeroSection } from "@/assets/HeroSection";
import { FortunetellerProfile } from "@/components/profile/FortunetellerProfile";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Home as HomeIcon, FileSignature, MessageCircle } from "lucide-react";

export default function Home() {
  const { t } = useLanguage();
  const [_, navigate] = useLocation();

  const services = [
    {
      icon: User,
      title: t("sajuReading"),
      description: t("sajuDescription"),
      path: "/chat",
      color: "hsl(var(--primary))"
    },
    {
      icon: HomeIcon,
      title: t("fengShuiScore"),
      description: t("fengShuiDescription"),
      path: "/fengshui",
      color: "hsl(var(--secondary))"
    },
    {
      icon: FileSignature,
      title: t("namingConsultation"),
      description: t("namingDescription"),
      path: "/booking",
      color: "hsl(var(--accent, 35 93% 65%))"
    }
  ];

  return (
    <div className="px-4 py-6">
      {/* Hero Section */}
      <div className="mb-8">
        <HeroSection />
      </div>

      {/* Fortune Teller Profile */}
      <FortunetellerProfile />

      {/* Services Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">
          {t("services")}
        </h2>
        
        {services.map((service, index) => (
          <ServiceCard
            key={index}
            icon={service.icon}
            title={service.title}
            description={service.description}
            path={service.path}
            color={service.color}
          />
        ))}
      </section>

      {/* Booking CTA */}
      <div className="bg-primary/5 rounded-xl p-5 mb-8">
        <h3 className="font-bold text-lg mb-2">
          {t("bookConsultation")}
        </h3>
        <p className="text-neutral-600 text-sm mb-4">
          {t("bookingSubtitle")}
        </p>
        <Button 
          className="w-full" 
          onClick={() => navigate("/booking")}
        >
          {t("bookNow")}
        </Button>
      </div>

      {/* Simple Chat Preview */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">
          {t("quickSajuChat")}
        </h2>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-neutral-600 mb-3">
              {t("chatSubtitle")}
            </p>
            <div className="mb-3">
              <div className="bg-neutral-200 text-neutral-700 p-3 rounded-lg max-w-[80%] mr-auto">
                {t("chatWelcome")}
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/chat")}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              {t("startChatting")}
            </Button>
          </CardContent>
        </Card>
      </section>
      
      {/* Reviews Section */}
      <ReviewsSection />
    </div>
  );
}
