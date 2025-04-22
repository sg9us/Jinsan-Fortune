import { createClient } from '@supabase/supabase-js';
import { log } from '../vite';

// 환경 변수에서 Supabase URL과 API 키 가져오기
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;

// Supabase 클라이언트 생성
if (!supabaseUrl || !supabaseKey) {
  log('Supabase URL 또는 API 키가 제공되지 않았습니다. 일부 기능이 비활성화됩니다.', 'supabase');
} else {
  log(`Supabase 클라이언트가 초기화되었습니다. (URL: ${supabaseUrl.substring(0, 20)}...)`, 'supabase');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || ''
);

// 사용자 유형 정의
export interface SupabaseUser {
  id: string;
  provider: string;
  provider_id: string;
  nickname: string;
  email: string | null;
  created_at: string;
  last_login_at: string;
}

// Supabase 사용자 서비스
export const userService = {
  // 공급자 ID로 사용자 찾기
  async getUserByProviderId(provider: string, providerId: string): Promise<SupabaseUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('provider', provider)
      .eq('provider_id', providerId)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') { // 결과를 찾을 수 없음 오류 코드는 무시
        log(`사용자 조회 오류: ${error.message}`, 'supabase');
      }
      return null;
    }
    
    return data as SupabaseUser;
  },
  
  // 사용자 생성
  async createUser(userData: {
    provider: string;
    provider_id: string;
    nickname: string;
    email: string | null;
  }): Promise<SupabaseUser | null> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          provider: userData.provider,
          provider_id: userData.provider_id,
          nickname: userData.nickname,
          email: userData.email,
          created_at: now,
          last_login_at: now
        }
      ])
      .select()
      .single();
    
    if (error) {
      log(`사용자 생성 오류: ${error.message}`, 'supabase');
      return null;
    }
    
    return data as SupabaseUser;
  },
  
  // 마지막 로그인 시간 업데이트
  async updateLastLoginTime(userId: string): Promise<SupabaseUser | null> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('users')
      .update({
        last_login_at: now
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      log(`사용자 로그인 시간 업데이트 오류: ${error.message}`, 'supabase');
      return null;
    }
    
    return data as SupabaseUser;
  },
  
  // ID로 사용자 얻기
  async getUserById(userId: string): Promise<SupabaseUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      log(`사용자 조회 오류: ${error.message}`, 'supabase');
      return null;
    }
    
    return data as SupabaseUser;
  }
};