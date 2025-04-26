
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">이름 <span className="text-red-500">*</span></Label>
              <Input
                id="fullName"
                placeholder="이름을 입력하세요"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">성별 <span className="text-red-500">*</span></Label>
              <Select value={gender} onValueChange={setGender} required>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="성별을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">남성</SelectItem>
                  <SelectItem value="female">여성</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label htmlFor="birthYear">출생년도 <span className="text-red-500">*</span></Label>
                <Input
                  id="birthYear"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="YYYY"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthMonth">월 <span className="text-red-500">*</span></Label>
                <Input
                  id="birthMonth"
                  type="number"
                  min="1"
                  max="12"
                  placeholder="MM"
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDay">일 <span className="text-red-500">*</span></Label>
                <Input
                  id="birthDay"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="DD"
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="birthTime">출생시간</Label>
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageRange">연령대 <span className="text-red-500">*</span></Label>
              <Select value={ageRange} onValueChange={setAgeRange} required>
                <SelectTrigger id="ageRange">
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
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">전화번호 <span className="text-red-500">*</span></Label>
              <Input
                id="phoneNumber"
                placeholder="010-0000-0000"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                예약 확인 및 공지에 사용됩니다.
              </p>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full"
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
