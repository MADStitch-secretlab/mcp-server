# Factsheet MCP Login PoC

Next.js 14 App Router 기반의 PoC 로그인 프론트엔드입니다. MCP 서버의 `/authorize` 리다이렉트로 진입한 사용자가 로그인 폼과 회사 선택을 거치면 Claude Desktop 콜백 URL로 가짜 인증 코드를 전달합니다.

## 실행

```bash
npm install
npm run dev
```

로컬 주소는 `http://localhost:3000`입니다.

## 검증 URL

```text
http://localhost:3000/login?redirect_uri=http%3A%2F%2Flocalhost%3A33418%2Fcallback&state=test123&code_challenge=abc&code_challenge_method=S256&client_id=fake
```

기대 흐름:

1. `/login`에서 이메일과 비밀번호 입력
2. `/select-company`로 모든 쿼리스트링 보존 이동
3. 회사 선택 후 `{redirect_uri}?code=fake_code_{timestamp}&state={state}&company_code={company}`로 이동

## 테스트 계정

계정 정보는 [`data/login-users.json`](./data/login-users.json)에 있습니다. 아이디 또는 이메일로 로그인할 수 있습니다.

| 아이디 | 이메일 | 비밀번호 |
| --- | --- | --- |
| `factsheet.admin` | `admin@factsheet.local` | `Factsheet!2026` |
| `upflow.demo` | `demo@upflow.local` | `Upflow!2026` |

## 환경변수

```bash
NEXT_PUBLIC_MCP_SERVER_URL=http://localhost:8000
```

Vercel 배포 값:

```bash
NEXT_PUBLIC_MCP_SERVER_URL=https://mcp-poc-production.up.railway.app
```

## PRD

원본 PRD는 [`PRD_Login_Frontend.md`](./PRD_Login_Frontend.md)에 보관되어 있습니다.
# mcp-server
