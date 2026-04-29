# Factsheet MCP PoC — Next.js 로그인 화면 PRD (v2: Vercel 배포)

## 1. 개요

### 1.1 목적
MCP 서버의 `/authorize` 엔드포인트가 redirect 시켜준 사용자에게 **로그인 화면을 표시**하고, 사용자가 폼을 제출하면 **Claude Desktop의 redirect_uri로 가짜 인증 코드를 전달**.

### 1.2 핵심 동작
- 입력값(이메일/비밀번호)은 검증하지 않음 (PoC)
- 사용자가 [로그인] 클릭 시 무조건 통과
- redirect_uri로 `?code=fake_code&state={원본}&company_code={선택값}` 전달

### 1.3 범위
- ✅ `/login` 페이지 (이메일/비밀번호 폼)
- ✅ `/select-company` 페이지 (회사 선택)
- ✅ Vercel 배포 (HTTPS 자동)
- ❌ 실제 인증 로직 (PoC)

### 1.4 비기능 요건
- 데모 가능한 수준의 UI (실제 SaaS 톤)
- Vercel 호스팅 (HTTPS 자동)
- 환경변수 기반 설정

---

## 2. 시스템 구성

```
[브라우저]
    │
    │ GET /login?redirect_uri=...&state=...&code_challenge=...
    ▼
┌────────────────────────────────────────┐
│  Next.js 14 (App Router) — Vercel       │
│  https://login-poc.vercel.app           │
│                                        │
│  /login            (Step 1)            │
│  /select-company   (Step 2)            │
└────────────────┬───────────────────────┘
                 │ window.location.href
                 │ {redirect_uri}?code=...&state=...
                 ▼
       [Claude Desktop 콜백]
       http://localhost:33418/callback
       또는 Claude.ai 콜백 URL
```

### 기술 스택
| 항목 | 선택 |
|---|---|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS |
| UI 컴포넌트 | shadcn/ui (Button, Input, Label, RadioGroup) |
| 호스팅 | Vercel (HTTPS 자동) |

---

## 3. 환경변수

| 변수명 | 로컬 값 | 배포 값 (Vercel) | 용도 |
|---|---|---|---|
| `NEXT_PUBLIC_MCP_SERVER_URL` | `http://localhost:8000` | `https://mcp-poc-production.up.railway.app` | (선택) MCP 서버 URL 표시용 |

> Note: 로그인 화면은 redirect_uri를 쿼리스트링으로 받아서 직접 redirect하므로, MCP 서버 URL 자체는 동작에 필수가 아님. 디버그/표시용.

### `.env.example`
```bash
NEXT_PUBLIC_MCP_SERVER_URL=http://localhost:8000
```

### `.env.production`
```bash
NEXT_PUBLIC_MCP_SERVER_URL=https://mcp-poc-production.up.railway.app
```

---

## 4. 화면 명세

### 4.1 `/login` — 로그인 화면

#### URL 구조
```
GET /login
    ?redirect_uri={Claude Desktop 콜백}
    &state={원본}
    &code_challenge={원본}
    &code_challenge_method=S256
    &client_id={원본}
```

#### 화면 구성
```
┌─────────────────────────────────────────┐
│         [Factsheet × Upflow 뱃지]        │
│                                         │
│              로그인                      │
│       MCP 서버 연동을 위해 로그인하세요    │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 이메일                            │  │
│  │ [____________________________]    │  │
│  │                                   │  │
│  │ 비밀번호                          │  │
│  │ [____________________________]    │  │
│  │                                   │  │
│  │ [        로그인 →        ]        │  │
│  └───────────────────────────────────┘  │
│                                         │
│   💡 PoC 환경 - 아무 값이나 입력해도      │
│              통과합니다                  │
└─────────────────────────────────────────┘
```

#### 동작
1. URL 쿼리스트링을 그대로 보존
2. 사용자가 이메일/비번 입력 (값 무관)
3. [로그인] 클릭
4. **`/select-company`로 client-side navigation** (모든 파라미터 그대로 전달)

