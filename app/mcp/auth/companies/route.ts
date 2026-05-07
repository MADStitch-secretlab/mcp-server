import { NextResponse } from "next/server"

import { getBearerToken, getCompaniesForToken } from "@/lib/mcp-auth"

export async function GET(request: Request) {
  const token = getBearerToken(request)

  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const companies = getCompaniesForToken(token)

  if (!companies) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  if (companies.length === 0) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  return NextResponse.json({ companies })
}
