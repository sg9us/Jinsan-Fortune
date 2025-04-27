import { createClient } from '@supabase/supabase-js';

// 로그 함수 정의
const log = (message: string, context?: string) => {
  const prefix = context ? `[${context}]` : '';
  console.log(`${prefix} ${message}`);
};

// 환경 변수에서 Supabase URL과 API 키 가져오기
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;

// 환경 변수 확인 
if (!supabaseUrl || !supabaseKey) {
  console.log('[supabase] 경고: Supabase URL 또는 API 키가 제공되지 않았습니다. 일부 기능이 비활성화됩니다.');
  console.log('[supabase] 경고: 환경 변수를 확인하세요. SUPABASE_URL과 SUPABASE_API_KEY가 필요합니다.');
  console.log('[supabase] 경고: 주의: SUPABASE_API_KEY는 anon 키가 아닌 service_role 키여야 합니다!');
} else {
  console.log(`[supabase] Supabase 클라이언트가 초기화되었습니다. (URL: ${supabaseUrl.substring(0, 20)}...)`);
  
  // 키가 service_role 키인지 확인 (간단한 휴리스틱)
  const isLikelyServiceRole = supabaseKey.includes('eyJ') && supabaseKey.length > 100;
  
  if (!isLikelyServiceRole) {
    console.log('[supabase] 주의: SUPABASE_API_KEY가 service_role 키가 아닌 것 같습니다. RLS 정책을 우회하기 위해 service_role 키가 필요합니다.');
    // 키의 일부만 로그로 출력 (보안을 위해)
    if (supabaseKey && supabaseKey.length > 10) {
      console.log(`[supabase] 현재 키 접두사: ${supabaseKey.substring(0, 5)}... (길이: ${supabaseKey.length})`);
    }
    console.log('[supabase] service_role 키는 일반적으로 "eyJ"로 시작하는 긴 문자열입니다');
    console.log('[supabase] Supabase 대시보드 > 설정 > API에서 "service_role secret"을 확인하세요');
  } else {
    console.log('[supabase] service_role 키로 Supabase 클라이언트를 초기화합니다. RLS 정책을 우회합니다.');
    console.log(`[supabase] 키 접두사: ${supabaseKey.substring(0, 5)}... (길이: ${supabaseKey.length})`);
  }
}

// 서비스 역할 키로 클라이언트 초기화 (RLS 정책 우회)
export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        // RLS 정책을 위한 서비스 역할 헤더 추가
        'Authorization': `Bearer ${supabaseKey}`
      }
    }
  }
);

