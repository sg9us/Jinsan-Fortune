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
  const [, params] = useRoute("/register");
  
  // 사용자 정보 상태
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // 폼 입력 상태
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState("");
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
          // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
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
    
    if (!fullName || !phoneNumber) {
      toast({
        title: "입력 오류",
        description: "이름과 전화번호는 필수 입력 항목입니다.",
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
          phoneNumber,
          gender: gender || null,
          birthdate: birthdate || null,
        }),
      });
      
      const result = response as any;
      
      if (result.success) {
        toast({
          title: "회원가입 완료",
          description: "회원가입이 성공적으로 완료되었습니다.",
        });
        
        // 홈페이지로 리다이렉트
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
    // 숫자만 허용하고 자동으로 하이픈 추가
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
            
            <div className="space-y-2">
              <Label htmlFor="gender">성별 (선택)</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="성별을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">남성</SelectItem>
                  <SelectItem value="female">여성</SelectItem>
                  <SelectItem value="other">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="birthdate">생년월일 (선택)</Label>
              <Input
                id="birthdate"
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                사주 분석에 활용됩니다. (나중에 입력 가능)
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