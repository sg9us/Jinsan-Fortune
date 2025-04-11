import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { FengShuiScore } from "@shared/schema";

interface FengShuiResultsProps {
  data: FengShuiScore;
}

export function FengShuiResults({ data }: FengShuiResultsProps) {
  const { t } = useLanguage();
  const [_, navigate] = useLocation();

  return (
    <Card className="mb-6">
      <CardContent className="p-5">
        <h3 className="font-bold text-lg mb-3">
          {t("fengShuiResults")}
        </h3>
        
        {/* Score Display */}
        <div className="flex items-center justify-center my-6">
          <div 
            className="w-32 h-32 rounded-full border-8 flex items-center justify-center"
            style={{ borderColor: 'hsl(var(--secondary))' }}
          >
            <span className="text-4xl font-bold" style={{ color: 'hsl(var(--secondary))' }}>
              {data.overallScore}
            </span>
          </div>
        </div>
        
        {/* Analysis */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-neutral-700 mb-1">
              {t("overallAssessment")}
            </h4>
            <p className="text-neutral-600">
              {data.overall}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-neutral-700 mb-1">
                {t("wealth")}
              </h4>
              <Progress value={data.wealthScore} className="h-2" />
            </div>
            
            <div>
              <h4 className="font-medium text-neutral-700 mb-1">
                {t("health")}
              </h4>
              <Progress value={data.healthScore} className="h-2" color="green" />
            </div>
            
            <div>
              <h4 className="font-medium text-neutral-700 mb-1">
                {t("relationships")}
              </h4>
              <Progress value={data.relationshipScore} className="h-2" color="blue" />
            </div>
            
            <div>
              <h4 className="font-medium text-neutral-700 mb-1">
                {t("career")}
              </h4>
              <Progress value={data.careerScore} className="h-2" color="purple" />
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-neutral-700 mb-1">
              {t("advice")}
            </h4>
            <p className="text-neutral-600">
              {data.advice}
            </p>
          </div>
        </div>
        
        {/* CTA for Booking */}
        <div className="mt-6">
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => navigate("/booking")}
          >
            {t("bookProfessional")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