// 초기 테스트 실행 - 권한 확인
(async () => {
  try {
    log('Supabase 연결 및 권한 테스트 중...', 'supabase');
    
    // 간단한 쿼리 시도 - users 테이블 접근 가능한지 확인
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      log(`Supabase 테스트 오류: ${error.message} (코드: ${error.code})`, 'supabase');
      
      if (error.code === '401' || error.code === 'PGRST301') {
        log('401 오류: API 키가 유효하지 않거나 권한이 부족합니다', 'supabase');
        log('서비스 롤 키(service_role)가 아닌 anon 키나 다른 키를 사용하고 있습니다', 'supabase');
        log('올바른 service_role 키를 사용하도록 환경 변수를 업데이트하세요', 'supabase');
      } else if (error.code === '406' || error.code === 'PGRST406') {
        log('406 오류: RLS 정책이 작업을 차단했습니다', 'supabase');
        log('테이블에 RLS 정책이 설정되어 있고 service_role 키가 아니어서 우회할 수 없습니다', 'supabase');
      } else {
        log('알 수 없는 오류가 발생했습니다. 자세한 정보를 위해 로그를 확인하세요', 'supabase');
      }
    } else {
      log(`Supabase 테스트 성공: users 테이블 접근 가능 (${data ? data.length : 0}개 행 조회됨)`, 'supabase');
      log('API 키가 올바르게 작동하고 있습니다', 'supabase');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Supabase 테스트 중 예외 발생: ${errorMessage}`, 'supabase');
  }
})();

// 사용자 유형 정의
export interface SupabaseUser {
  id: string;
  provider: string;
  provider_id: string;
  nickname: string;
  email: string | null;
  full_name?: string | null;
  phone_number?: string | null;
  gender?: string | null;
  birthdate?: string | null;
  birth_time?: string | null;
  is_time_unknown?: boolean;
  age_range?: string | null;
  is_registered?: boolean;
  is_admin?: boolean;
  created_at: string;
  last_login_at: string;
}

// Supabase 사용자 서비스
export const userService = {
  // 이메일/비밀번호 회원가입
  async signUpWithEmail(email: string, password: string, nickname: string): Promise<SupabaseUser> {
    try {
      console.log(`[supabase] 이메일로 회원가입 시도: ${email.substring(0, 3)}...`);
      
      // Supabase Auth로 회원가입 (이메일 중복 확인은 Supabase Auth에서 자동으로 수행함)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname: nickname
          }
        }
      });
      
      if (authError) {
        // 이메일 중복 등의 오류 로깅
        if (authError.message.includes("already exists")) {
          console.log(`[supabase] 이미 가입된 이메일입니다: ${email.substring(0, 3)}...`);
          throw new Error("이미 가입된 이메일입니다");
        } else {
          console.log(`[supabase] Auth 회원가입 오류: ${authError.message}`);
          throw new Error(authError.message);
        }
      }
      
      if (!authData.user) {
        console.log('[supabase] Auth 회원가입 후 사용자 정보를 받지 못했습니다');
        throw new Error("사용자 정보를 받지 못했습니다");
      }
      
      const now = new Date().toISOString();
      
      // Supabase Auth 성공 시 users 테이블에 추가 프로필 정보 저장
      // DB 스키마를 확인하고 불필요한 필드 제거
      console.log(`[supabase] 새 사용자 생성 시도: ${email.substring(0, 3)}...`);
      
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            provider: 'email',
            provider_id: email,
            nickname: nickname,
            email: email,
            is_admin: false,
            created_at: now,
            last_login_at: now
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.log(`[supabase] 사용자 DB 저장 오류: ${error.message}`);
        
        // 사용자 정보 저장 실패 시 Supabase Auth에서 생성된 사용자 삭제 시도
        try {
          const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
          if (deleteError) {
            console.log(`[supabase] 사용자 삭제 오류: ${deleteError.message}`);
          }
        } catch (deleteError) {
          console.log(`[supabase] 사용자 삭제 중 예외 발생: ${deleteError}`);
        }
        
        throw new Error("사용자 정보 저장에 실패했습니다");
      }
      
      console.log(`[supabase] 이메일 회원가입 성공: ${email.substring(0, 3)}... (ID: ${data.id})`);
      return data as SupabaseUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`[supabase] 이메일 회원가입 중 예외 발생: ${errorMessage}`);
      throw error; // 오류를 상위로 전파하여 적절한 오류 메시지 표시
    }
  },
  
  // 이메일/비밀번호 로그인
  async signInWithEmail(email: string, password: string): Promise<SupabaseUser> {
    try {
      console.log(`[supabase] 이메일로 로그인 시도: ${email.substring(0, 3)}...`);
      
      // Supabase Auth로 로그인
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          console.log(`[supabase] 잘못된 로그인 정보: ${email.substring(0, 3)}...`);
          throw new Error("이메일 또는 비밀번호가 올바르지 않습니다");
        } else {
          console.log(`[supabase] Auth 로그인 오류: ${authError.message}`);
          throw new Error(authError.message);
        }
      }
      
      if (!authData.user) {
        console.log(`[supabase] Auth 로그인 후 사용자 정보를 받지 못했습니다`);
        throw new Error("로그인 후 사용자 정보를 가져오지 못했습니다");
      }
      
      // DB에서 사용자 정보 가져오기
      const user = await this.getUserById(authData.user.id);
      
      if (!user) {
        console.log(`[supabase] Auth에는 있지만 DB에 없는 사용자: ${authData.user.id}`);
        
        // Supabase Auth에서 사용자 메타데이터 가져오기
        const { data: userData } = await supabase.auth.admin.getUserById(authData.user.id);
        const nickname = userData?.user?.user_metadata?.nickname || email.split('@')[0];
        
        // 새 사용자 생성할 정보
        console.log(`[supabase] 새 사용자 생성 시도: ${JSON.stringify({
          provider: 'email',
          provider_id: email.substring(0, 3) + '...',
          nickname: nickname
        })}`);
        
        // Auth에는 있지만 DB에 없는 경우 사용자 생성
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              provider: 'email',
              provider_id: email,
              nickname: nickname,
              email: email,
              is_admin: false,
              created_at: now,
              last_login_at: now
            }
          ])
          .select()
          .single();
        
        if (error) {
          console.log(`[supabase] 로그인 중 사용자 자동 생성 오류: ${error.message}`);
          throw new Error("사용자 정보 생성에 실패했습니다");
        }
        
        console.log(`[supabase] 사용자 자동 생성 성공: ${email.substring(0, 3)}... (ID: ${data.id})`);
        return data as SupabaseUser;
      }
      
      // 마지막 로그인 시간 업데이트
      const updatedUser = await this.updateLastLoginTime(user.id);
      if (!updatedUser) {
        throw new Error("로그인 시간 업데이트에 실패했습니다");
      }
      
      console.log(`[supabase] 이메일 로그인 성공: ${email.substring(0, 3)}... (ID: ${user.id})`);
      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`[supabase] 이메일 로그인 중 예외 발생: ${errorMessage}`);
      throw error; // 오류를 상위로 전파
    }
  },
  
  // 이메일로 사용자 찾기
  async getUserByEmail(email: string): Promise<SupabaseUser | null> {
    if (!email) return null;
    
    console.log(`[supabase] 이메일로 사용자 조회: ${email.substring(0, 3)}...`);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') { // 결과를 찾을 수 없음 오류 코드는 무시
        console.log(`[supabase] 이메일로 사용자 조회 오류: ${error.message}`);
      } else {
        console.log(`[supabase] 이메일 ${email.substring(0, 3)}...에 해당하는 사용자를 찾을 수 없습니다`);
      }
      return null;
    }
    
    console.log(`[supabase] 이메일로 사용자 조회 성공: ${data.nickname} (ID: ${data.id})`);
    return data as SupabaseUser;
  },
  
  // 공급자 ID로 사용자 찾기
  async getUserByProviderId(provider: string, providerId: string): Promise<SupabaseUser | null> {
    console.log(`[supabase] 공급자 ID로 사용자 조회: ${provider}/${providerId.substring(0, 3)}...`);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('provider', provider)
      .eq('provider_id', providerId)
      .single();
    
    if (error) {
      if (error.code !== 'PGRST116') { // 결과를 찾을 수 없음 오류 코드는 무시
        console.log(`[supabase] 공급자 ID로 사용자 조회 오류: ${error.message}`);
      } else {
        console.log(`[supabase] 공급자 ID ${provider}/${providerId.substring(0, 3)}...에 해당하는 사용자를 찾을 수 없습니다`);
      }
      return null;
    }
    
    console.log(`[supabase] 공급자 ID로 사용자 조회 성공: ${data.nickname} (ID: ${data.id})`);
    return data as SupabaseUser;
  },
  
  // 사용자 생성 (자동 회원가입)
  async createUser(userData: {
    provider: string;
    provider_id: string;
    nickname?: string;
    email?: string | null;
  }): Promise<SupabaseUser | null> {
    try {
      // 중복 확인 - provider_id가 동일한 사용자가 있는지 확인
      const existingUser = await this.getUserByProviderId(userData.provider, userData.provider_id);
      if (existingUser) {
        console.log(`[supabase] 이미 존재하는 사용자입니다: ${userData.provider} / ${userData.provider_id}`);
        return existingUser;
      }
      
      const now = new Date().toISOString();
      
      // 기본값 설정 - 누락된 필드에 대한 처리
      const nickname = userData.nickname || `${userData.provider} 사용자`;
      const email = userData.email || null;
      
      // 로그 추가
      console.log(`[supabase] 새 사용자 생성 시도: ${JSON.stringify({
        provider: userData.provider,
        provider_id: userData.provider_id,
        nickname: nickname,
        email: email ? email.substring(0, 3) + '...' : null
      })}`);
      
      // 서비스 역할 키로 RLS 정책 우회
      // is_social 필드는 스키마에 없으므로 제거
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            provider: userData.provider,
            provider_id: userData.provider_id,
            nickname: nickname,
            email: email,
            is_admin: false,
            created_at: now,
            last_login_at: now
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.log(`[supabase] 사용자 생성 오류: ${error.message} (코드: ${error.code})`);
        
        // 401 오류 세부 정보 로깅 (인증 관련)
        if (error.code === '401') {
          console.log('[supabase] 401 인증 오류 - service_role 키를 확인하세요. anon 키가 아닌 service_role 키가 필요합니다!');
          console.log('[supabase] Supabase Project Settings -> API -> service_role 키를 사용하세요');
        }
        
        // 406 오류 세부 정보 로깅 (RLS 정책 관련)
        if (error.code === '406') {
          console.log('[supabase] 406 오류 - RLS 정책이 삽입 작업을 차단했습니다');
          console.log('[supabase] 다음 옵션 중 하나를 선택하세요:');
          console.log('[supabase] 1. service_role 키를 사용하여 RLS를 우회하세요 (권장)');
          console.log('[supabase] 2. Supabase에서 해당 테이블의 RLS 정책을 수정하세요');
          console.log('[supabase] 3. Supabase에서 해당 테이블의 RLS를 잠시 비활성화하세요 (테스트용)');
        }
        
        // 중복 키 (이미 존재하는 사용자)
        if (error.code === 'PGRST409' || error.code === '23505') {
          console.log('[supabase] 이미 존재하는 사용자 - 다시 조회 시도');
          const existingUser = await this.getUserByProviderId(userData.provider, userData.provider_id);
          if (existingUser) {
            return existingUser;
          }
        }
        
        return null;
      }
      
      console.log(`[supabase] 사용자 생성 성공: ${data.nickname} (ID: ${data.id})`);
      return data as SupabaseUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`[supabase] 사용자 생성 중 예외 발생: ${errorMessage}`);
      return null;
    }
  },
  
  // 마지막 로그인 시간 업데이트
  async updateLastLoginTime(userId: string): Promise<SupabaseUser | null> {
    try {
      console.log(`[supabase] 사용자 로그인 시간 업데이트 시도: ID ${userId}`);
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
        console.log(`[supabase] 사용자 로그인 시간 업데이트 오류: ${error.message} (코드: ${error.code})`);
        
        // 사용자를 찾을 수 없는 경우 다시 조회
        if (error.code === 'PGRST116') {
          console.log(`[supabase] 사용자를 찾을 수 없음 - ID로 다시 조회 시도: ${userId}`);
          const user = await this.getUserById(userId);
          return user;
        }
        
        return null;
      }
      
      console.log(`[supabase] 사용자 로그인 시간 업데이트 성공: ${data.nickname} (ID: ${data.id})`);
      return data as SupabaseUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`[supabase] 사용자 로그인 시간 업데이트 중 예외 발생: ${errorMessage}`);
      return null;
    }
  },
  
  // ID로 사용자 얻기
  async getUserById(userId: string): Promise<SupabaseUser | null> {
    try {
      if (!userId) {
        console.log('[supabase] 유효하지 않은 사용자 ID: 빈 문자열 또는 undefined');
        return null;
      }
      
      console.log(`[supabase] ID로 사용자 조회: ${userId}`);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') { // 결과 없음 에러는 조용히 처리
          console.log(`[supabase] 사용자 ID 조회 오류: ${error.message} (코드: ${error.code})`);
        } else {
          console.log(`[supabase] ID ${userId}에 해당하는 사용자를 찾을 수 없습니다`);
        }
        return null;
      }
      
      console.log(`[supabase] 사용자 조회 성공: ${data.nickname} (ID: ${data.id})`);
      return data as SupabaseUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`[supabase] 사용자 ID 조회 중 예외 발생: ${errorMessage}`);
      return null;
    }
  }
};