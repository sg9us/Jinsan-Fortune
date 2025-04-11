import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

export function Header() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "ko" ? "en" : "ko");
  };

  return (
    <header className="px-4 py-3 bg-white border-b border-neutral-200 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-primary">
          {t("appTitle")}
        </h1>
      </div>
      <Button 
        variant="ghost" 
        onClick={toggleLanguage}
        className="p-2 text-sm rounded-full hover:bg-neutral-100 transition-colors"
      >
        {language === "ko" ? "EN" : "KO"}
      </Button>
    </header>
  );
}
