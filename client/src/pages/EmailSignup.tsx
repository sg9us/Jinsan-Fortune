import { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

export default function EmailSignup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // 폼 상태
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  
  // 오류 상태
  const [emailError, setEmailError] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [termsError, setTermsError] = useState("");
  
  // 비밀번호 유효성 상태
  const [passwordStrength, setPasswordStrength] = useState({
    hasLength: false,
    hasLetter: false,
    hasNumber: false
  });
  
  // 비밀번호 입력 처리
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // 비밀번호 강도 확인
    setPasswordStrength({
      hasLength: value.length >= 8,
      hasLetter: /[a-zA-Z]/.test(value),
      hasNumber: /[0-9]/.test(value)
    });
  };
  
  // 유효성 검사
  const validateForm = () => {
    let isValid = true;
    
    // 이메일 검증
    if (!email) {
      setEmailError("이메일을 입력해주세요");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("유효한 이메일 주소를 입력해주세요");
      isValid = false;
    } else {
      setEmailError("");
    }
    
    // 닉네임 검증
    if (!nickname) {
      setNicknameError("닉네임을 입력해주세요");
      isValid = false;
    } else if (nickname.length < 2) {
      setNicknameError("닉네임은 2자 이상이어야 합니다");
      isValid = false;
    } else {
      setNicknameError("");
    }
    
    // 비밀번호 검증
    if (!password) {
      setPasswordError("비밀번호를 입력해주세요");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("비밀번호는 8자 이상이어야 합니다");
      isValid = false;
    } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setPasswordError("비밀번호는 문자와 숫자를 모두 포함해야 합니다");
      isValid = false;
    } else {
      setPasswordError("");
    }
    
    // 비밀번호 확인 검증
    if (!confirmPassword) {
      setConfirmPasswordError("비밀번호 확인을 입력해주세요");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("비밀번호가 일치하지 않습니다");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }
    
    // 약관 동의 검증
    if (!termsAgreed) {
      setTermsError("이용약관에 동의해주세요");
      isValid = false;
    } else {
      setTermsError("");
    }
    
    return isValid;
  };
  
  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest("/api/auth/email/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          confirmPassword,
          nickname
        })
      });
      
      const result = response as any;
      
      if (result.success) {
        toast({
          title: "회원가입 성공",
          description: "회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.",
        });
        
        // 로그인 페이지로 리다이렉트
        navigate("/login");
      } else {
        toast({
          title: "회원가입 실패",
          description: result.message || "회원가입 중 오류가 발생했습니다",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("회원가입 요청 실패:", error);
      toast({
        title: "오류",
        description: "회원가입 처리 중 오류가 발생했습니다. 이미 가입된 이메일일 수 있습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // 비밀번호 강도 표시 아이콘
  const StrengthIcon = ({ condition }: { condition: boolean }) => {
    return condition ? 
      <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
      <AlertCircle className="h-4 w-4 text-gray-300" />;
  };
  
  return (
    <div className="container py-6">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">회원가입</CardTitle>
          <CardDescription className="text-center">
            이메일로 가입하고 서비스를 이용해보세요
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={emailError ? "border-red-500 focus:ring-red-200" : "focus:ring-2 focus:ring-primary/20"}
              />
              {emailError && (
                <div className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  <span>{emailError}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nickname" className="font-medium">닉네임</Label>
              <Input
                id="nickname"
                placeholder="닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className={nicknameError ? "border-red-500 focus:ring-red-200" : "focus:ring-2 focus:ring-primary/20"}
              />
              {nicknameError && (
                <div className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  <span>{nicknameError}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="font-medium">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="8자 이상, 문자와 숫자 포함"
                  value={password}
                  onChange={handlePasswordChange}
                  className={passwordError ? "border-red-500 focus:ring-red-200 pr-10" : "focus:ring-2 focus:ring-primary/20 pr-10"}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordError ? (
                <div className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  <span>{passwordError}</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div className="flex items-center gap-1 text-xs">
                    <StrengthIcon condition={passwordStrength.hasLength} />
                    <span>8자 이상</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <StrengthIcon condition={passwordStrength.hasLetter} />
                    <span>문자 포함</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <StrengthIcon condition={passwordStrength.hasNumber} />
                    <span>숫자 포함</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-medium">비밀번호 확인</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="비밀번호를 다시 입력하세요"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={confirmPasswordError ? "border-red-500 focus:ring-red-200 pr-10" : "focus:ring-2 focus:ring-primary/20 pr-10"}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPasswordError && (
                <div className="flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  <span>{confirmPasswordError}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2 pt-2">
              <div className="flex items-start space-x-2 bg-gray-50 p-3 rounded-md">
                <Checkbox 
                  id="terms" 
                  checked={termsAgreed}
                  onCheckedChange={(checked) => {
                    setTermsAgreed(checked as boolean);
                    if (checked) setTermsError("");
                  }}
                  className="mt-1"
                />
                <div>
                  <Label htmlFor="terms" className="text-sm font-medium">
                    <a 
                      href="https://terrific-laugh-d1f.notion.site/1e1189caa53d80dea2e6cb6e25543b01?pvs=4" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:underline"
                    >
                      이용약관
                    </a>과{" "}
                    <a 
                      href="https://terrific-laugh-d1f.notion.site/1e1189caa53d80dea2e6cb6e25543b01?pvs=4" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:underline"
                    >
                      개인정보 수집 및 이용
                    </a>에 동의합니다.
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    서비스 이용을 위해 필수 정보를 수집합니다. 동의하지 않을 경우 서비스 이용이 제한됩니다.
                  </p>
                </div>
              </div>
              {termsError && (
                <div className="flex items-center gap-1 text-xs text-red-500 ml-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{termsError}</span>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3 pt-2 pb-4">
            <Button 
              type="submit" 
              className="w-full py-6 text-base font-medium transition-all hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? "처리 중..." : "회원가입"}
            </Button>
            
            <div className="text-center text-sm">
              이미 계정이 있으신가요?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate("/login")}
              >
                로그인
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}