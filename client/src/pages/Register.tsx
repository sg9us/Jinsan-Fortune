
import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserInfo {
  id: string;
  nickname: string;
  provider: string;
  provider_id: string;
  email: string | null;
  created_at: string;
  last_login_at: string;
  isAuthenticated: boolean;
  isRegistered?: boolean;
}

export default function Register() {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // 사용자 정보 상태
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // 폼 입력 상태
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [isTimeUnknown, setIsTimeUnknown] = useState(false);
  const [ageRange, setAgeRange] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await apiRequest("/api/auth/me");
        const data = response as unknown as UserInfo;
        
        if (data.isAuthenticated) {
          setUserInfo(data);
          
          // 이미 회원가입을 완료한 사용자는 홈으로 리다이렉트
          if (data.isRegistered) {
            navigate("/");
            return;
          }
          
          // 닉네임이 있으면 기본값으로 설정
          if (data.nickname) {
            setFullName(data.nickname);
          }
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("사용자 정보 불러오기 실패:", error);
        toast({
          title: "오류",
          description: "사용자 정보를 불러오는데 실패했습니다. 다시 로그인해주세요.",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    fetchUserInfo();
  }, [navigate, toast]);

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !gender || !birthYear || !birthMonth || !birthDay || !ageRange || !phoneNumber) {
      toast({
        title: "입력 오류",
        description: "필수 입력 항목을 모두 작성해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          gender,
          birthYear,
          birthMonth,
          birthDay,
          birthTime: isTimeUnknown ? null : birthTime,
          isTimeUnknown,
          ageRange,
          phoneNumber,
        }),
      });
      
      const result = response as any;
      
      if (result.success) {
        toast({
          title: "회원가입 완료",
          description: "회원가입이 성공적으로 완료되었습니다.",
        });
        
        navigate("/");
      } else {
        toast({
          title: "회원가입 실패",
          description: result.message || "회원가입 처리 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("회원가입 요청 실패:", error);
      toast({
        title: "오류",
        description: "회원가입 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 전화번호 입력 형식 처리
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbersOnly = value.replace(/[^0-9]/g, "");
    
    if (numbersOnly.length <= 11) {
      let formattedNumber = numbersOnly;
      
      if (numbersOnly.length > 3 && numbersOnly.length <= 7) {
        formattedNumber = `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3)}`;
      } else if (numbersOnly.length > 7) {
        formattedNumber = `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 7)}-${numbersOnly.slice(7)}`;
      }
      
      setPhoneNumber(formattedNumber);
    }
  };

  return (
    <div className="container py-6">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">회원가입</CardTitle>
          <CardDescription className="text-center">
            서비스 이용을 위해 추가 정보를 입력해주세요.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            {/* 소셜 로그인 정보 표시 */}
            {userInfo && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700">
                  <span className="text-primary">{userInfo.provider === 'kakao' ? '카카오' : '네이버'}</span>로 로그인 되었습니다.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  닉네임: {userInfo.nickname}
                  {userInfo.email && ` · 이메일: ${userInfo.email}`}
                </p>
              </div>
            )}

            {/* 이름 */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="font-medium">
                이름 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                placeholder="이름을 입력하세요"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            {/* 성별 */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="font-medium">
                성별 <span className="text-red-500">*</span>
              </Label>
              <Select value={gender} onValueChange={setGender} required>
                <SelectTrigger id="gender" className="focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="성별을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">남성</SelectItem>
                  <SelectItem value="female">여성</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 생년월일 */}
            <div className="space-y-2">
              <Label htmlFor="birthYear" className="font-medium">
                생년월일 <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  id="birthYear"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="YYYY"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="focus:ring-2 focus:ring-primary/20"
                  required
                />
                <Input
                  id="birthMonth"
                  type="number"
                  min="1"
                  max="12"
                  placeholder="MM"
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className="focus:ring-2 focus:ring-primary/20"
                  required
                />
                <Input
                  id="birthDay"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="DD"
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  className="focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                사주 분석에 필요한 정보입니다. 정확한 생년월일을 입력해주세요.
              </p>
            </div>

            {/* 출생시간 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="birthTime" className="font-medium">출생시간</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="timeUnknown"
                    checked={isTimeUnknown}
                    onCheckedChange={(checked) => {
                      setIsTimeUnknown(checked as boolean);
                      if (checked) {
                        setBirthTime("");
                      }
                    }}
                  />
                  <Label htmlFor="timeUnknown" className="text-sm">모름</Label>
                </div>
              </div>
              <Input
                id="birthTime"
                type="time"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                disabled={isTimeUnknown}
                className="focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground">
                출생시간을 모르시는 경우 '모름'을 체크해주세요. 시간없이도 사주 분석이 가능합니다.
              </p>
            </div>

            {/* 연령대 */}
            <div className="space-y-2">
              <Label htmlFor="ageRange" className="font-medium">
                연령대 <span className="text-red-500">*</span>
              </Label>
              <Select value={ageRange} onValueChange={setAgeRange} required>
                <SelectTrigger id="ageRange" className="focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="연령대를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10-19">10대</SelectItem>
                  <SelectItem value="20-29">20대</SelectItem>
                  <SelectItem value="30-39">30대</SelectItem>
                  <SelectItem value="40-49">40대</SelectItem>
                  <SelectItem value="50-59">50대</SelectItem>
                  <SelectItem value="60+">60대 이상</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* 전화번호 */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="font-medium">
                전화번호 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phoneNumber"
                placeholder="010-0000-0000"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                className="focus:ring-2 focus:ring-primary/20"
                required
              />
              <p className="text-xs text-muted-foreground">
                예약 확인 및 공지에 사용됩니다. 정확한 번호를 입력해주세요.
              </p>
            </div>

            {/* 개인정보 동의 */}
            <div className="space-y-4 border-t pt-4 mt-2">
              <h3 className="text-sm font-medium">약관 동의</h3>
              
              <div className="flex items-start space-x-2 bg-gray-50 p-3 rounded-md">
                <Checkbox id="privacy" className="mt-1" required />
                <div>
                  <Label htmlFor="privacy" className="text-sm font-medium">
                    <a href="https://terrific-laugh-d1f.notion.site/1e1189caa53d80dea2e6cb6e25543b01?pvs=4" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="text-primary hover:underline">
                      개인정보 수집 및 이용
                    </a>에 동의합니다 <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    서비스 이용을 위해 필수 정보를 수집합니다. 동의하지 않을 경우 서비스 이용이 제한됩니다.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2 bg-gray-50 p-3 rounded-md">
                <Checkbox id="marketing" className="mt-1" />
                <div>
                  <Label htmlFor="marketing" className="text-sm font-medium">
                    마케팅 정보 수신에 동의합니다 (선택)
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    이벤트, 혜택 등 마케팅 정보를 SMS와 이메일로 받아보실 수 있습니다.
                  </p>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
                <p className="font-medium mb-1">개인정보 수집 안내</p>
                <ul className="space-y-1 pl-4 list-disc">
                  <li>수집항목: 이름, 성별, 생년월일, 출생시간, 연령대, 전화번호</li>
                  <li>수집목적: 사주/운세 상담 서비스 제공, 예약 확인 및 알림</li>
                  <li>보유기간: 회원 탈퇴 시까지</li>
                  <li>수집 일시: {new Date().toLocaleDateString()}</li>
                </ul>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="pt-2 pb-4">
            <Button 
              type="submit" 
              className="w-full py-6 text-base font-medium transition-all hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? "처리 중..." : "가입 완료"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
