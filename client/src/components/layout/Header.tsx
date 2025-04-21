import { useLanguage } from "@/contexts/LanguageContext";

export function Header() {
  const { t } = useLanguage();

  return (
    <header className="px-4 py-3 bg-white border-b border-neutral-200 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-primary">
          PaljaNote
        </h1>
      </div>
    </header>
  );
}
