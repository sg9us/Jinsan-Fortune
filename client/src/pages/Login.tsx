import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SiNaver, SiKakaotalk } from 'react-icons/si';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2 } from 'lucide-react';

type OAuthProvider = {
  name: string;
  key: 'naver' | 'kakao';
  icon: React.ElementType;
  color: string;
  textColor: string;
};

export default function Login() {
  const [location, setLocation] = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  // 로그인 상태 확인
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['/auth/me'],
    staleTime: 5 * 60 * 1000, // 5분
  });

  // 로그인 제공자 상태 확인
  const { data: providersData, isLoading: isProvidersLoading } = useQuery({
    queryKey: ['/auth/providers'],
    staleTime: Infinity, // 한 번만 로드
  });

  // 쿼리 파라미터에서 오류 확인
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const errorParam = searchParams.get('error');
    
    if (errorParam === '1') {
      setError(t('loginFailed'));
      toast({
        title: t('error'),
        description: t('loginFailed'),
        variant: 'destructive',
      });
    }
  }, [t, toast]);

  // 이미 로그인한 경우 홈으로 리디렉션
  useEffect(() => {
    if (user?.isAuthenticated) {
      setLocation('/');
    }
  }, [user, setLocation]);

  // 사용 가능한 OAuth 제공자 목록
  const providers: OAuthProvider[] = [
    {
      name: t('loginWithNaver'),
      key: 'naver',
      icon: SiNaver,
      color: '#03C75A',
      textColor: '#FFFFFF',
    },
    {
      name: t('loginWithKakao'),
      key: 'kakao',
      icon: SiKakaotalk,
      color: '#FEE500',
      textColor: '#000000',
    },
  ];

  // 로딩 중인 경우 로딩 표시
  if (isUserLoading || isProvidersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-md py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t('login')}</CardTitle>
          <CardDescription>
            {t('loginDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            {providers.map((provider) => {
              const isAvailable = providersData?.providers?.[provider.key];
              
              return (
                <Button
                  key={provider.key}
                  className="w-full font-medium"
                  style={{ 
                    backgroundColor: provider.color, 
                    color: provider.textColor,
                    opacity: isAvailable ? 1 : 0.5
                  }}
                  disabled={!isAvailable}
                  onClick={() => {
                    if (isAvailable) {
                      window.location.href = `/auth/${provider.key}`;
                    } else {
                      toast({
                        title: t('unavailableService'),
                        description: t('oauthProviderUnavailable'),
                        variant: 'destructive'
                      });
                    }
                  }}
                >
                  <provider.icon className="mr-2 h-5 w-5" />
                  {provider.name}
                </Button>
              );
            })}
          </div>

          <Separator className="my-4" />
          
          <div className="text-center text-sm text-muted-foreground">
            {t('loginDisclaimer')}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="ghost" asChild>
            <Link href="/">{t('backToHome')}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}