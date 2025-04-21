import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, Calendar, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

// 인증된 사용자 정보 타입
interface UserInfo {
  id: string;
  nickname: string;
  provider: string;
  email: string | null;
  isAuthenticated: boolean;
}

export default function MyPage() {
  const [location, setLocation] = useLocation();
  const { t } = useLanguage();

  // 사용자 정보 로드
  const { data: user, isLoading } = useQuery<UserInfo>({
    queryKey: ['/auth/me'],
    staleTime: 5 * 60 * 1000, // 5분
  });

  // 로그인하지 않은 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoading && !user?.isAuthenticated) {
      setLocation('/login');
    }
  }, [user, isLoading, setLocation]);

  // 로딩 중인 경우 로딩 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 로그인하지 않은 경우 빈 페이지 표시 (리디렉션 처리 중)
  if (!user?.isAuthenticated) {
    return null;
  }

  // 로그인 제공자에 따른 아바타 배경색
  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'naver':
        return 'bg-[#03C75A] text-white';
      case 'kakao':
        return 'bg-[#FEE500] text-black';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  // 로그인 제공자에 따른 아바타 텍스트
  const getProviderInitial = (provider: string) => {
    switch (provider) {
      case 'naver':
        return 'N';
      case 'kakao':
        return 'K';
      default:
        return 'U';
    }
  };
  
  return (
    <div className="container py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader className="pb-4">
          <CardTitle>{t('myPage')}</CardTitle>
          <CardDescription>
            회원 정보 확인 및 관리
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col items-center space-y-4 mb-6">
            <Avatar className={`h-20 w-20 ${getProviderColor(user.provider)}`}>
              <AvatarFallback>{getProviderInitial(user.provider)}</AvatarFallback>
            </Avatar>
            
            <div className="text-center">
              <h3 className="text-xl font-medium">{user.nickname}</h3>
              <p className="text-sm text-muted-foreground">
                {user.provider === 'naver' ? '네이버' : '카카오'} 계정으로 로그인
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            {user.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>최초 가입일: 2023년 5월 15일</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t pt-4">
          <Button variant="outline" onClick={() => setLocation('/')}>
            홈으로 돌아가기
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}