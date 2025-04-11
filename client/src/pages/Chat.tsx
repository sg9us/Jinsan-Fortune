import { useLanguage } from "@/contexts/LanguageContext";
import { SajuChatbot } from "@/components/chat/SajuChatbot";

export default function Chat() {
  const { t } = useLanguage();

  return (
    <div className="px-4 py-6">
      <h2 className="text-xl font-bold mb-4">
        {t("quickSajuChat")}
      </h2>

      <SajuChatbot />

      <div className="mt-6 text-center text-neutral-500 text-sm">
        <p>{t("chatDisclaimer")}</p>
      </div>
    </div>
  );
}
