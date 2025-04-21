import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, LogOut } from "lucide-react";

// 인증된 사용자 정보 타입
interface UserInfo {
  id: string;
  nickname: string;
  provider: string;
  email: string | null;
  isAuthenticated: boolean;
}

export function Header() {
  const { t } = useLanguage();
  const { toast } = useToast();

  // 사용자 인증 상태 확인
  const { 
    data: user, 
    isLoading, 
    refetch 
  } = useQuery<UserInfo>({
    queryKey: ['/auth/me'],
    staleTime: 5 * 60 * 1000, // 5분
  });

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
      
      // 인증 상태 갱신
      await refetch();
      
      toast({
        title: t('logout'),
        description: "로그아웃 되었습니다.",
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: "로그아웃 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="px-4 py-3 bg-white border-b border-neutral-200 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center">
        <Link href="/">
          <h1 className="text-xl font-bold text-primary cursor-pointer">
            PaljaNote
          </h1>
        </Link>
      </div>
      
      <div className="flex items-center gap-2">
        {isLoading ? (
          <span className="text-sm text-muted-foreground">...</span>
        ) : user?.isAuthenticated ? (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs px-2 flex items-center gap-1"
              asChild
            >
              <Link href="/mypage">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.nickname}</span>
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs px-2 flex items-center gap-1 text-red-500"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t('logout')}</span>
            </Button>
          </>
        ) : (
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs px-2 flex items-center gap-1"
            asChild
          >
            <Link href="/login">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{t('login')}</span>
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