#### 디자인
- **색상**: Navy `#0F1B33` 배경 + Orange `#E8531A` 액센트
- **레이아웃**: 화면 중앙 카드 (max-width 400px)
- **카드**: 흰 배경 + `shadow-2xl` + `rounded-xl`

---

### 4.2 `/select-company` — 회사 선택 화면

#### URL 구조
```
GET /select-company
    ?redirect_uri=...
    &state=...
    &code_challenge=...
    &code_challenge_method=S256
    &client_id=...
```

#### 화면 구성
```
┌─────────────────────────────────────────┐
│         [Factsheet × Upflow 뱃지]        │
│                                         │
│             회사 선택                    │
│           소속 회사를 선택하세요         │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ ⚪ AZFLOW Investment Partners      │  │
│  │ ⚪ Demo Capital                    │  │
│  │ ⚪ Test Ventures                   │  │
│  │                                   │  │
│  │ [      선택 완료 →       ]        │  │
│  └───────────────────────────────────┘  │
│                                         │
│       💡 PoC: 어느 회사 선택해도         │
│            가짜 code 발급됩니다           │
└─────────────────────────────────────────┘
```

#### 동작
1. 가짜 회사 목록 3개 표시 (하드코딩):
   - `AZFLOW` — AZFLOW Investment Partners
   - `DEMO_CAP` — Demo Capital
   - `TEST_VC` — Test Ventures
2. 라디오 버튼으로 선택
3. [선택 완료] 클릭
4. **`window.location.href`로 redirect_uri로 이동**:
   ```
   {redirect_uri}?code=fake_code_{타임스탬프}&state={원본}&company_code={선택값}
   ```

---

## 5. 파일 구조

```
poc_login_app/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      # 안내 페이지
│   ├── login/
│   │   └── page.tsx                  # 로그인 화면
│   ├── select-company/
│   │   └── page.tsx                  # 회사 선택 화면
│   └── globals.css
├── components/
│   ├── ui/                           # shadcn/ui
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── radio-group.tsx
│   ├── login-form.tsx                # 로그인 폼 (Client Component)
│   └── company-selector.tsx          # 회사 선택 (Client Component)
├── lib/
│   └── utils.ts                      # cn() 유틸
├── public/
│   └── (선택: 로고 SVG)
├── tailwind.config.ts
├── next.config.ts
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 6. 구현 가이드

### 6.1 프로젝트 생성
```bash
npx create-next-app@latest poc_login_app \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --no-eslint \
  --import-alias "@/*"

cd poc_login_app
npx shadcn@latest init
npx shadcn@latest add button input label radio-group
```

### 6.2 `app/login/page.tsx`
```tsx
import LoginForm from "@/components/login-form"

