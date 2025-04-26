import { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function EmailSignup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // 폼 상태
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 오류 상태
  const [emailError, setEmailError] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  
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
          description: "회원가입이 완료되었습니다.",
        });
        
        navigate("/");
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
        description: "회원가입 처리 중 오류가 발생했습니다",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container py-6">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">이메일로 회원가입</CardTitle>
          <CardDescription className="text-center">
            간편하게 이메일로 가입하고 서비스를 이용해보세요
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={emailError ? "border-red-500" : ""}
              />
              {emailError && <p className="text-xs text-red-500">{emailError}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                placeholder="닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className={nicknameError ? "border-red-500" : ""}
              />
              {nicknameError && <p className="text-xs text-red-500">{nicknameError}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="8자 이상 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={passwordError ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={confirmPasswordError ? "border-red-500" : ""}
              />
              {confirmPasswordError && <p className="text-xs text-red-500">{confirmPasswordError}</p>}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "처리 중..." : "회원가입"}
            </Button>
            
            <div className="text-center text-sm">
              이미 계정이 있으신가요?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate("/email-login")}
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