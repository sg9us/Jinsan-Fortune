# PaljaNote Supabase 설정 가이드

이 문서는 PaljaNote 애플리케이션에서 사용하는 Supabase 설정 방법을 설명합니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 로그인합니다.
2. 새 프로젝트를 생성합니다.
3. 프로젝트 이름(예: "paljanote"), 데이터베이스 비밀번호를 설정하고 리전을 선택합니다.

## 2. 사용자 테이블 생성

Supabase SQL 편집기에서 다음 SQL 문을 실행하여 사용자 테이블을 생성합니다:

```sql
-- PaljaNote 애플리케이션을 위한 Supabase 설정 스크립트

-- 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL, -- 'naver' 또는 'kakao'
  provider_id TEXT NOT NULL, -- OAuth 제공자의 고유 ID
  nickname TEXT NOT NULL,
  email TEXT, -- 이메일은 필수가 아님
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
```

## 3. 환경 변수 설정

프로젝트에 다음 환경 변수를 추가합니다:

1. `SUPABASE_URL`: Supabase 프로젝트 URL
2. `SUPABASE_API_KEY`: Supabase 프로젝트 API 키 (anon/public key)

이 정보는 Supabase 대시보드의 프로젝트 설정 > API 섹션에서 찾을 수 있습니다.

## 4. OAuth 제공자 설정

네이버와 카카오 로그인을 위해 다음 단계를 따르세요:

### 네이버 개발자 센터

1. [네이버 개발자 센터](https://developers.naver.com)에 로그인합니다.
2. 애플리케이션 등록을 클릭합니다.
3. 애플리케이션 이름(예: "PaljaNote"), 사용 API(네아로 로그인)를 선택합니다.
4. 서비스 URL과 콜백 URL을 입력합니다.
   - 개발 환경: `http://localhost:5000/auth/naver/callback`
   - 프로덕션 환경: `https://your-domain.com/auth/naver/callback`
5. 등록 후 발급받은 다음 정보를 프로젝트 환경 변수에 추가합니다:
   - `NAVER_CLIENT_ID`: 클라이언트 ID
   - `NAVER_CLIENT_SECRET`: 클라이언트 시크릿

### 카카오 개발자 센터

1. [카카오 개발자 센터](https://developers.kakao.com)에 로그인합니다.
2. 애플리케이션 추가하기를 클릭합니다.
3. 앱 이름(예: "PaljaNote")을 입력하고 생성합니다.
4. 플랫폼 > Web에서 사이트 도메인을 등록합니다.
   - 개발 환경: `http://localhost:5000`
   - 프로덕션 환경: `https://your-domain.com`
5. 카카오 로그인 > 활성화 설정 > 동의항목에서 필요한 항목을 선택합니다.
6. 카카오 로그인 > Redirect URI에 다음을 추가합니다:
   - 개발 환경: `http://localhost:5000/auth/kakao/callback`
   - 프로덕션 환경: `https://your-domain.com/auth/kakao/callback`
7. 발급받은 다음 정보를 프로젝트 환경 변수에 추가합니다:
   - `KAKAO_CLIENT_ID`: REST API 키
   - `KAKAO_CLIENT_SECRET`: 카카오 로그인 > 보안 > Client Secret에서 생성한 코드

## 5. 애플리케이션 시작하기

모든 설정이 완료되면 애플리케이션을 시작합니다:

```bash
npm run dev
```

이제 네이버와 카카오를 통한 로그인이 활성화되고, 사용자 정보가 Supabase에 저장됩니다!