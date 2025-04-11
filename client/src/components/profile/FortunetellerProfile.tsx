import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FortunetellerAvatar } from "@/assets/FortunetellerAvatar";

export function FortunetellerProfile() {
  const { t } = useLanguage();

  return (
    <Card className="mb-8">
      <CardContent className="p-4">
        <div className="flex items-center mb-4">
          <div className="mr-4">
            <FortunetellerAvatar />
          </div>
          <div>
            <h3 className="font-bold text-lg">
              {t("masterName")}
            </h3>
            <p className="text-neutral-500 text-sm">
              {t("masterTitle")}
            </p>
          </div>
        </div>
        <p className="text-neutral-600 mb-4">
          {t("masterDescription")}
        </p>
        <div className="flex space-x-2">
          <Badge variant="outline" className="bg-neutral-100 text-neutral-600 hover:bg-neutral-200">
            {t("saju")}
          </Badge>
          <Badge variant="outline" className="bg-neutral-100 text-neutral-600 hover:bg-neutral-200">
            {t("fengShuiTag")}
          </Badge>
          <Badge variant="outline" className="bg-neutral-100 text-neutral-600 hover:bg-neutral-200">
            {t("naming")}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
