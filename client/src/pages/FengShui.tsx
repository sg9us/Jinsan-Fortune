import { useLanguage } from "@/contexts/LanguageContext";
import { FengShuiForm } from "@/components/fengshui/FengShuiForm";

export default function FengShui() {
  const { t } = useLanguage();

  return (
    <div className="px-4 py-6">
      <h2 className="text-xl font-bold mb-6">
        {t("fengShuiTitle")}
      </h2>

      <FengShuiForm />
    </div>
  );
}
