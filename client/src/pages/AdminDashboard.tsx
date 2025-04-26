
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  
  // 사용자 정보 가져오기
  const { data: user } = useQuery(['me'], () =>
    fetch('/auth/me').then(res => res.json())
  );

  // 예약 목록 가져오기
  const { data: bookings } = useQuery(['admin-bookings'], () =>
    fetch('/api/admin/bookings').then(res => res.json())
  );

  // 관리자가 아닌 경우 홈으로 리디렉션
  useEffect(() => {
    if (user && !user.isAdmin) {
      setLocation('/');
    }
  }, [user, setLocation]);

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">{t('adminDashboard')}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('bookingList')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('name')}</TableHead>
                <TableHead>{t('phone')}</TableHead>
                <TableHead>{t('serviceType')}</TableHead>
                <TableHead>{t('preferredDate')}</TableHead>
                <TableHead>{t('preferredTime')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings?.map((booking: any) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.name}</TableCell>
                  <TableCell>{booking.phone}</TableCell>
                  <TableCell>{booking.serviceType}</TableCell>
                  <TableCell>{booking.preferredDate}</TableCell>
                  <TableCell>{booking.preferredTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
