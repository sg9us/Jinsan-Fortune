import { useLanguage } from "@/contexts/LanguageContext";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
      <img 
        src="https://images.unsplash.com/photo-1518756131217-31eb79b20e8f?auto=format&fit=crop&w=600&h=192" 
        alt={t("heroTitle")}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
        <div className="p-4 text-white">
          <h2 className="text-2xl font-bold mb-1">
            {t("heroTitle")}
          </h2>
          <p className="text-sm">
            {t("heroSubtitle")}
          </p>
        </div>
      </div>
    </div>
  );
}
