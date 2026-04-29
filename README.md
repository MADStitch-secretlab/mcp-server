# Factsheet MCP Login PoC

Next.js 14 App Router 기반의 PoC 로그인 프론트엔드입니다. MCP 서버가 넘겨준 `redirectUrl`로 로그인 완료 후 브라우저를 돌려보냅니다.

## 실행

```bash
npm install
npm run dev
```

로컬 주소는 `http://localhost:3000`입니다.

## 검증 URL

```text
http://localhost:3000/login?redirectUrl=http%3A%2F%2Flocalhost%3A8000%2Flogin%2Fcallback%3Fstate%3Dtest123
```

기대 흐름:

1. `/login`에서 이메일과 비밀번호 입력
2. `/select-company`로 `redirectUrl` 보존 이동
3. 회사 선택 후 `redirectUrl`로 브라우저 이동

## 테스트 계정

계정 정보는 [`data/login-users.json`](./data/login-users.json)에 있습니다. 아이디 또는 이메일로 로그인할 수 있습니다.

| 아이디 | 이메일 | 비밀번호 |
| --- | --- | --- |
| `factsheet.admin` | `admin@factsheet.local` | `Factsheet!2026` |
| `upflow.demo` | `demo@upflow.local` | `Upflow!2026` |

## Claude Desktop 연결 주의

Claude Desktop에는 프론트 로그인 URL이 아니라 MCP 서버 주소를 등록해야 합니다.

```text
http://localhost:8000/mcp
```

인증이 정상 시작되면 MCP 서버의 `/authorize`가 다음처럼 프론트로 이동시켜야 합니다.

```text
http://localhost:3000/login?redirectUrl=https%3A%2F%2FMCP서버%2Flogin%2Fcallback%3Fstate%3D...
```

프론트는 `redirectUrl`을 직접 수정하지 않습니다. `code`, `state`, `redirect_uri`를 새로 조립하지 않고 회사 선택 완료 시 `window.location.href = redirectUrl`만 수행합니다.

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
