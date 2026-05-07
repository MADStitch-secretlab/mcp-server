import { NextResponse } from "next/server"

import { getBearerToken, switchCompanyForToken } from "@/lib/mcp-auth"

type CompanySwitchPayload = {
  company_code?: unknown
  grant_type?: unknown
}

export async function POST(request: Request) {
  const token = getBearerToken(request)

  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  let payload: CompanySwitchPayload

  try {
    payload = (await request.json()) as CompanySwitchPayload
  } catch {
    return NextResponse.json(
      { error: "bad_request", message: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    )
  }

  const companyCode =
    typeof payload.company_code === "string" ? payload.company_code : ""

  if (!companyCode) {
    return NextResponse.json(
      { error: "bad_request", message: "company_code가 필요합니다." },
      { status: 400 },
    )
  }

  const result = switchCompanyForToken(token, companyCode)

  if (result.status === "unauthorized") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  if (result.status === "forbidden") {
    return NextResponse.json(
      { error: "forbidden", message: "해당 회사에 접근 권한이 없습니다." },
      { status: 403 },
    )
  }

  return NextResponse.json({
    access_token: token,
    token_type: "Bearer",
    expires_in: 3600,
    current_company_code: result.company.company_code,
    company: result.company,
  })
}
