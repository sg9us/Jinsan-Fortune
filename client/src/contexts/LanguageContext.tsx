import { createContext, useContext, ReactNode } from "react";
import { LanguageCode } from "@/lib/i18n";

type LanguageContextType = {
  language: LanguageCode;
  t: (key: string) => string;
};

const defaultValue: LanguageContextType = {
  language: "ko",
  t: (key: string) => key,
};

const LanguageContext = createContext<LanguageContextType>(defaultValue);

interface LanguageProviderProps {
  children: ReactNode;
}

import { translations } from "@/lib/i18n";

export function LanguageProvider({ children }: LanguageProviderProps) {
  // 한국어만 사용하도록 고정
  const language: LanguageCode = "ko";
  
  document.documentElement.lang = language;

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