export default function LoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string }
}) {
  const params = {
    redirect_uri: searchParams.redirect_uri || "",
    state: searchParams.state || "",
    code_challenge: searchParams.code_challenge || "",
    code_challenge_method: searchParams.code_challenge_method || "S256",
    client_id: searchParams.client_id || "",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-orange-500/10 px-3 py-1 rounded-full text-orange-400 text-xs font-bold mb-4 border border-orange-500/30">
            Factsheet × Upflow
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">로그인</h1>
          <p className="text-slate-400 text-sm">
            MCP 서버 연동을 위해 로그인하세요
          </p>
        </div>

        <LoginForm initialParams={params} />

        <div className="text-center mt-6 text-xs text-slate-500">
          💡 PoC 환경 — 아무 값이나 입력해도 통과합니다
        </div>
      </div>
    </div>
  )
}
```

### 6.3 `components/login-form.tsx`
```tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginForm({
  initialParams,
}: {
  initialParams: Record<string, string>
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    // PoC: 입력값 무시, select-company로 이동
    const params = new URLSearchParams(initialParams)
    router.push(`/select-company?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-2xl p-8 space-y-5"
    >
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input id="email" name="email" type="email" placeholder="user@example.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input id="password" name="password" type="password" placeholder="••••••••" required />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-base font-semibold"
      >
        {loading ? "처리 중..." : "로그인 →"}
      </Button>
    </form>
  )
}
```

### 6.4 `app/select-company/page.tsx`
```tsx
"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const COMPANIES = [
  { code: "AZFLOW", name: "AZFLOW Investment Partners" },
  { code: "DEMO_CAP", name: "Demo Capital" },
  { code: "TEST_VC", name: "Test Ventures" },
]

export default function SelectCompanyPage() {
  const searchParams = useSearchParams()
  const [selected, setSelected] = useState(COMPANIES[0].code)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    const redirect_uri = searchParams.get("redirect_uri") || ""
    const state = searchParams.get("state") || ""

    if (!redirect_uri) {
      alert("redirect_uri가 없습니다. 직접 접근한 경우입니다.")
      setLoading(false)
      return
    }

    // PoC: 가짜 code 생성
    const fakeCode = `fake_code_${Date.now()}`

    // redirect_uri로 이동
    const url = new URL(redirect_uri)
    url.searchParams.set("code", fakeCode)
    url.searchParams.set("state", state)
    url.searchParams.set("company_code", selected)

    window.location.href = url.toString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-orange-500/10 px-3 py-1 rounded-full text-orange-400 text-xs font-bold mb-4 border border-orange-500/30">
            Factsheet × Upflow
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">회사 선택</h1>
          <p className="text-slate-400 text-sm">소속 회사를 선택하세요</p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8 space-y-5">
          <RadioGroup value={selected} onValueChange={setSelected}>
            {COMPANIES.map((c) => (
              <Label
                key={c.code}
                htmlFor={c.code}
                className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-slate-50 cursor-pointer"
              >
                <RadioGroupItem value={c.code} id={c.code} />
                <span className="flex-1 cursor-pointer text-slate-900 font-medium">
                  {c.name}
                </span>
              </Label>
            ))}
          </RadioGroup>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-base font-semibold"
          >
            {loading ? "처리 중..." : "선택 완료 →"}
          </Button>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500">
          💡 PoC: 어느 회사 선택해도 가짜 code가 발급됩니다
        </div>
      </div>
    </div>
  )
}
```

### 6.5 `app/page.tsx` (안내 페이지)
```tsx
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-md">
        <h1 className="text-3xl font-bold mb-4">Factsheet MCP PoC</h1>
        <p className="text-slate-400">
          이 페이지는 Claude Desktop의 OAuth 흐름에서 자동으로 호출됩니다.
        </p>
        <p className="text-slate-500 text-sm mt-4">
          직접 접근하신 경우 <code className="bg-slate-800 px-2 py-1 rounded">/login</code>으로 이동하세요.
        </p>
      </div>
    </div>
  )
}
```

---

## 7. Vercel 배포 가이드

### 7.1 사전 준비
- [Vercel 계정](https://vercel.com) 생성
- GitHub 저장소에 코드 푸시

### 7.2 배포 단계

#### Step 1. GitHub 저장소 생성 + 푸시
```bash
cd poc_login_app
git init
git add .
git commit -m "Initial PoC login frontend"
git branch -M main

# GitHub에 새 레포 생성 후
git remote add origin https://github.com/{username}/poc-login-app.git
git push -u origin main
```

#### Step 2. Vercel 프로젝트 import
1. Vercel 대시보드 → **Add New** → **Project**
2. **Import Git Repository** → `poc-login-app` 선택
3. Framework Preset: **Next.js** (자동 감지)
4. **Deploy** 클릭

#### Step 3. 도메인 확인
배포 완료 후 Vercel이 자동으로 도메인 발급:
- 예: `https://poc-login-app.vercel.app`
- 또는: `https://poc-login-app-{username}.vercel.app`

Settings → Domains에서 커스텀 도메인 추가 가능 (선택).

#### Step 4. 환경변수 (선택)
Settings → Environment Variables:
```
NEXT_PUBLIC_MCP_SERVER_URL = https://mcp-poc-production.up.railway.app
```

> Note: 로그인 화면 동작에 필수는 아님. 디버그/표시용일 때만 추가.

#### Step 5. Railway MCP 서버에 Vercel URL 알리기
Railway 대시보드 → Variables:
```
LOGIN_URL = https://poc-login-app.vercel.app/login
```

→ MCP 서버 자동 재배포

### 7.3 배포 검증
브라우저로 `https://poc-login-app.vercel.app/login` 접근:
- 로그인 화면이 정상 표시되어야 함
- 폼 제출 시 `/select-company`로 이동 확인

---

## 8. 로컬 개발 가이드

### 8.1 실행
```bash
cd poc_login_app
npm install
npm run dev
# → http://localhost:3000
```

### 8.2 검증
브라우저로 다음 URL 직접 접근:
```
http://localhost:3000/login?redirect_uri=http://localhost:33418/callback&state=test123&code_challenge=abc&code_challenge_method=S256&client_id=fake
```

기대 동작:
- 로그인 화면 표시
- 폼 제출 → `/select-company` 이동 (파라미터 보존)
- 회사 선택 → `http://localhost:33418/callback?code=...&state=test123&company_code=AZFLOW`로 이동 시도

---

## 9. 디자인 시스템

### 9.1 컬러
```css
/* Tailwind 기본 클래스 활용 */
- 배경: bg-gradient-to-br from-slate-900 to-slate-800
- 액센트: bg-orange-500 hover:bg-orange-600
- 카드: bg-white rounded-xl shadow-2xl
- 텍스트: text-white / text-slate-900 / text-slate-400
```

### 9.2 타이포그래피
- 헤딩: `text-3xl font-bold`
- 본문: `text-sm` ~ `text-base`
- 라벨: `text-xs` (뱃지 등)

### 9.3 컴포넌트 일관성
- 버튼: `py-6 text-base font-semibold` (큰 버튼)
- 입력: shadcn/ui 기본 스타일
- 카드: `rounded-xl shadow-2xl p-8`

---

## 10. 검증 시나리오

### 시나리오 1: 직접 접근
- **입력**: 브라우저로 `https://poc-login-app.vercel.app/login` 직접 진입
- **기대**: 로그인 화면 정상 표시 (redirect_uri 없으니 회사 선택 후 alert)

### 시나리오 2: MCP 서버 경유
- **입력**: Claude Desktop에서 MCP 서버 추가 → 자동 redirect
- **기대**: 로그인 → 회사 선택 → Claude Desktop 자동 복귀

### 시나리오 3: 디자인 검증
- **입력**: 모바일/데스크탑에서 접근
- **기대**: 반응형 정상 동작, 브랜드 톤 일치

---

## 11. 위험 요소

| 항목 | 내용 | 대응 |
|---|---|---|
| `redirect_uri` 인코딩 | URL 인코딩 깨질 수 있음 | `URL` 객체 + `searchParams` 사용 |
| `redirect_uri` 누락 | 직접 접근 시 빈 값 | alert로 안내 |
| state 손실 | 페이지 이동 시 누락 | `URLSearchParams`로 명시적 보존 |
| Claude Desktop의 다양한 redirect_uri | localhost / claude.ai 등 다양 | 받은 값 그대로 echo |
| Vercel 빌드 실패 | TypeScript 에러 등 | `next build` 로컬 검증 후 푸시 |

---

## 12. 다음 단계 (PoC 통과 시)

1. 실제 Factsheet 백엔드와 연동 (가짜 폼 → 실제 인증)
2. session_id JWT 처리 추가
3. 에러 처리 (잘못된 자격증명 등)
4. 회사 목록을 API로 동적 조회
5. 로딩 상태 / 에러 토스트 등 UX 개선

---

## 13. 산출물 체크리스트

- [ ] Next.js 프로젝트 생성 (`create-next-app`)
- [ ] shadcn/ui 컴포넌트 설치 (Button, Input, Label, RadioGroup)
- [ ] `/login` 페이지 + LoginForm 컴포넌트
- [ ] `/select-company` 페이지 + RadioGroup
- [ ] 안내 페이지 (`/`)
- [ ] Tailwind 디자인 적용
- [ ] GitHub 저장소 생성 및 푸시
- [ ] Vercel 프로젝트 import 및 배포
- [ ] Vercel 도메인 발급
- [ ] Railway MCP 서버에 `LOGIN_URL` 환경변수 갱신
- [ ] 직접 URL 접근 테스트
- [ ] Claude Desktop end-to-end 테스트
