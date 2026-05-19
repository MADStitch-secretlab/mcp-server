# Factsheet MCP Login PoC

Next.js 14 App Router 기반의 PoC 연결 프론트엔드입니다. `cb` URL로 Factsheet 토큰과 회사 코드를 POST한 뒤, 응답의 `redirect_url`로 브라우저를 돌려보냅니다.

## 실행

```bash
npm install
npm run dev
```

로컬 주소는 `http://localhost:3000`입니다.

## 검증 URL

새 MCP callback bridge 흐름은 루트 URL의 `cb` 쿼리를 사용합니다.

```text
http://localhost:3000/?cb=https%3A%2F%2Fexample.trycloudflare.com%2Foauth%2Fcallback%2Fstate123
```

`cb`가 있으면 `/login`으로 이동한 뒤, 사용자가 직접 입력한
`accessToken`, `refreshToken`, `companyCode`를 해당 URL로 JSON POST합니다.
응답의 `redirect_url`이 있으면 브라우저를 그 URL로 이동시킵니다.

기대 흐름:

1. `/?cb=...`로 진입
2. `/login?cb=...`로 이동
3. `/login`에서 `accessToken`, `refreshToken`, `companyCode` 직접 입력
4. `cb` URL로 JSON POST
5. 응답의 `redirect_url`로 브라우저 이동

## MCP Auth Backend API

MCP 서버가 회사 목록과 회사 전환 토큰을 조회할 수 있도록 프론트백에서 아래 API를 제공합니다.

```text
GET /mcp/auth/companies
POST /mcp/auth/token
```

요청에는 테스트용 Bearer token이 필요합니다.

```text
Authorization: Bearer fake_access_token_abc123
```

회사 데이터는 [`data/mcp-companies.json`](./data/mcp-companies.json)에 있습니다.

## Claude Desktop 연결 주의

Claude Desktop에는 프론트 로그인 URL이 아니라 MCP 서버 주소를 등록해야 합니다.

```text
http://localhost:8000/mcp
```

인증이 정상 시작되면 MCP 서버가 다음처럼 프론트로 이동시켜야 합니다.

```text
http://localhost:3000/?cb=https%3A%2F%2F...%2Foauth%2Fcallback%2Fstate
```

프론트는 OAuth `state`, PKCE, `redirect_uri`를 직접 조립하지 않습니다. `cb` 값 그대로 JSON POST하고, 응답의 `redirect_url`만 따라갑니다.

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
