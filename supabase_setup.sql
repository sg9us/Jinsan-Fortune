-- PaljaNote 애플리케이션을 위한 Supabase 설정 스크립트

-- 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL, -- 'naver' 또는 'kakao'
  provider_id TEXT NOT NULL, -- OAuth 제공자의 고유 ID
  nickname TEXT NOT NULL,
  email TEXT, -- 이메일은 필수가 아님
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- provider와 provider_id의 조합에 대한 고유 제약 조건 추가
ALTER TABLE users 
  ADD CONSTRAINT unique_provider_id UNIQUE (provider, provider_id);

-- Row Level Security (RLS) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 기본 정책: 사용자는 자신의 데이터만 볼 수 있음
CREATE POLICY "사용자는 자신의 데이터만 볼 수 있음" ON users
  FOR SELECT 
  USING (auth.uid() = id);

-- 기본 정책: 사용자는 자신의 데이터만 업데이트할 수 있음
CREATE POLICY "사용자는 자신의 데이터만 업데이트할 수 있음" ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- 백엔드 서비스가 모든 사용자를 조회할 수 있는 정책
CREATE POLICY "백엔드 서비스가 모든 사용자를 조회할 수 있음" ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- 백엔드 서비스가 새 사용자를 생성할 수 있는 정책
CREATE POLICY "백엔드 서비스가 새 사용자를 생성할 수 있음" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 백엔드 서비스가 모든 사용자를 업데이트할 수 있는 정책
CREATE POLICY "백엔드 서비스가 모든 사용자를 업데이트할 수 있음" ON users
  FOR UPDATE
  TO authenticated
  USING (true);

-- 백엔드 서비스가 사용자를 삭제할 수 있는 정책 (필요한 경우)
CREATE POLICY "백엔드 서비스가 사용자를 삭제할 수 있음" ON users
  FOR DELETE
  TO authenticated
  USING (true);