import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  calculateSaju,
  fiveElements,
  fiveElementsEmoji,
  heavenlyStems,
  heavenlyStemsHanja,
  heavenlyStemsElements,
  earthlyBranches,
  earthlyBranchesHanja,
  earthlyBranchesElements,
  earthlyBranchesZodiac,
  tenGods,
  getElementColor,
  getSajuSummary
} from "@shared/saju";

export default function Saju() {
  const { t } = useLanguage();
  const [birthDate, setBirthDate] = useState<Date | undefined>(new Date());
  const [birthTime, setBirthTime] = useState<string>("");
  const [sajuResult, setSajuResult] = useState<any>(null);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("input");

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthTime(e.target.value);
  };

  const calculateResult = () => {
    if (!birthDate) return;

    // 사용자가 입력한 시간이 있는 경우
    let birthTimeObj;
    if (birthTime) {
      const [hours, minutes] = birthTime.split(":").map(Number);
      birthTimeObj = new Date(birthDate);
      birthTimeObj.setHours(hours, minutes, 0, 0);
    }

    // 사주 계산
    const sajuData = calculateSaju(birthDate, birthTimeObj);
    setSajuResult(sajuData);
    setIsCalculated(true);
    setActiveTab("result");
  };

  const formatPillar = (pillar: [number, number]) => {
    const [stemIndex, branchIndex] = pillar;
    return `${heavenlyStems[stemIndex]}${earthlyBranches[branchIndex]}`;
  };

  const getColorForElement = (element: string) => {
    switch (element) {
      case "목": return "bg-green-100 text-green-800";
      case "화": return "bg-red-100 text-red-800";
      case "토": return "bg-yellow-100 text-yellow-800";
      case "금": return "bg-gray-100 text-gray-800";
      case "수": return "bg-blue-100 text-blue-800";
      default: return "";
    }
  };

  return (
    <div className="px-4 py-6 pb-20">
      <h2 className="text-xl font-bold mb-4">사주팔자</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="input">입력</TabsTrigger>
          <TabsTrigger value="result" disabled={!isCalculated}>결과</TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <div className="space-y-6">
            <div>
              <Label className="block mb-2">생년월일</Label>
              <Calendar
                mode="single"
                selected={birthDate}
                onSelect={setBirthDate}
                className="border rounded-md p-2"
              />
            </div>

            <div>
              <Label htmlFor="birthTime" className="block mb-2">태어난 시간 (선택사항)</Label>
              <Input
                id="birthTime"
                type="time"
                value={birthTime}
                onChange={handleTimeChange}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">시간을 입력하지 않으면 시주를 제외한 결과가 제공됩니다.</p>
            </div>

            <Button className="w-full" onClick={calculateResult}>
              사주 확인하기
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="result">
          {sajuResult && (
            <div className="space-y-6">
              {/* 사주 팔자 표기 */}
              <Card>
                <CardHeader>
                  <CardTitle>사주 팔자</CardTitle>
                  <CardDescription>생년월일 기반 사주 결과</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">년주</p>
                      <div className="bg-gray-50 p-2 rounded-md">
                        <p className="font-bold">{formatPillar(sajuResult.yearPillar)}</p>
                        <p className="text-xs">{heavenlyStemsHanja[sajuResult.yearPillar[0]]}{earthlyBranchesHanja[sajuResult.yearPillar[1]]}</p>
                        <div className="mt-1 flex justify-center gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getColorForElement(heavenlyStemsElements[sajuResult.yearPillar[0]])}`}>
                            {heavenlyStemsElements[sajuResult.yearPillar[0]]}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getColorForElement(earthlyBranchesElements[sajuResult.yearPillar[1]])}`}>
                            {earthlyBranchesElements[sajuResult.yearPillar[1]]}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500">월주</p>
                      <div className="bg-gray-50 p-2 rounded-md">
                        <p className="font-bold">{formatPillar(sajuResult.monthPillar)}</p>
                        <p className="text-xs">{heavenlyStemsHanja[sajuResult.monthPillar[0]]}{earthlyBranchesHanja[sajuResult.monthPillar[1]]}</p>
                        <div className="mt-1 flex justify-center gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getColorForElement(heavenlyStemsElements[sajuResult.monthPillar[0]])}`}>
                            {heavenlyStemsElements[sajuResult.monthPillar[0]]}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getColorForElement(earthlyBranchesElements[sajuResult.monthPillar[1]])}`}>
                            {earthlyBranchesElements[sajuResult.monthPillar[1]]}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500">일주</p>
                      <div className="bg-gray-50 p-2 rounded-md border-2 border-primary">
                        <p className="font-bold">{formatPillar(sajuResult.dayPillar)}</p>
                        <p className="text-xs">{heavenlyStemsHanja[sajuResult.dayPillar[0]]}{earthlyBranchesHanja[sajuResult.dayPillar[1]]}</p>
                        <div className="mt-1 flex justify-center gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getColorForElement(heavenlyStemsElements[sajuResult.dayPillar[0]])}`}>
                            {heavenlyStemsElements[sajuResult.dayPillar[0]]}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getColorForElement(earthlyBranchesElements[sajuResult.dayPillar[1]])}`}>
                            {earthlyBranchesElements[sajuResult.dayPillar[1]]}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-primary mt-1">일간(일주 기준)</p>
                    </div>

                    {sajuResult.hourPillar && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500">시주</p>
                        <div className="bg-gray-50 p-2 rounded-md">
                          <p className="font-bold">{formatPillar(sajuResult.hourPillar)}</p>
                          <p className="text-xs">{heavenlyStemsHanja[sajuResult.hourPillar[0]]}{earthlyBranchesHanja[sajuResult.hourPillar[1]]}</p>
                          <div className="mt-1 flex justify-center gap-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getColorForElement(heavenlyStemsElements[sajuResult.hourPillar[0]])}`}>
                              {heavenlyStemsElements[sajuResult.hourPillar[0]]}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getColorForElement(earthlyBranchesElements[sajuResult.hourPillar[1]])}`}>
                              {earthlyBranchesElements[sajuResult.hourPillar[1]]}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-sm">
                    <p className="font-medium mb-1">태어난 동물</p>
                    <p className="mb-3">
                      {earthlyBranchesZodiac[sajuResult.yearPillar[1]]}띠
                    </p>
                    
                    <p className="font-medium mb-1">나의 사주팔자</p>
                    <p className="mb-3 font-mono">
                      {sajuResult.pillars.map((pillar: [number, number], index: number) => (
                        <span key={index}>
                          {heavenlyStems[pillar[0]]}{earthlyBranches[pillar[1]]}
                          {index < sajuResult.pillars.length - 1 ? ' ' : ''}
                        </span>
                      ))}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 오행 분포 */}
              <Card>
                <CardHeader>
                  <CardTitle>오행 분포</CardTitle>
                  <CardDescription>사주에 포함된 다섯 가지 기운의 분포</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {fiveElements.map((element, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <span className="mr-2">{fiveElementsEmoji[index]}</span>
                            <span className={getElementColor(element)}>{element}</span>
                          </div>
                          <span className="text-sm">{sajuResult.elements[element]}</span>
                        </div>
                        <Progress 
                          value={sajuResult.elements[element] * (100 / 8)} 
                          className={`h-2 ${
                            element === "목" ? "bg-green-200" :
                            element === "화" ? "bg-red-200" :
                            element === "토" ? "bg-yellow-200" :
                            element === "금" ? "bg-gray-200" :
                            "bg-blue-200"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 십신 분석 */}
              <Card>
                <CardHeader>
                  <CardTitle>십신 분석</CardTitle>
                  <CardDescription>일주를 기준으로 한 관계 분석</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {tenGods.map((god, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                        <span>{god}</span>
                        <span className="font-semibold">{sajuResult.tenGodsCounts[god] || 0}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 사주 요약 */}
              <Card>
                <CardHeader>
                  <CardTitle>사주 요약</CardTitle>
                  <CardDescription>사주의 기본적 특성</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {getSajuSummary(
                      sajuResult.elements, 
                      sajuResult.dayMaster, 
                      birthDate ? birthDate.getMonth() + 1 : 1
                    )}
                  </p>
                </CardContent>
              </Card>

              <Button className="w-full" onClick={() => setActiveTab("input")}>
                다시 계산하기
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}